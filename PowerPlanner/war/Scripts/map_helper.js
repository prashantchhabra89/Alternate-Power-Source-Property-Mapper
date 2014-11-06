var g_map; /* The main map */
var g_heatmap; /* The heatmap layer for the main map */

var wind_data = []; /* The wind data for the current heatmap view */
var solar_data = []; /* The solar data for the current heatmap view */
var hydro_data = []; /* The hydro data for the current heatmap view */

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

var WEIGHT_SCALING_DISTANCE = 0.06651; /* Data points further away have less impact */
var MIN_DISPLAY_WEIGHT = 0.005; /* Don't add a point with less weight to heatmap */

var scaler = 500;

var POINT_DEBUGGER = false; /* true = view data points instead of interpolation */

// View (or zoom) state of the map; used to implement different time saving measures
var view_state = (DEFAULT_ZOOM <= CHANGETO_WIDE_VIEW 
		? (DEFAULT_ZOOM <= CHANGETO_OVER_VIEW ? OVER_VIEW : WIDE_VIEW)
		: (DEFAULT_ZOOM <= CHANGETO_AVE_VIEW ? AVE_VIEW : SMALL_VIEW));

var markerBalloon // this is the balloon for the marker.
//var marker // this is the marker dropped by right click

/*
 * This example adds a search box to a map, using the Google Place Autocomplete
 * feature. People can enter geographical searches. The search box will return a
 * pick list containing a mix of places and predicted search terms.
 */
function initialize() {

	var markers = [];
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
	
	// *********************************************************************************************
	// ********************************** Code by Charlie ******************************************
	// *********************************************************************************************
	// ******* The terms "info window", "balloon" and "bubble" are used interchangeably. ***********
	
	// the following adds an info window (bubble) to the map upon right click. 
	// Until now, the marker is not created yet.
	// Yes, we created a bubble first, then we created a marker.
	// markerBalloon is declared global.
	markerBalloon = new google.maps.InfoWindow();
	
	
	// Code for get rid of top-left bug. Doesn't affect functions.
	// Explanation:
	// When an info window is created, it is not tied with any marker.
	// When it is first tied with a marker, and the function "marker.open(position)" is called, 
	// the info window will be shown at the top left corner instead of at "position" parameter
	// for a very brief moment with its proper content. Wouldn't be a big problem if the bubble
	// doesn't contain a lot of information to display; but in our case, the bubble has several lines,
	// so that can be a problem. (Real big bubble flashes at an inappropriate place)
	// This behavior is probably not designed by google on purpose. I would say this is a bug from google;
	// however there is a solution.
	
	// Solution is here: before tying our bubble to the proper marker created by a right click, 
	// we first tie our bubble with a temporary marker called "testMarker". 
	// Then we tell the bubble to open at position "null", so the bubble is not actually shown with
	// testMarker. But since the bubble is tied with a marker already, re-tying it with another one
	// won't cause the "top left flash" bug anymore. 
	
	// create a temporary marker.
	testMarker = new google.maps.Marker({
		position:map.getCenter(),
		map : map,
		icon : "http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png"		
	});
	// tie our balloon with the temporary marker.
	markerBalloon.setContent("1");
	markerBalloon.open(map, testMarker);
	
	// don't show our test marker.
	testMarker.setVisible(false);
	// call .open() function, but with position = null, so we call open() and purposely show nothing.
	// after this, the balloon won't be shown at top left for a brief moment anymore.
	markerBalloon.open(null);
	// end of the top-left thing.
	
	
	map.addListener('rightclick', function(event) {
		addMarker(event.latLng);

	});
			
	function addMarker(loc) {
		marker = new google.maps.Marker({
			position : loc,
			map : map,
			icon : "http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png"		
		});

		// the object handle returned from the current fake function.
		var fakeObject = getPointData(marker.getPosition().lat(), marker.getPosition().lng());
		
		// note that the numeric value returned are rounded to 3 digits. Change this if needed.
		var latPosition = marker.getPosition().lat().toFixed(3).toString();
		var lngPosition = marker.getPosition().lng().toFixed(3).toString();

		
		// this is the bubble displayed when pin is dropped
		// the function balloonText() is called to get the string displayed in the balloon.
		markerBalloon.setContent(balloonText(fakeObject, latPosition, lngPosition));		
		markerBalloon.open(map, marker);
				
		// this is the bubble displayed when pin is left-clicked.
		// left click to toggle the bubble.
		// BUG: for now, clicking ANY marker will toggle the bubble.
		
		// FOR MILESTONE 3: 
		// need to make change to the logic here, so that when Pin A's bubble is showing, click Pin B will show B's bubble,
		// instead of having to click any marker once, and then click B.
		marker.addListener('click', function() {
			// if the current balloon is closed
			if (markerBalloon.getContent()=="") {
				markerBalloon.setContent(balloonText(fakeObject, latPosition, lngPosition));
				markerBalloon.open(map, this);	

			} else {
				// the balloon is open.
				// and the balloon is tied to our marker being clicked.
				console.log("1");
				markerBalloon.setContent("");
				markerBalloon.open(null, null);	
			}
				
													
		});
		
		// right click on a marker to remove the pin.
		marker.addListener('rightclick', function() {
			// didn't actually delete or close the marker, just set it to invisible.
			this.setVisible(false);
			// the balloon is really closed.
			markerBalloon.setContent("");
			markerBalloon.close();
		});
	}
	
	// the function to return the string to be displayed in the balloon.
	// this function exists to factor out some code in the previous section.
	// numeric values are rounded to 2 digits. change this if needed.
	function balloonText(objectHandle, lat, lng) {
		var balloonString = "<h2>Detailed Energy Data</h2>" +
							"<h3>Latitude: " + lat + "</h3>" + 
							"<h3>Longitute: " + lng + "</h3>" +
							"<p>Wind Energy: " + objectHandle.wind_raw.toFixed(2).toString() + "</p>" + 
							"<p>Solar Energy: " + objectHandle.solar_raw.toFixed(2).toString() + "</p>" +
							"<p>Hydro Energy: " + objectHandle.hydro_raw.toFixed(2).toString() + "</p>" +
							"<h4>Total Energy: " + objectHandle.total_energy.toFixed(2).toString() + "</h4>" +
							"<p><i>Right click on the pin to remove pin.</i></p>";
		return balloonString;
	}
	
	
	// ********************************************************************************************************
	// ********************************** End of Charlie's Code ***********************************************
	// ********************************************************************************************************

	var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(
			48.4647, -123.3085), new google.maps.LatLng(48.4647, -123.3085));
	map.fitBounds(defaultBounds);

	// Create the search box and link it to the UI element.
	var input = /** @type {HTMLInputElement} */
	(document.getElementById('pac-input'));
	var inputIntro = /** @type {HTMLInputElement} */
	(document.getElementById('pac-input-intro'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	var searchBox = new google.maps.places.SearchBox(
	/** @type {HTMLInputElement} */
	(input));
	var searchBoxIntro = new google.maps.places.SearchBox(
	/** @type {HTMLInputElement} */
	(inputIntro));

	// [START region_getplaces]
	// Listen for the event fired when the user selects an item from the
	// pick list. Retrieve the matching places for that item.
	google.maps.event.addListener(searchBox, 'places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}
		for (var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}

		// For each place, get the icon, place name, and location.
		markers = [];
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) {
			var image = {
				url : place.icon,
				size : new google.maps.Size(71, 71),
				origin : new google.maps.Point(0, 0),
				anchor : new google.maps.Point(17, 34),
				scaledSize : new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			var marker = new google.maps.Marker({
				map : map,
				icon : image,
				title : place.name,
				position : place.geometry.location
			});

			markers.push(marker);

			bounds.extend(place.geometry.location);
		}

		map.fitBounds(bounds);
	});
	// [END region_getplaces]

	// Bias the SearchBox results towards places that are within the bounds of
	// the
	// current map's viewport.
	google.maps.event.addListener(map, 'bounds_changed', function() {
		var bounds = map.getBounds();
		searchBox.setBounds(bounds);
	});

	return map;
}


/*
 * Initializes the map, heatmap, and important event listeners.
 */
function mapLoader() {
	g_map = initialize();
	g_heatmap = initHeatmap(g_map);

	attachHeatmap(g_heatmap, g_map);

	google.maps.event.addListener(g_map, 'dragend', _eventHeatmapDataToggler);
	google.maps.event.addListener(g_map, 'zoom_changed', function() {
		zoom = g_map.getZoom();
		view_state = (zoom <= CHANGETO_WIDE_VIEW 
				? (zoom <= CHANGETO_OVER_VIEW ? OVER_VIEW : WIDE_VIEW)
				: (zoom <= CHANGETO_AVE_VIEW ? AVE_VIEW : SMALL_VIEW));
		console.log("View state: " + view_state);
		_eventHeatmapDataToggler();
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

	var neLat = getNELatitude(g_map);
	var neLng = getNELongitude(g_map);
	var swLat = getSWLatitude(g_map);
	var swLng = getSWLongitude(g_map);

	if (showWind) {
		_getHeatmapData("WIND", neLat, neLng, swLat, swLng);
	}

	if (showSolar) {
		_getHeatmapData("SOLAR", neLat, neLng, swLat, swLng);
	}

	if (showHydro) {
		_getHeatmapData("HYDRO", neLat, neLng, swLat, swLng);
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
	var lat_offset = getLatOffset(neLat, swLat);
	var lng_offset = getLngOffset(neLng, swLng);
	wind_data = [];
	solar_data = [];
	hydro_data = [];

	$.ajax({
		url : '/powerplanner',
		type : 'POST',
		data : {
			type : type,
			neLat : neLat + lat_offset,
			neLng : neLng + lng_offset,
			swLat : swLat - lat_offset,
			swLng : swLng - lng_offset
		},
		dataType : 'json',
		success : function(data, status) {
			if (status) {
				var weight_points = [];
				for (var i = 0; i < data.length; i++) {
					weight_points.push(data[i].weight);
				}
				var topval = getArrayMax(weight_points);
				console.log("Scaler: " + scaler);
				console.log("Top val: " + topval);
				console.log("Zoom: " + g_map.getZoom());

				hm_data = [];
				for (var i = 0; i < data.length; i++) {
					addHeatmapCoord(hm_data, data[i].lat, data[i].lng,
							data[i].weight / scaler);
				}
				if (type == "WIND") {
					if (POINT_DEBUGGER) {
						wind_data = hm_data;
					} else {
						console.time('_interpolateData');
						wind_data = _interpolateData(hm_data, neLat, neLng,
								swLat, swLng);
						console.timeEnd('_interpolateData');
					}
				} else if (type == "SOLAR") {
					if (POINT_DEBUGGER) {
						solar_data = hm_data;
					} else {
						solar_data = _interpolateData(hm_data, neLat, neLng,
								swLat, swLng);
					}
				} else if (type == "HYDRO") {
					hydro_data = hm_data;
				}
			}
		},
		complete : function() {
			updateHeatmap();
		},
	});
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
 * Gets the longitude offset for the provided longitude bounds based off the map's
 * current global view state.
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
 * Fills in a grid of all the points visible on the screen as defined by the
 * provided boundary coordinates (with a little bit of bleed over the boundaries
 * to prevent visible edge discolouration) by interpolating values from the
 * provided set of real data points based on a weighting algorithm. Returns the
 * set of interpolated values. Runs the interpolation in bins if the map view
 * is too large.
 */
function _interpolateData(hm_data, neLat, neLng, swLat, swLng) {
	var lat_offset = (neLat - swLat) / 10;
	var lng_offset = (neLng - swLng) / 10;

	var lat_width = (neLat - swLat) + (2 * lat_offset);
	var lng_width = (neLng - swLng) + (2 * lng_offset);
	
	var lngset = MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM));
	var latset = lngset / 2;
	var offset = latset;

	var temp_data = [];

	if (view_state != OVER_VIEW) {
	//if (true) {
		_createInterpolation(hm_data, temp_data, lat_width, lng_width, swLat - lat_offset,
				swLng - lng_offset, latset, lngset, offset);
	} else {
		var d_lat_offset = getLatOffset(neLat, swLat);
		var d_lng_offset = getLngOffset(neLng, swLng);
		var data_bins = _binData(hm_data, neLat, neLng, swLat, swLng, d_lat_offset, d_lng_offset);
		
		var lat_increment = lat_width/3;
		lat_increment += latset - (lat_increment % latset);
		var lng_increment = lng_width/3;
		lng_increment -= lng_increment % lngset;
		var BIN_SIZE = 3;
		
		var lng_start = swLng - lng_offset; 
		for (var lngbin = 0; lngbin < BIN_SIZE; lngbin++) {
			for (var latbin = 0; latbin < BIN_SIZE; latbin++) {
				var hm_bin = data_bins[latbin][lngbin]
							.concat(data_bins[latbin][lngbin+1])
							.concat(data_bins[latbin+1][lngbin])
							.concat(data_bins[latbin+1][lngbin+1]);
				_createInterpolation(hm_bin, temp_data, lat_increment, lng_increment,
						swLat - lat_offset + (lat_increment * latbin),
						lng_start,
						latset, lngset, offset);
			}
			lng_start = _getNextStart(lng_start, lng_start + lng_increment, lngset);
			offset = latset;
		}
	}

	return temp_data;
}

/*
 * Fills in a grid of all the points visible on the screen as defined by the
 * provided lat/lng widths, beginning from the specified start points and 
 * incrementing by the specified lat/lng set values. Applies a specified offset
 * to every other longitudinal row.
 * 
 * hm_data is the array of real data and fill_data is an array to dump the
 * interpolated points into
 */
function _createInterpolation(hm_data, fill_data, lat_width, lng_width, 
		lat_start, lng_start, latset, lngset, offset) {
	var curr_offset = offset;
	
	for (var i = 0.0; i <= lat_width; i += latset) {
		for (var j = 0.0; j <= lng_width; j += lngset) {
			var lat_point = i + lat_start;
			var lng_point = j + curr_offset + lng_start;
			var weighted = getDataWeight(hm_data, lat_point, lng_point);
			if (weighted > MIN_DISPLAY_WEIGHT) {
				addHeatmapCoord(fill_data, lat_point, lng_point, weighted);
			}
		}
		curr_offset = (curr_offset == 0.0 ? latset : 0.0);
	}
}

/*
 * Takes in an array of real data points, map boundary points, and offset distances for
 * latitude and longitude. Separates data points into a 4x4 matrix that evenly divides up
 * the boundary size (with offsets added to all sides).
 */
function _binData(hm_data, neLat, neLng, swLat, swLng, data_lat_offset, data_lng_offset){
	var BIN_SIZE = 4;
	var data_bins = [];
	for (var i = 0; i < BIN_SIZE; i++) {
		data_bins[i] = new Array(BIN_SIZE);			
		for (var j = 0; j < BIN_SIZE; j++) {
			data_bins[i][j] = [];
		}
	}
	var lat_width = (neLat - swLat) + 2 * data_lat_offset;
	var lng_width = (neLng - swLng) + 2 * data_lng_offset;
	var southLat = swLat - data_lat_offset;
	var westLng = swLng - data_lng_offset;
	
	var error_state = false;
	for (var i = 0; i < hm_data.length; i++) {
		var lat_bin = 0;
		var lng_bin = 0;
		var curr_lat = southLat + (lat_width / 4);
		var curr_lng = westLng + (lng_width / 4);
		
		while (hm_data[i].location.lat() > curr_lat) {
			curr_lat += (lat_width / 4);
			lat_bin ++;
			if (lat_bin > 3) {
				console.log("ERROR: data point failed to fit into a bin (lat failure)");
				error_state = true;
				break;
			}
		}
		if (error_state) {
			error_state = false;
			break;
		}

		while (hm_data[i].location.lng() > curr_lng) {
			curr_lng += (lng_width / 4);
			lng_bin ++;
			if (lng_bin > 3) {
				console.log("ERROR: data point failed to fit into a bin (lng failure)");
				error_state = true;
				break;
			}
		}
		if (error_state) {
			error_state = false;
			break;
		}
		
		data_bins[lat_bin][lng_bin].push(hm_data[i]);
	}
	
	for (var i = 0; i < data_bins.length; i++) {
		for (var j = 0; j < data_bins[i].length; j++) {
			console.log("Bin size[" + i + "][" + j + "]: " + data_bins[i][j].length);
		}
	}
	
	return data_bins;
}

/*
 * Gets the data weight for a given point on the map by applying a weighted
 * average to the four nearest data points (or if fewer than four data points,
 * using all the ones available).
 */
function getDataWeight(hm_data, lat, lng) {
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
		var dist_sum = nearest_distance.reduce(function(a, b) { return a + b; });		
		
		for (var i = 0; i < nearest.length; i++) {
			var dist_scaling = WEIGHT_SCALING_DISTANCE / nearest_distance[i];
			if (dist_scaling > 1) {
				dist_scaling = 1;
			}
			final_weight += (nearest[i].weight * (1 - nearest_distance[i] / dist_sum) 
					* dist_scaling);
			// final_weight += ((1 - (nearest_distance[i] / dist_sum))
			// * (nearest[i].weight / weight_max));
		}
		
	}
	return (nearest.length > 0 ? final_weight / nearest.length : 0);
}

/*
 * When binning, this safely gets you the next point you could safely draw,
 * based on where the next point would be if the view hadn't been cut into
 * sections. Pass in the current start point, the end point of the cut, and
 * the amount you increment by each step.
 */
function _getNextStart(curr_start, end_point, increment) {
	var next_start = curr_start;
	while (next_start < end_point) {
		next_start += increment;
	}
	
	return next_start;
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
				* 0.95,
		dissipating : false,
		opacity : 0.4,
		gradient : [ 'rgba(0,0,0,0)', 'rgba(255,0,0,1)', 'rgba(255,63,0,1)',
				'rgba(255,127,0,1)', 'rgba(255,191,0,1)', 'rgba(255,255,0,1)',
				'rgba(223,255,0,1)', 'rgba(191,255,0,1)', 'rgba(159,255,0,1)',
				'rgba(127,255,0,1)', 'rgba(63,255,0,1)', 'rgba(0,255,0,1)' ]
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
	hm_data = wind_data;
	hm_data = hm_data.concat(solar_data);
	hm_data = hm_data.concat(hydro_data);

	if (!POINT_DEBUGGER) {
		g_heatmap.set('radius', MAX_DATA_WIDTH
			/ Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.95);
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
 * Function to call to get data from a point on the map. Provided
 * the latitude and longitude of a point, this returns a pointDataObj,
 * which has the wind_raw, solar_raw, hydro_raw, and total_energy
 * properties.
 * 
 * All this data is fake right now.
 */
function getPointData(lat_point, lng_point) {
	var pointDataObj = {
		wind_raw : 0,
		solar_raw : 0,
		hydro_raw : 0,
		total_energy : 0
	};
	
	// Fake all the data!!
	pointDataObj.wind_raw = (Math.random() > 0.1 ? 1000 * Math.random() : 0);
	pointDataObj.solar_raw = 100 * Math.random();
	pointDataObj.hydro_raw = (Math.random() > 0.98 ? 5000 * Math.random() : 0);
	pointDataObj.total_energy = pointDataObj.wind_raw * 25 +
								pointDataObj.solar_raw * 10 + 
								pointDataObj.hydro_raw * 50;
	return pointDataObj;
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
