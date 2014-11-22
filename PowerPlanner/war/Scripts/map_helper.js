/******************************************************************************
 * Looking for a function or a global var? Here's a list of what's elsewhere!
 * - (the minus symbol) indicates a function
 * = (the equals symbol) indicates a global var
 * 
 * server_query.js
 * - queryAndUpdate(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type)
 * - queryAndCallback(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type, callback)
 * 
 * cache_helper.js
 * = wind_cache
 * = solar_cache
 * = hydro_cache
 * = wind_data_bounds
 * - checkCache(neLat, neLng, swLat, swLng, type)
 * - fetchFromCache(neLat, neLng, swLat, swLng, type)
 * - addToCache(new_data, type)
 * 
 * calculations.js
 * - windPow(precalc, eff, area)
 * - solarPow(raw, eff, area, loss)
 * - hydroPow(precalc, eff, heightdiff)
 * 
 * data_common_functions.js
 * - updateData(raw_data, neLat, neLng, swLat, swLng, type)
 * - processData(raw_data, hm_data, neLat, neLng, swLat, swLng, type)
 * - set_scaler(type)
 * - apply_scaler(raw_weight, offset, type)
 * - _filterData(raw_data, push_data, neLat, neLng, swLat, swLng, type)
 * - _interpolateData(hm_data, neLat, neLng, swLat, swLng, type)
 * - _createInterpolation(hm_data, fill_data, lat_width, lng_width,
 * 						  lat_start, lng_start, latset, lngset, offset, type)
 * - _binData(hm_data, neLat, neLng, swLat, swLng, data_lat_offset, data_lng_offset)
 * - _getNextStart(curr_start, end_point, increment)
 * - pointOnLine(lat, lng, point1, point2)
 * - getDataWeight(hm_data, lat, lng, type)
 * - getPointData(lat_point, lng_point)
 * - populatePointData(pointDataObj, uniq_id)
 * - _tryPopulateTotalEnergy(pointDataObj, uniq_id)
 * 
 * location_helper.js
 * - initializeSearchBox(map, pushToMap, element_id)
 * 
 * marker_helper.js
 * = markerBalloon
 * - initializeMarkers(map)
 * - addMarker(map, loc)
 * - showHelpMarker()
 * - _balloonText(div_id, pointDataObject)
 * 
 * wind_data.js
 * - _filterWindData(raw_data, push_data, neLat, neLng, swLat, swLng)
 * - _getDataWeightWind(hm_data, lat, lng)
 * 
 * solar_data.js
 * - _filterSolarData(raw_data, push_data)
 * - _getDataWeightSolar(hm_data, lat, lng)
 * 
 * hydro_data.js
 * - _filterHydroData(raw_data, push_data, neLat, neLng, swLat, swLng)
 * - _getDataWeightHydro(hm_data, lat, lng)
 * 
 *****************************************************************************/

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

var WEIGHT_SCALING_DISTANCE = 1; /* Data point further away has less impact */
var SOLAR_SCALING_DISTANCE = 1; /* Data point further away may have less impact */

var MIN_DISPLAY_WEIGHT = 0.01; /* Don't add a point with less weight to heatmap */

var WIND_SCALER = 12;
var SOLAR_SCALER = 3.3;
var HYDRO_SCALER = 1000;
var scaler = WIND_SCALER;

var HOUR_TO_YEAR = 8760;

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
	console.time("_checkCacheData");
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
	var in_cache = checkCache(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off, type);
	
	if(in_cache) {
		console.log("IN CACHE");
		var new_data = fetchFromCache(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off, type);
		updateData(new_data, neLat, neLng, swLat, swLng, type);
		updateHeatmap();
		console.timeEnd("_checkCacheData");
	} else {
		console.timeEnd("_checkCacheData");
		queryAndUpdate('anu', neLat, neLng, swLat, swLng, lat_offset, lng_offset, type);
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

	/*if (!POINT_DEBUGGER) {
		g_heatmap.set('radius', MAX_DATA_WIDTH
				/ Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.98);
	}*/

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

function getHeatmapSize() {
	return g_heatmap.get('radius');
}

function _setHeatmapSize(type) {
	var radius = 0;
	if (type == "HYDRO") {
		radius = MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.08;
	} else {
		radius = MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.98;
	}
	g_heatmap.set('radius', radius);
	return radius;
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
