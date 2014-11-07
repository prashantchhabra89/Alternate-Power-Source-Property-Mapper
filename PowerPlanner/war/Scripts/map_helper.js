var g_map; /* The main map */
var g_heatmap; /* The heatmap layer for the main map */

var wind_data = []; /* The wind data for the current heatmap view */
var solar_data = []; /* The solar data for the current heatmap view */
var hydro_data = []; /* The hydro data for the current heatmap view */
var streams_data = []; /* The streams data for where to draw hydro */

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

var WIND_SCALER = 500;
var SOLAR_SCALER = 4.6;
var HYDRO_SCALER = 1;
var scaler = WIND_SCALER;

var POINT_DEBUGGER = false; /* true = view data points instead of interpolation */

// View (or zoom) state of the map; used to implement different time saving
// measures
var view_state = (DEFAULT_ZOOM <= CHANGETO_WIDE_VIEW ? 
			(DEFAULT_ZOOM <= CHANGETO_OVER_VIEW ? OVER_VIEW : WIDE_VIEW) : 
			(DEFAULT_ZOOM <= CHANGETO_AVE_VIEW ? AVE_VIEW : SMALL_VIEW));

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
		markerBalloon.bindTo('position', marker, 'position');
		markerBalloon.open(map, marker);
				
		// this is the bubble displayed when pin is left-clicked.
		// left click to toggle the bubble.
		// if you left click another pin, the bubble on that pin will show up.
		marker.addListener('click', function() {
			// if the current balloon is closed
			if (markerBalloon.getContent()=="") {
				markerBalloon.setContent(balloonText(fakeObject, latPosition, lngPosition));
				markerBalloon.bindTo('position', this, 'position');
				markerBalloon.open(map, this);	
			} else {
				// clicking a different pin, show a bubble for that pin.
				if (markerBalloon.getPosition().lat() != this.getPosition().lat()
						|| markerBalloon.getPosition().lng() != this.getPosition().lng()) {
					markerBalloon.setContent(balloonText(fakeObject, latPosition, lngPosition));
					markerBalloon.bindTo('position', this, 'position');
					markerBalloon.open(map, this);	
				} else {
					// we are clicking the same pin. close the bubble.
					markerBalloon.setContent("");
					markerBalloon.setPosition(null);
					markerBalloon.open(null, null);
				}
			}										
		});
		
		// right click on a marker to remove the pin.
		// if that pin has a bubble showing right now, close that bubble as well.
		marker.addListener('rightclick', function() {
			// didn't actually delete or close the marker, just set it to invisible.
			this.setVisible(false);
			
			// test if we are right clicking the pin with opening bubble.
			// if we are, close the bubble. If we are not, don't do anything.
			if (markerBalloon.getPosition().lat() == this.getPosition().lat()
					&& markerBalloon.getPosition().lng() == this.getPosition().lng()) {
				markerBalloon.setContent("");
				markerBalloon.close();
			}
		});
	}
	
	// the function to return the string to be displayed in the balloon.
	// this function exists to factor out some code in the previous section.
	// numeric values are rounded to 2 digits. change this if needed.
	function balloonText(objectHandle, lat, lng) {
		var balloonString = "<div class=\"scrollFix\">" + 
							"<h2>Detailed Energy Data (kWh)</h2>" +
							"<h3>Latitude: " + lat + "<br/>" + 
							"Longitute: " + lng + "</h3>" +
							"Wind Energy: " + objectHandle.wind_raw.toFixed(2).toString() + "<br/>" + 
							"Solar Energy: " + objectHandle.solar_raw.toFixed(2).toString() + "<br/>" +
							"Hydro Energy: " + objectHandle.hydro_raw.toFixed(2).toString() + "<br/>" +
							"<h4>Total Energy: " + objectHandle.total_energy.toFixed(2).toString() + "</h4>" +
							"<p><i>Right click on the pin to remove pin.</i></p>" +
							"<p><i>Left click on the pin to toggle this window.</i></p></div>";
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
	
	markerBalloon.setContent("<div class=\"scrollFix\">" + 
			"<h3>Did you know that ...</h3>" +
			"<p><em>Right clicking on any area of the map <br/>" +
			"will place a marker and open a similar <br/>" +
			"window with information about the power <br/>" +
			"generation potential in that area?</em></p>" +
			"<p><em>For more info on all the cool things <br/>" +
			"you can do, click the blue ? to the left!</em></p></div>");
	//markerBalloon.open(map);
	//markerBalloon.setPosition(map.getCenter());
	
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
			view_state = (zoom <= CHANGETO_WIDE_VIEW ? 
							(zoom <= CHANGETO_OVER_VIEW ? OVER_VIEW: WIDE_VIEW) : 
								(zoom <= CHANGETO_AVE_VIEW ? AVE_VIEW : SMALL_VIEW));
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
	console.time("_getHeatmapData");
	var lat_offset = getLatOffset(neLat, swLat);
	var lng_offset = getLngOffset(neLng, swLng);
	wind_data = [];
	solar_data = [];
	hydro_data = [];

	console.log("nelat: " + (neLat + lat_offset));
	console.log("nelng: " + (neLng + lng_offset));
	console.log("swlat: " + (swLat - lat_offset));
	console.log("swlng: " + (swLng - lng_offset));

	$.ajax({
			// url : '/powerplanner',
			url : '/powerdb',
			type : 'POST',
			data : {
				type : type,
				neLat : neLat + lat_offset,
				neLng : neLng + lng_offset,
				swLat : swLat - lat_offset,
				swLng : swLng - lng_offset,
				season : "anu"
			},
			dataType : 'json',
			success : function(data, status) {
				if (status) {
					console.log("Total Data Points: " + data.length);
					// console.log(data);

					// TODO: cache the unused points.
					usable_data = [];
					if (type == "WIND") {
						_filterWindData(data, usable_data, 
								neLat + lat_offset, neLng + lng_offset, 
								swLat - lat_offset, swLng - lng_offset);
						scaler = WIND_SCALER;
					} else if (type == "SOLAR") {
						_filterSolarData(data, usable_data);
						scaler = SOLAR_SCALER;
					} else if (type == "HYDRO") {
						_filterHydroData(data, usable_data);
						scaler = HYDRO_SCALER;
					}

					var weight_points = [];
					for (var i = 0; i < usable_data.length; i++) {
						weight_points.push(usable_data[i].weight);
					}
					var topval = getArrayMax(weight_points);
					var botval = getArrayMin(weight_points);
					// scaler = topval;
					console.log("Data Points on Screen: "
							+ usable_data.length);
					console.log("Scaler: " + scaler);
					console.log("Top val: " + topval);
					console.log("Bottom val: " + botval);
					console.log("Zoom: " + g_map.getZoom());

					var hm_data = [];
						
					if (type == "WIND") {
						for (var i = 0; i < usable_data.length; i++) {
							addHeatmapCoord(hm_data, usable_data[i].lat,
									usable_data[i].lng, usable_data[i].weight
											/ scaler);
						}
						if (POINT_DEBUGGER) {
							wind_data = hm_data;
						} else {
							console.time('_interpolateData');
							wind_data = _interpolateData(hm_data, neLat,
									neLng, swLat, swLng, type);
							console.timeEnd('_interpolateData');
						}
					} else if (type == "SOLAR") {
						for (var i = 0; i < usable_data.length; i++) {
							addHeatmapCoord(hm_data, usable_data[i].lat,
									usable_data[i].lng, 2.5 * 
											((Math.pow(10, usable_data[i].weight)
											- Math.pow(10, botval))
											/ Math.pow(10, scaler)));
						}
						if (POINT_DEBUGGER) {
							solar_data = hm_data;
						} else {
							console.time('_interpolateData');
							solar_data = _interpolateData(hm_data, neLat,
									neLng, swLat, swLng, type);
							console.timeEnd('_interpolateData');
						}
					} else if (type == "HYDRO") {
						for (var i = 0; i < usable_data.length; i++) {
							addHeatmapCoord(hm_data, usable_data[i].lat, 
									usable_data[i].lng, usable_data[i].weight / scaler);
						}
						if (POINT_DEBUGGER) {
							hydro_data = hm_data;
						} else {
							console.log("Sorry, we don't support normal hydro processes yet!");
						}
					}
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
	for (var i = 0; i < raw_data.length; i++) {
		if (raw_data[i].lat > swLat && raw_data[i].lat < neLat) {
			if (raw_data[i].lon > swLng && raw_data[i].lon < neLng) {
				push_data.push({
					lat : raw_data[i].lat,
					lng : raw_data[i].lon,
					weight : raw_data[i].pre15
				});
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
			weight : raw_data[i].deg45
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
function _filterHydroData(raw_data, push_data) {
	for (var i = 0; i < raw_data.length; i++) {
		if (raw_data[i].hasOwnProperty('points')) {
			for (var j = 0; j < raw_data[i].points.length; j++) {
				push_data.push({
					lat : raw_data[i].points[j].lat,
					lng : raw_data[i].points[j].lon,
					weight : 1000
				});
			}
		} else {
			push_data.push({
				lat : raw_data[i].lat,
				lng : raw_data[i].lon,
				weight : raw_data[i].precalc
			});
		}
	}
}

/*
 * Fills in a grid of all the points visible on the screen as defined by the
 * provided boundary coordinates (with a little bit of bleed over the boundaries
 * to prevent visible edge discolouration) by interpolating values from the
 * provided set of real data points based on a weighting algorithm. Returns the
 * set of interpolated values. Runs the interpolation in bins if the map view is
 * too large.
 */
function _interpolateData(hm_data, neLat, neLng, swLat, swLng, type) {
	var lat_offset = (neLat - swLat) / 10;
	var lng_offset = (neLng - swLng) / 10;

	var lat_width = (neLat - swLat) + (2 * lat_offset);
	var lng_width = (neLng - swLng) + (2 * lng_offset);

	var lngset = MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM));
	var latset = lngset / 2;
	var offset = latset;

	var temp_data = [];

	if (type == "WIND") {
		if (view_state != OVER_VIEW) {
			// if (true) {
			_createInterpolation(hm_data, temp_data, lat_width, lng_width,
					swLat - lat_offset, swLng - lng_offset, latset, lngset,
					offset, type);
		} else {
			var d_lat_offset = getLatOffset(neLat, swLat);
			var d_lng_offset = getLngOffset(neLng, swLng);
			var data_bins = _binData(hm_data, neLat, neLng, swLat, swLng,
					d_lat_offset, d_lng_offset);

			var lat_increment = lat_width / 3;
			lat_increment += latset - (lat_increment % latset);
			var lng_increment = lng_width / 3;
			lng_increment -= lng_increment % lngset;
			var BIN_SIZE = 3;

			var lat_start = swLat - lat_offset;
			var lng_start = swLng - lng_offset;
			for (var lngbin = 0; lngbin < BIN_SIZE; lngbin++) {
				for (var latbin = 0; latbin < BIN_SIZE; latbin++) {
					var hm_bin = data_bins[latbin][lngbin].concat(
							data_bins[latbin][lngbin + 1]).concat(
							data_bins[latbin + 1][lngbin]).concat(
							data_bins[latbin + 1][lngbin + 1]);
					var next_inter = _createInterpolation(hm_bin, temp_data,
							lat_increment, lng_increment, lat_start, lng_start,
							latset, lngset, offset, type);
					lat_start = next_inter.max_lat + latset;
					offset = next_inter.offset;
				}
				lat_start = swLat - lat_offset;
				lng_start = _getNextStart(lng_start, lng_start + lng_increment,
						lngset);
				offset = latset; // reset offset
			}
		}
	} else if (type == "SOLAR") {
		_createInterpolation(hm_data, temp_data, lat_width, lng_width,
				swLat - lat_offset, swLng - lng_offset, latset, lngset, 
				offset, type);		
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
 * 
 * returns an object containing the maximum latitude value placed, the maximum
 * longitude value placed, and the next offset value (which would have been used
 * had there been another longitude line to add)
 */
function _createInterpolation(hm_data, fill_data, lat_width, lng_width,
		lat_start, lng_start, latset, lngset, offset, type) {
	var curr_offset = offset;
	var max_lat = -90;
	var max_lng = -180;

	for (var i = 0.0; i <= lat_width; i += latset) {
		for (var j = 0.0; j <= lng_width; j += lngset) {
			var lat_point = i + lat_start;
			var lng_point = j + curr_offset + lng_start;
			max_lat = Math.max(max_lat, lat_point);
			max_lng = Math.max(max_lng, lng_point);
			var weighted = getDataWeight(hm_data, lat_point, lng_point, type);
			//console.log("Point Weight: " + weighted);
			if (weighted > MIN_DISPLAY_WEIGHT) {
				addHeatmapCoord(fill_data, lat_point, lng_point, weighted);
			}
		}
		curr_offset = (curr_offset == 0.0 ? latset : 0.0);
	}

	return {
		max_lat : max_lat,
		max_lng : max_lng,
		offset : curr_offset
	};
}

/*
 * Takes in an array of real data points, map boundary points, and offset
 * distances for latitude and longitude. Separates data points into a 4x4 matrix
 * that evenly divides up the boundary size (with offsets added to all sides).
 */
function _binData(hm_data, neLat, neLng, swLat, swLng, data_lat_offset,
		data_lng_offset) {
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
			lat_bin++;
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
			lng_bin++;
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
			console.log("Bin size[" + i + "][" + j + "]: "
					+ data_bins[i][j].length);
		}
	}

	return data_bins;
}

function getDataWeight(hm_data, lat, lng, type) {
	var weight_val = 0;
	if (type == "WIND") {
		weight_val = _getDataWeightWind(hm_data, lat, lng);
	} else if (type == "SOLAR") {
		weight_val = _getDataWeightSolar(hm_data, lat, lng);
	}
	
	return weight_val;
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

/*
 * When binning, this safely gets you the next point you could safely draw,
 * based on where the next point would be if the view hadn't been cut into
 * sections. Pass in the current start point, the end point of the cut, and the
 * amount you increment by each step.
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
				* 0.98,
		dissipating : false,
		opacity : 0.5,
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
 * Function to call to get data from a point on the map. Provided the latitude
 * and longitude of a point, this returns a pointDataObj, which has the
 * wind_raw, solar_raw, hydro_raw, and total_energy properties.
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
	pointDataObj.wind_raw = 1000 * Math.random();
	pointDataObj.solar_raw = 10 * Math.random();
	pointDataObj.hydro_raw = (Math.random() > 0.65 ? 5000 * Math.random() : 0);
	pointDataObj.total_energy = pointDataObj.wind_raw
			+ pointDataObj.solar_raw + pointDataObj.hydro_raw;
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
