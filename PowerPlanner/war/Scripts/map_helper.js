var g_map; /* The main map */
var g_heatmap; /* The heatmap layer for the main map */

var wind_data = []; /* The wind data for the current heatmap view */
var solar_data = []; /* The solar data for the current heatmap view */
var hydro_data = []; /* The hydro data for the current heatmap view */
var streams_data = []; /* The streams data for where to draw hydro */

/* Raw data cache */
var wind_cache = [];
var solar_cache = [];
var hydro_cache = [];

/* calculated wind data's boundary */
var wind_data_bounds = {
				neLat: 0,
				neLng: -180,
				swLat: 90,
				swLng: 180
};

var SMALL_VIEW = 0 /* State variable for have a small view (very zoomed in) */
var AVE_VIEW = 1; /* State variable for having an average view */
var WIDE_VIEW = 2; /* State variable for having a wide view (zoomed out) */
var OVER_VIEW = 3; /* State variable for having a super wide view */
var CHANGETO_AVE_VIEW = 14; /* Zoom level where SMALL changes to AVE state */
var CHANGETO_WIDE_VIEW = 12; /* Zoom level where AVE changes to WIDE state */
var CHANGETO_OVER_VIEW = 10; /* Zoom level where WIDE changes to OVER state */

var LEAST_ZOOM = 8; /* Farthest out the user can zoom */
var MAX_ZOOM = 15; /* Farthest in the user can zoom */
var DEFAULT_ZOOM = 14; /* Starting zoom level */
var MAX_DATA_WIDTH = 0.32; /* Width of interpolating points (LEAST_ZOOM = 8) */

var WEIGHT_SCALING_DISTANCE = 0.06651; /* Data point further away has less impact */
var SOLAR_SCALING_DISTANCE = 1; /* Data point further away may have less impact */

var MIN_DISPLAY_WEIGHT = 0.01; /* Don't add a point with less weight to heatmap */

var WIND_SCALER = 12;
var SOLAR_SCALER = 3.3;
var HYDRO_SCALER = 500;
var scaler = WIND_SCALER;

var POINT_DEBUGGER = false; /* true = view data points instead of interpolation */

//View (or zoom) state of the map; used to implement different time saving
//measures
var view_state = (DEFAULT_ZOOM <= CHANGETO_WIDE_VIEW ? 
		(DEFAULT_ZOOM <= CHANGETO_OVER_VIEW ? OVER_VIEW : WIDE_VIEW) : 
			(DEFAULT_ZOOM <= CHANGETO_AVE_VIEW ? AVE_VIEW : SMALL_VIEW));

/*
 * This example adds a search box to a map, using the Google Place Autocomplete
 * feature. People can enter geographical searches. The search box will return a
 * pick list containing a mix of places and predicted search terms.
 */
function initializeMap() {
	var map = new google.maps.Map(document.getElementById('googleMap'), {
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		zoom : DEFAULT_ZOOM,
		maxZoom : MAX_ZOOM,
		minZoom : LEAST_ZOOM,
		streetViewControl : false,
		scaleControl : true,
		center : new google.maps.LatLng(48.4647, -123.3085),
		styles : [ {
			featureType : "poi",
			elementType : "labels",
			stylers : [ {
				visibility : "off"
			} ]
		} ]
	});

	return map;
}

/*
 * Initializes the map, heatmap, and important event listeners.
 */
function mapLoader() {
	g_map = initializeMap();
	g_heatmap = initHeatmap(g_map);
	
	initializeMarkers(g_map);
	showHelpMarker();
	searchBoxIntro = initializeSearchBox(g_map, false, 'pac-input-intro');
	searchBox = initializeSearchBox(g_map, true, 'pac-input');

	attachHeatmap(g_heatmap, g_map);

	// Load heatmap data when map is dragged
	google.maps.event.addListener(g_map, 'dragend', _eventHeatmapDataToggler);
	// Modify zoom state overhead when map is zoomed; load heatmap data
	google.maps.event.addListener(g_map, 'zoom_changed', function() {
		zoom = g_map.getZoom();
		view_state = (zoom <= CHANGETO_WIDE_VIEW ? 
				(zoom <= CHANGETO_OVER_VIEW ? OVER_VIEW: WIDE_VIEW) : 
					(zoom <= CHANGETO_AVE_VIEW ? AVE_VIEW : SMALL_VIEW));
		console.log("View state: " + view_state);
		_eventHeatmapDataToggler();
	});
	// Bias the SearchBox results towards places that are within the bounds of
	// the current map's viewport.
	google.maps.event.addListener(g_map, 'bounds_changed', function() {
		var bounds = g_map.getBounds();
		searchBox.setBounds(bounds);
	});
}

/*
 * Reloads toggled map data; for use in event handlers.
 */
function _eventHeatmapDataToggler() {
	toggleHeatmapData($("#showCheckboxWind").is(':checked'), $(
	"#showCheckboxSolar").is(':checked'), $("#showCheckboxHydro").is(
	':checked'));
}

/*
 * Map data toggle function. Takes boolean values for turning different energy
 * types on and off.
 */
function toggleHeatmapData(showWind, showSolar, showHydro) {
	wind_data = [];
	solar_data = [];
	hydro_data = [];
	streams_data = [];

	var neLat = getNELatitude(g_map);
	var neLng = getNELongitude(g_map);
	var swLat = getSWLatitude(g_map);
	var swLng = getSWLongitude(g_map);

	// throttle to prevent multiple requests at the same time
	if (showWind) {
		_.throttle(_getHeatmapData("WIND", neLat, neLng, swLat, swLng),500,{leading:false});
	}

	if (showSolar) {
		_.throttle(_getHeatmapData("SOLAR", neLat, neLng, swLat, swLng),500,{leading:false});
	}

	if (showHydro) {
		_.throttle(_getHeatmapData("HYDRO", neLat, neLng, swLat, swLng),500,{leading:false});
	}

	if (!showWind && !showSolar && !showHydro) {
		updateHeatmap();
	}
}

/*
 * Sends a POST request to the server for data within the provided latitude and
 * longitude bounds of a particular type. Acceptable types are WIND, SOLAR, and
 * HYDRO. Triggers a heatmap update upon server response.
 */
function _getHeatmapData(type, neLat, neLng, swLat, swLng) {
	console.time("_getHeatmapData");
	var lat_offset = getLatOffset(neLat, swLat);
	var lng_offset = getLngOffset(neLng, swLng);

	// requested grid
	var neLat_w_off = (neLat + lat_offset);
	var neLng_w_off = (neLng + lng_offset);
	var swLat_w_off = (swLat - lat_offset);
	var swLng_w_off = (swLng - lng_offset);
	var neLat_floor = Math.floor(neLat_w_off);
	var neLng_floor = Math.floor(neLng_w_off);
	var swLat_floor = Math.floor(swLat_w_off);
	var swLng_floor = Math.floor(swLng_w_off);

	console.log("neLat: " + neLat_w_off);
	console.log("neLng: " + neLng_w_off);
	console.log("swLat: " + swLat_w_off);
	console.log("swLng: " + swLng_w_off);

	// Check whether cache has the requested data
	var in_cache = false;
	console.log("CHECKING CACHE");
	if (type == "WIND") {
		// Check whether data is available in cache
		if (wind_cache.length > 0) {
			console.log("CHECKING WIND CACHE");
			
			for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
				if (typeof wind_cache[lat] != 'undefined') {
					for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
						if (typeof wind_cache[lat][lng] != 'undefined') {
							in_cache = true;
						} else {
							in_cache = false;
							break;
						}
					}
				} else {
					in_cache = false;
					break;
				}
				if (!in_cache) {
					break;
				}
			}
		}
	} else if (type == "SOLAR") {
		console.log("CHECKING SOLAR CACHE");
		if(solar_cache.length > 0) {
			in_cache = true;
		}
	} else if (type == "HYDRO") {
		console.log("CHECKING HYDRO CACHE");
		if(hydro_cache.length > 0) {
			in_cache = true;
		}
	}

	if(in_cache) {
		console.log("IN CACHE");
		if (type == "WIND") {
			console.log("ACCESSING WIND CACHE");
			var new_data = [];
			for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
				for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
					new_data = new_data.concat(wind_cache[lat][lng]);
				}
			}
			updateData(new_data, neLat, neLng, swLat, swLng, type);
			updateHeatmap();
		} else if (type == "SOLAR") {
			console.log("ACCESSING SOLAR CACHE");
			updateData(solar_cache, neLat, neLng, swLat, swLng, type);
			updateHeatmap();			
		} else if (type == "HYDRO") {
			console.log("ACCESSING HYDRO CACHE");
			updateData(hydro_cache, neLat, neLng, swLat, swLng, type);
			updateHeatmap();
		}
		console.timeEnd("_getHeatmapData");
	} else {
		$.ajax({
			// url : '/powerplanner',
			url : '/powerdb',
			type : 'POST',
			data : {
				type : type,
				neLat : neLat_w_off,
				neLng : neLng_w_off,
				swLat : swLat_w_off,
				swLng : swLng_w_off,
				season : "anu"
			},
			dataType : 'json',
			success : function(data, status) {
				if (status) {
					console.log("Total Data Points: " + data.length);
					// console.log(data);

					// Cache all points
					if (type == "WIND") {
						// do binning here
						for(var i = 0; i < data.length; i++) {
							if(typeof wind_cache[data[i].grid.swLat] == 'undefined') {
								wind_cache[data[i].grid.swLat] = [];
							}
							wind_cache[data[i].grid.swLat][data[i].grid.swLng] = data[i];
						}
						// wind_cache = _.union(wind_cache,data);
					} else if (type == "SOLAR") {
						solar_cache = _.union(solar_cache,data);
					} else if (type == "HYDRO") {
						hydro_cache = _.union(hydro_cache,data);
					}

					updateData(data, neLat, neLng, swLat, swLng, type);
				}
				else {
					console.log("Status: " + status);
				}
			},
			error : function(thing, status, error) {
				console.log("Error!");
				console.log(status);
				console.log(error);
			},
			complete : function() {
				updateHeatmap();
				console.timeEnd("_getHeatmapData");
			}
		});
	}
}

/*
 * Gets the latitude offset for the provided latitude bounds based off the map's
 * current global view state.
 */
function getLatOffset(northLat, southLat) {
	var lat_offset = (northLat - southLat);
	if (view_state == WIDE_VIEW) {
		lat_offset = lat_offset / 4;
	} else if (view_state == SMALL_VIEW) {
		lat_offset = lat_offset * 2;
	} else if (view_state == OVER_VIEW) {
		lat_offset = lat_offset / 8;
	}
	return lat_offset;
}

/*
 * Gets the longitude offset for the provided longitude bounds based off the
 * map's current global view state.
 */
function getLngOffset(eastLng, westLng) {
	var lng_offset = (eastLng - westLng);
	if (view_state == WIDE_VIEW) {
		lng_offset = lng_offset / 4;
	} else if (view_state == SMALL_VIEW) {
		lng_offset = lng_offset * 2;
	} else if (view_state == OVER_VIEW) {
		lng_offset = lng_offset / 8;
	}
	return lng_offset;
}

/*
 * TODO: Add in other metrics for calculations.
 */
function _filterWindData(raw_data, push_data, neLat, neLng, swLat, swLng) {
	for (var grid = 0; grid < raw_data.length; grid++) {
		for (var i = 0; i < raw_data[grid].data.length; i++) {
			if (raw_data[grid].data[i].lat > swLat && raw_data[grid].data[i].lat < neLat) {
				if (raw_data[grid].data[i].lon > swLng && raw_data[grid].data[i].lon < neLng) {
					push_data.push({
						lat : raw_data[grid].data[i].lat,
						lng : raw_data[grid].data[i].lon,
						weight : windPow(raw_data[grid].data[i].pre15,0.34,290)
					});
				}
			}
		}
	}
}

/*
 * There's not enough data to worry about not keeping it.
 * TODO: Add in other metrics for calculations.
 */
function _filterSolarData(raw_data, push_data) {
	for (var i = 0; i < raw_data.length; i++) {
		push_data.push({
			lat : raw_data[i].lat,
			lng : raw_data[i].lon,
			weight : solarPow(raw_data[i].deg45,0.9,1,0.75)
		});
	}
}

/*
 * There's not enough data to worry about not keeping it.
 * If stream info is here, add it to the stream array (if it's not already full ...
 * we'll ignore stream data if the stream array already contains points)
 * 
 * TODO: Add in other metrics for calculations.
 */
function _filterHydroData(raw_data, push_data, neLat, neLng, swLat, swLng) {
	for (var i = 0; i < raw_data.length; i++) {
		if (raw_data[i].hasOwnProperty('points')) {
			if (raw_data[i].points[0].lat > swLat && raw_data[i].points[0].lat < neLat) {
				if (raw_data[i].points[0].lon > swLng && raw_data[i].points[0].lon < neLng) {
					streams_data.push(raw_data[i].points);
				}
			}
		} else {
			push_data.push({
				lat : raw_data[i].lat,
				lng : raw_data[i].lon,
				weight : hydroPow(raw_data[i].precalc,0.9,15)
			});
		}
	}
}

/*
 * Gets the data weight for a given point on the map by applying a weighted
 * average to the four nearest data points (or if fewer than four data points,
 * using all the ones available).
 */
function _getDataWeightWind(hm_data, lat, lng) {
	var nearest = [];
	var nearest_distance = [];

	for (var i = 0; i < hm_data.length; i++) {
		if (nearest.length < 4) {
			// Trivial case; populate the first 4 nearest
			nearest.push(hm_data[i]);
			nearest_distance.push(distanceTo(lat, lng, hm_data[i].location
					.lat(), hm_data[i].location.lng()));
		} else {
			var dist_to_i = distanceTo(lat, lng, hm_data[i].location.lat(),
					hm_data[i].location.lng());
			var furthest_near_point = getArrayMax(nearest_distance);
			if (dist_to_i < furthest_near_point) {
				for (var j = 0; j < nearest_distance.length; j++) {
					if (nearest_distance[j] == furthest_near_point) {
						nearest[j] = hm_data[i];
						nearest_distance[j] = dist_to_i;
						break;
					}
				}
			}
		}
	}

	var final_weight = 0;
	if (nearest.length > 0) {
		var dist_sum = nearest_distance.reduce(function(a, b) {
			return a + b;
		});

		for (var i = 0; i < nearest.length; i++) {
			var dist_scaling = Math.pow(WEIGHT_SCALING_DISTANCE
					/ nearest_distance[i], 4);
			if (dist_scaling > 1) {
				dist_scaling = 1;
			}
			final_weight += (nearest[i].weight
					* (1 - nearest_distance[i] / dist_sum) * dist_scaling);
			// final_weight += ((1 - (nearest_distance[i] / dist_sum))
			// * (nearest[i].weight / weight_max));
		}

	}
	return (nearest.length > 0 ? final_weight / nearest.length : 0);
}

function _getDataWeightSolar(hm_data, lat, lng) {
	var nearest = [];
	var nearest_distance = [];

	var data_bins = [ [], [], [], [] ];

	for (var i = 0; i < hm_data.length; i++) {
		if (lat >= hm_data[i].location.lat()) {
			if (lng >= hm_data[i].location.lng()) {
				data_bins[0].push(hm_data[i]);
			} else {
				data_bins[3].push(hm_data[i]);
			}
		} else {
			if (lng >= hm_data[i].location.lng()) {
				data_bins[1].push(hm_data[i]);
			} else {
				data_bins[2].push(hm_data[i]);
			}
		}
	}

	// Find nearest point in each bin (or find nothing if empty bin)
	for (var i = 0; i < data_bins.length; i++) {
		for (var j = 0; j < data_bins[i].length; j++) {
			if (nearest.length < (i+1)) {
				// Trivial case; the first point looked at is the nearest so far
				nearest.push(data_bins[i][j]);
				nearest_distance.push(distanceTo(lat, lng, data_bins[i][j].location
						.lat(), data_bins[i][j].location.lng()));
			} else {
				var dist_to_j = distanceTo(lat, lng, data_bins[i][j].location
						.lat(), data_bins[i][j].location.lng())
						if (dist_to_j < nearest_distance[i]) {
							nearest[i] = data_bins[i][j];
							nearest_distance[i] = dist_to_j;
						}
			}
		}
	}
	/*
	console.log("Lat: " + lat + " Lng: " + lng);
	for (var i = 0; i < nearest.length; i++) {
		console.log("Near point Lat: " + nearest[i].location.lat() + 
				" Lng: " + nearest[i].location.lng() + " Distance: " +
				nearest_distance[i]);
	}
	 */

	var final_weight = 0;
	if (nearest.length > 0) {
		var dist_sum = nearest_distance.reduce(function(a, b) {
			return a + b;
		});

		for (var i = 0; i < nearest.length; i++) {
			var dist_scaling = Math.pow(SOLAR_SCALING_DISTANCE / nearest_distance[i],
					4 - nearest.length + 1);
			if (dist_scaling > 1) {
				dist_scaling = 1;
			}

			final_weight += (nearest[i].weight * (1 - nearest_distance[i] / dist_sum)
					* dist_scaling);
		}
	}

	return (nearest.length > 0 ? final_weight / nearest.length : 0);
}

function _getDataWeightHydro(hm_data, lat, lng) {
	var final_weight = 0;
	// go through each stream in the streams set
	for (var i = 0; i < streams_data.length; i++) {
		// TODO: In the future, account for more than two points
		if (pointOnLine(lat, lng, streams_data[i][0], streams_data[i][1])) {
			// if point lies *roughly* along the line of a stream, find the nearest
			// 2 hydro stations; take a weighted average of their monitoring, and
			// draw point with that weight

			// Right now, only looks for the one closest stations
			var nearest_distance;
			var nearest_weight;
			for (var j = 0; j < hm_data.length; j++) {
				if (j == 0) {
					//Trivial case, the best so far is the first
					nearest_distance = distanceTo(lat, lng, 
							hm_data[j].location.lat(), hm_data[j].location.lng());
					nearest_weight = hm_data[j].weight;
				} else {
					var next_dist = distanceTo(lat, lng, 
							hm_data[j].location.lat(), hm_data[j].location.lng());
					if (next_dist < nearest_distance) {
						nearest_distance = next_dist;
						nearest_weight = hm_data[j].weight;
					}
				}
			}
			final_weight = nearest_weight;
			break;
		}
	}

	return final_weight;
}

/*
 * Returns true if distance from the lat, lng point is less than the current diameter
 * of the heatmap spots away from the line represented by point1, point2 (if the point
 * lies inside the boundary formed by the points)
 */
function pointOnLine(lat, lng, point1, point2) {
	var is_on_line = false;

	if (lat > Math.min(point1.lat, point2.lat) && lat < Math.max(point1.lat, point2.lat)) {
		if (lng > Math.min(point1.lon, point2.lon) && lng < Math.max(point1.lon, point2.lon)) {
			/*
		 	var slope = (point2.lat - point1.lat)/(point2.lon - point1.lon);
			var A = slope * (-1);
			var B = 1;
			var C = (A * point1.lon + B) * (-1);

			var numer = Math.abs(A*lng + B*lat + C);
			var denom = Math.sqrt(Math.pow(A,2) + Math.pow(B,2));

			var distance = (numer/denom);
			is_on_line = (distance <= 
				MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.98 * 2);
			console.log(distance);
			console.log(MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.98 * 2);
			 */
			// The above can't get close enough to ever return true with our granularity ...
			is_on_line = true;
		}
	}

	return is_on_line;
}

/*
 * Find the distance from one provided point to another (assumes latitude and
 * longitude cover the same distance).
 */
function distanceTo(src_lat, src_lng, dest_lat, dest_lng) {
	var a = Math.pow((src_lat - dest_lat), 2);
	var b = Math.pow((src_lng - dest_lng), 2);

	return (Math.sqrt(a + b));
}

/*
 * Initializes heatmap with current basic settings.
 */
function initHeatmap(map) {
	var heatmap = new google.maps.visualization.HeatmapLayer({
		maxIntensity : 1,
		map : map,
		radius : MAX_DATA_WIDTH / Math.pow(2, (DEFAULT_ZOOM - LEAST_ZOOM))
		* 0.98,
		dissipating : false,
		opacity : 0.4,
		gradient : [ 'rgba(0,0,0,0)', 'rgba(0,50,100,1)', 'rgba(0,75,200,1)', 
		             'rgba(0,127,255,1)', 'rgba(0,159,255,1)', 'rgba(0,191,255,1)',
		             'rgba(0,223,255,1)', 'rgba(0,255,255,1)', 'rgba(20,255,191,1)',
		             'rgba(50,255,127,1)', 'rgba(75,255,0,1)', 'rgba(120,255,0,1)',
		             'rgba(175,255,0,1)', 'rgba(200,255,0,1)', 'rgba(255,220,0,1)',
		             'rgba(255,180,0,1)', 'rgba(255,120,0,1)', 'rgba(255,0,0,1)']
	});

	return heatmap;
}

/*
 * Attach a heatmap to a map.
 */
function attachHeatmap(heatmap, map) {
	heatmap.setMap(map);
}

/*
 * Updates the global heatmap with the global data arrays.
 */
function updateHeatmap() {
	var hm_data = wind_data;
	hm_data = hm_data.concat(solar_data);
	hm_data = hm_data.concat(hydro_data);

	if (!POINT_DEBUGGER) {
		g_heatmap.set('radius', MAX_DATA_WIDTH
				/ Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.98);
	}

	console.log("Points on map: " + hm_data.length);

	_updateHeatmap(g_heatmap, hm_data);
}

/*
 * Updates the provided heatmap with the provided array of heatmap data points.
 */
function _updateHeatmap(heatmap, hm_data) {
	var datapoints = new google.maps.MVCArray(hm_data);
	heatmap.setData(datapoints);
}

/*
 * Adds a heatmap data point with specified latitude, longitude, and weighting
 * (between 0 and 1) to the provided array.
 */
function addHeatmapCoord(hm_data, lat, lng, weight) {
	hm_data.push({
		location : new google.maps.LatLng(lat, lng),
		weight : weight
	});

	return hm_data;
}

/*
 * Gets the latitude of the southwest map boundary.
 */
function getSWLatitude(map) {
	return map.getBounds().getSouthWest().lat();
}

/*
 * Gets the longitude of the southwest map boundary.
 */
function getSWLongitude(map) {
	return map.getBounds().getSouthWest().lng();
}

/*
 * Gets the latitude of the northeast map boundary.
 */
function getNELatitude(map) {
	return map.getBounds().getNorthEast().lat();
}

/*
 * Gets the longitude of the northeast map boundary.
 */
function getNELongitude(map) {
	return map.getBounds().getNorthEast().lng();
}

/*
 * Gets the maximum value in an array of numbers.
 */
function getArrayMax(number_array) {
	return Math.max.apply(null, number_array);
}

/*
 * Gets the minimum value in an array of numbers.
 */
function getArrayMin(number_array) {
	return Math.min.apply(null, number_array);
}

/*
 * Map setup entry point.
 */
google.maps.event.addDomListener(window, 'load', mapLoader);

/*
 * Map resize on window resize.
 */
google.maps.event.addDomListener(window, 'resize', function() {
	if (g_map) {
		var center = g_map.getCenter();
		google.maps.event.trigger(g_map, 'resize');
		g_map.setCenter(center);
	}
});
