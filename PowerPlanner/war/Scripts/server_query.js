/*
 * Handler arrays to allow processing of multiple queries.
 */
var data_query_handler = [];
var passive_query_handler = [];
var dq_handler_id = 0;

/*
 * Launches query updates to asynchronously load the specified data types and to prevent
 * excess queries.
 * 
 * 	season: the season to load the data for
 * 	types: an object containing wind, solar, and hydro attributes with a boolean value
 * 	to specify if the corresponding data type should be loaded 
 */
function launchQueryUpdate(season, types) {
	var neLat = getNELatitude(g_map);
	var neLng = getNELongitude(g_map);
	var swLat = getSWLatitude(g_map);
	var swLng = getSWLongitude(g_map);
	
	var queryObj = createQuerySet(types.wind, types.solar, types.hydro, true);
	var dqh_l = data_query_handler.length;
	if (dqh_l > 0) {
		console.log("Query Updater: dropping " + dqh_l + (dqh_l > 1 ? " queries." : " query."));
		data_query_handler = [];
	}
	data_query_handler.push(queryObj);
	
	setTimeout(function() {}, 5);
	
	if (_queryIsActive(queryObj)) {
		if (types.wind) {
			_requestHeatmapData("WIND", season, neLat, neLng, swLat, swLng, queryObj);
		}
		if (types.solar) {
			_requestHeatmapData("SOLAR", season, neLat, neLng, swLat, swLng, queryObj);
		}
		if (types.hydro) {
			_requestHeatmapData("HYDRO", season, neLat, neLng, swLat, swLng, queryObj);
		}
	}
}

/*
 * Template for passive queries (preloading areas of the map)
 * 
 * 	season: the season to load the data for
 * 	types: an object containing wind, solar, and hydro attributes with a boolean value
 * 	to specify if the corresponding data type should be loaded 
 */
function passiveQueryUpdate(season, types) {
	/*
	 * Run some loop to figure out your bounds.
	 * 
	 * pseudo code:
	 * 
	 * for each set of bounds (start with the first one you want to load):
	 *     apply offsets to your lat/lng values to counter the automatic offsets
	 *     offset_neLat = neLat - lat_offset
	 *     offset_neLng = neLng - lng_offset
	 *     offset_swLat = swLat + lat_offset
	 *     offset_swLng = swLng + lng_offset
	 *     queryObjSetup(passive_query_handler, false, season, types, offsets ... you get the idea)
	 *     
	 * _requestPassiveQuery();
	 */
}

/*
 * Template for requesting passive preloading queries.
 */
function _requestPassiveQuery() {
	// You'll probably want some sort of handling to deal with stopping these queries if they're
	// interrupted. REMINDER - set passive_query_handler = [] to make running queries halt
	if (passive_query_handler.length > 0) {
		var queryObj = passive_query_handler[0]; //gets first element
		if (queryObj.wind !== undefined) {
			_requestHeatmapData("WIND", queryObj.season, 
					queryObj.neLat, queryObj.neLng, 
					queryObj.swLat, queryObj.swLng, queryObj, function(e) {
				if (e === true) {
					_requestPassiveQuery();
				}
			});
		}
		if (queryObj.solar !== undefined) {
			_requestHeatmapData("SOLAR", queryObj.season, 
					queryObj.neLat, queryObj.neLng, 
					queryObj.swLat, queryObj.swLng, queryObj, function(e) {
				if (e === true) {
					_requestPassiveQuery();
				}
			});
		}
		if (queryObj.hydro !== undefined) {
			_requestHeatmapData("HYDRO", queryObj.season, 
					queryObj.neLat, queryObj.neLng, 
					queryObj.swLat, queryObj.swLng, queryObj, function(e) {
				if (e === true) {
					_requestPassiveQuery();
				}
			});
		}
	}
}

/*
 * Make query object (holds data type(s), season, and bounds)
 * Add to the passed in array (query_handler)
 * 
 * 	query_handler: the array for handling queries
 * 	primary_query: boolean; true if this is a regular query; false if it is a preloading query
 * 	season: the season to load the data for
 * 	types: an object containing wind, solar, and hydro attributes with a boolean value
 * 	to specify if the corresponding data type should be loaded 
 * 	neLat, neLng: northeast boundary of area to query data from
 * 	swLat, swLng: southwest boundary of area to query data from
 */
function queryObjSetup(query_handler, primary_query, season, types, neLat, neLng, swLat, swLng) {
	var queryObj = createQuerySet(types.wind, types.solar, types.hydro, 
			primary_query, season, neLat, neLng, swLat, swLng);
	query_handler.push(queryObj);
}

/*
 * Creates a query object containing all information relevant to server queries.
 * 
 * 	wind: boolean; true if wind data is to be loaded
 * 	solar: boolean; true if solar data is to be loaded
 * 	hydro: boolean; true if hydro data is to be loaded
 * 	primary_query: boolean; true if this is a regular query; false if it is a preloading query
 * 	season: the season to load the data for
 * 	to specify if the corresponding data type should be loaded 
 * 	neLat, neLng: northeast boundary of area to query data from
 * 	swLat, swLng: southwest boundary of area to query data from
 */
function createQuerySet(wind, solar, hydro, primary_query, season, neLat, neLng, swLat, swLng) {
	queryObj = { 
		query_id : dq_handler_id++,
		primary : primary_query
	};
	
	if (season) {
		queryObj["season"] = season;
	}
	if (wind) {
		queryObj["wind"] = false;
	}
	if (solar) {
		queryObj["solar"] = false;
	}
	if (hydro) {
		queryObj["hydro"] = false;
	}
	if (neLat !== undefined) {
		queryObj['neLat'] = neLat;
	}
	if (neLng !== undefined) {
		queryObj['neLng'] = neLng;
	}
	if (swLat !== undefined) {
		queryObj['swLat'] = swLat;
	}
	if (swLng !== undefined) {
		queryObj['swLng'] = swLng;
	}
	return queryObj;
}

/*
 * Handles requesting data from the server. At every major checkpoint, looks to see if
 * another query has been launched, and if so, stops processing.	
 * 
 * 	season: the season to load the data for
 * 	type: the data type to be requested; one of WIND, SOLAR, or HYDRO
 * 	neLat, neLng: northeast boundary of area to query data from
 * 	swLat, swLng: southwest boundary of area to query data from
 * 	queryObj: the object containing query parameters
 * 	callback: callback function to indicate if data was successfully returned
 */
function _requestHeatmapData(type, season, neLat, neLng, swLat, swLng, queryObj, callback) {
	_.throttle(
			_getHeatmapData(type, season, neLat, neLng, swLat, swLng, function(data) {
				if (!_queryIsActive(queryObj)) {
					console.log("Query object was dropped. Halting " + type + " process of id " +
							queryObj.query_id);
					return;
				}
				updateData(data, neLat, neLng, swLat, swLng, type, season);
				if (!_queryIsActive(queryObj)) {
					console.log("Query object was dropped. Halting " + type + " process of id " +
							queryObj.query_id);
					return;
				}
				_queryObjProgress(queryObj, type);
				var success = _tryUpdateHeatmap(queryObj);
				if (callback !== undefined) {
					callback(success);
				}
			}),
			500,{leading:false});
}

/*
 * Function for handling request for data within the provided latitude and
 * longitude bounds of a particular type. Checks if data is within cache first.
 * Launches server query on cache miss.
 * 
 * 	type: the data type to be requested; one of WIND, SOLAR, or HYDRO
 * 	season: the season to load the data for
 * 	neLat, neLng: northeast boundary of area to query data from
 * 	swLat, swLng: southwest boundary of area to query data from
 * 	callback: callback function to return data
 */
function _getHeatmapData(type, season, neLat, neLng, swLat, swLng, callback) {
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
	var in_cache = checkCache(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off, type, season);
	
	if(in_cache) {
		console.log("IN CACHE");
		var new_data = fetchFromCache(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off, type, season);
		updateData(new_data, neLat, neLng, swLat, swLng, type, season);
		callback(new_data);
		console.timeEnd("_checkCacheData");
	} else {
		console.timeEnd("_checkCacheData");
		queryAndCallback(season, neLat, neLng, swLat, swLng, 
				lat_offset, lng_offset, type, function(data) {
					callback(data);
		});
	}
}

/*
 * Ajax POST query to server for data. On success, adds data to cache and calls the callback with
 * the data from server.
 * 
 * 	season: the season to load the data for
 * 	neLat, neLng: northeast boundary of area to query data from
 * 	swLat, swLng: southwest boundary of area to query data from
 * 	lat_offset: additional offset to add to lat area
 * 	lng_offset: additional offset to add to lng area
 * 	type: the data type to be requested; one of WIND, SOLAR, or HYDRO
 * 	callback: callback function to return data
 */
function queryAndCallback(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type, callback) {
	console.time("_queryServer");
	var neLat_w_off = (neLat + lat_offset);
	var neLng_w_off = (neLng + lng_offset);
	var swLat_w_off = (swLat - lat_offset);
	var swLng_w_off = (swLng - lng_offset);
	
	$.ajax({
		url : '/powerdb',
		type : 'POST',
		data : {
			type : type,
			neLat : neLat_w_off,
			neLng : neLng_w_off,
			swLat : swLat_w_off,
			swLng : swLng_w_off,
			season : season
		},
		dataType : 'json',
		success : function(data, status) {
			if (status) {
				console.log("Total Data Points: " + data.length);

				// Cache all points
				addToCache(data, type, season);
				callback(data);
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
			console.timeEnd("_queryServer");
		}
	});
}

/*
 * Checks if the query represented by the query object is still active.
 * 
 * 	queryObj: query object representing parameters of server query
 * 
 * 	returns: true if query has not been superceded; false otherwise
 */
function _queryIsActive(queryObj) {
	var isActive = false;
	if (queryObj.primary === false) {
		for (var i = 0; i < passive_query_handler.length; i++) {
			if (passive_query_handler[i].query_id === queryObj.query_id) {
				isActive = true;
				break;
			}
		}
	} else {
		for (var i = 0; i < data_query_handler.length; i++) {
			if (data_query_handler[i].query_id === queryObj.query_id) {
				isActive = true;
				break;
			}
		}
	}
	return isActive;
}

/*
 * Updates query object to set specified type to true. Used when a server query
 * has returned data.
 * 
 * 	queryObj: query object representing parameters of server query
 * 	type: the data type in question; one of WIND, SOLAR, or HYDRO
 */
function _queryObjProgress(queryObj, type) {
	if (type == "WIND") {
		queryObj.wind = true;
	} else if (type == "SOLAR") {
		queryObj.solar = true;
	} else if (type == "HYDRO") {
		queryObj.hydro = true;
	}
}

/*
 * Tries to update the heatmap with results of queries. Only succeeds if all other queries
 * in the query object have finished.
 * 
 * 	queryObj: query object representing parameters of server query
 * 
 * 	returns: true if the heatmap was updated; otherwise, false
 */
function _tryUpdateHeatmap(queryObj) {
	var did_update = false;
	if (queryObj.wind !== false && queryObj.solar !== false && queryObj.hydro !== false) {
		console.log("Query object success! Updating heatmap.");
		updateHeatmap();
		did_update = true;
		if (_queryIsActive(queryObj)) {
			for (var i = 0; i < data_query_handler.length; i++) {
				if (data_query_handler[i].query_id === queryObj.query_id) {
					data_query_handler.splice(i, 1);
					break;
				}
			}
		} else {
			passive_query_handler.splice(i, 1);
		}
	}
	return did_update;
}

/*
 * Builds a URL out of the various parameters user changeable parameters, such as
 * map location, zoom level, power types showing, season showing, and markers placed.
 * 
 * 	returns: the URL string
 */
function buildURL() {
	var builder = window.location.origin + '/#app?';
	builder = builder + 'z=' + g_map.getZoom();
	builder = builder + '&c=' + g_map.getCenter().lat() + ',' + g_map.getCenter().lng();
	builder = builder + '&s=' + getSeason($("#wind-seasonal").val());
	for (var i = 0; i < markerSet.length; i++) {
		builder = builder + '&m=' + 
					markerSet[i].getPosition().lat() + ',' +
					markerSet[i].getPosition().lng();
	}
	var datastate = "";
	if ($("#showCheckboxOnlyWind").is(':checked')) {
		datastate = 'w';
	} else if ($("#showCheckboxOnlySolar").is(':checked')) {
		datastate = 's';
	} else if ($("#showCheckboxOnlyHydro").is(':checked')) {
		datastate = 'h';
	} else {
		if ($("#showCheckboxWind").is(':checked')) {
			datastate += 'w';
		}
		if ($("#showCheckboxSolar").is(':checked')) {
			datastate += 's';
		}
		if ($("#showCheckboxHydro").is(':checked')) {
			datastate += 'h';
		}
	}
	if (datastate.length > 0) {
		builder = builder + '&d=' + datastate;
	}
	console.log("BUILDER: " + builder);
	return builder;
}

/*
 * Waits for the map to finish loading and then calls the URL decoding function.
 * 
 * 	map: the Google map
 */
function coldLoadDecodeURL(map) {
	console.log("Cold load launch time");
	var this_listener = google.maps.event.addListener(map, 'idle', function() {
		console.log("Cold load says we can now decode the URL!");
		decodeURL();
		google.maps.event.removeListener(this_listener);
	});
}

/*
 * Parses the URL; if it has parameters in place, loads the values in and applies
 * the properties to the map (setting map center, zoom, data showing, season selected,
 * and markers placed).
 */
function decodeURL() {
	var hash = window.location.hash.split('?');
	var url = window.location.origin + '/powerdb?' + hash[1];
	var zoom = getUrlParameter('z');
	var data = getUrlParameter('d');
	var center = getUrlParameter('c');
	var markers = getUrlParameter('m');
	var season = getUrlParameter('s');
	if (zoom && zoom[0] >= LEAST_ZOOM && zoom[0] <= MAX_ZOOM) {
		console.log(zoom[0]);
		g_map.setZoom(Number(zoom[0]));
	}
	if (season && season.length > 0) {
		var s_val = 'Seasonal';
		switch (season[0]) {
		case "mam": s_val = "spring"; break;
		case "jja": s_val = "summer"; break;
		case "son": s_val = "fall"; break;
		case "djf": s_val = "winter"; break;
		}
		console.log("url season " + s_val);
		$("#wind-seasonal").val(s_val);
		$("#solar-seasonal").val(s_val);
		$("#hydro-seasonal").val(s_val);
	}	
	if (center) {
		if (center.length > 0) {
			g_map.setCenter(new google.maps.LatLng(parseFloat(center[0].split(',')[0])
					, parseFloat(center[0].split(',')[1])));
		}
	}
	if (data && data.length > 0) {
		$("#showCheckboxWind").prop("checked", (data[0].indexOf('w') !== -1));
		$("#showCheckboxSolar").prop("checked", (data[0].indexOf('s') !== -1));
		$("#showCheckboxHydro").prop("checked", (data[0].indexOf('h') !== -1));
		toggleHighlightCheck();
		_eventHeatmapDataToggler();
	}
	for (var i = 0; i < markers.length; i++) {
		console.log(markers[i]);
		addMarker(g_map, new google.maps.LatLng(markers[i].split(',')[0], 
				markers[i].split(',')[1]));
	}
	markerBalloon.setContent("");
	markerBalloon.close();
		
	document.location.hash = hash[0];
}

/*
 * Get the parameter from the URL.
 * 
 * 	sParam: the parameter key
 * 
 * 	return: the parameter value(s) in an array
 */
function getUrlParameter(sParam)
{
    var sPageURL = window.location.hash.split('?',2)[1];
    var sURLVariables = [];
    if (sPageURL) {
    	sURLVariables = sPageURL.split('&');
    }
    var returnArr = [];
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            returnArr.push(sParameterName[1]);
        }
    }
    return returnArr;
}
