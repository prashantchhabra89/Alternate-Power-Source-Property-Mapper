var data_query_handler = [];
var passive_query_handler = [];
var dq_handler_id = 0;

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

function _requestPassiveQuery() {
	// You'll probably want some sort of handling to deal with stopping these queries if they're
	// interrupted. REMINDER - set passive_query_handler = [] to make running queries halt
	if (passive_query_handler.length > 0) {
		var queryObj = passive_query_handler.shift(); //gets first element
		if (queryObj.wind !== undefined) {
			_requestHeatmapData("WIND", season, neLat, neLng, swLat, swLng, queryObj, function(e) {
				if (e === true) {
					_requestPassiveQuery();
				}
			});
		}
		if (queryObj.solar !== undefined) {
			_requestHeatmapData("SOLAR", season, neLat, neLng, swLat, swLng, queryObj, function(e) {
				if (e === true) {
					_requestPassiveQuery();
				}
			});
		}
		if (queryObj.hydro !== undefined) {
			_requestHeatmapData("HYDRO", season, neLat, neLng, swLat, swLng, queryObj, function(e) {
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
 */
function queryObjSetup(query_handler, primary_query, season, types, neLat, neLng, swLat, swLng) {
	var queryObj = createQuerySet(types.wind, types.solar, types.hydro, 
			primary_query, neLat, neLng, swLat, swLng);
	query_handler.push(queryObj);
}

function createQuerySet(wind, solar, hydro, primary_query, neLat, neLng, swLat, swLng) {
	queryObj = { 
		query_id : dq_handler_id++,
		primary : primary_query
	};
	
	if (wind) {
		queryObj["wind"] = false;
		cleanInterpolatedCache("WIND");
		if(grid_size.default_state || grid_size.type != "WIND") {
			grid_size.reset_state();
			grid_size.init(neLat, neLng, swLat, swLng, "WIND");
		}
	}
	if (solar) {
		queryObj["solar"] = false;
		cleanInterpolatedCache("SOLAR");
		if(grid_size.default_state || grid_size.type != "SOLAR") {
			grid_size.reset_state();
			grid_size.init(neLat, neLng, swLat, swLng, "SOLAR");
		}
	}
	if (hydro) {
		queryObj["hydro"] = false;
		cleanInterpolatedCache("HYDRO");
		if(grid_size.default_state || grid_size.type != "HYDRO") {
			grid_size.reset_state();
			grid_size.init(neLat, neLng, swLat, swLng, "HYDRO");
		}
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
		queryObj['swLng '] = swLng;
	}
	
	return queryObj;
}

function _requestHeatmapData(type, season, neLat, neLng, swLat, swLng, queryObj, callback) {
	_.throttle(
			_getHeatmapData(type, season, neLat, neLng, swLat, swLng, function(data) {
				if (!_queryIsActive(queryObj)) {
					console.log("Query object was dropped. Halting " + type + " process of id " +
							queryObj.query_id);
					return;
				}
				updateData(data, neLat, neLng, swLat, swLng, type);
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
 * Sends a POST request to the server for data within the provided latitude and
 * longitude bounds of a particular type. Acceptable types are WIND, SOLAR, and
 * HYDRO. Triggers a heatmap update upon server response.
 */
function _getHeatmapData(type, season, neLat, neLng, swLat, swLng, callback) {
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

		if(!interpolated_area.default_state) {
			var has_interpolated_all = false;
			has_interpolated_all = checkInterpolatedCache(neLat, neLng, swLat, swLng, type, season);
			if(!has_interpolated_all) {
				if(interpolated_area.season == season && interpolated_area.type == type) {
					var new_area = interpolated_area.extraArea(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off);
					for(var i = 0; i < new_area.length; i++) {
						in_cache = checkCache(new_area.neLat, new_area.neLng, new_area.swLat, new_area.swLng, type, season);
						if(in_cache) {
							var new_data = fetchFromCache(new_area.neLat, new_area.neLng, new_area.swLat, new_area.swLng, type, season);
							updateData(new_data, new_area.neLat, new_area.neLng, new_area.swLat, new_area.swLng, type);
							updateHeatmap();
						} else {
							queryAndUpdate_extra(season, new_area.neLat, new_area.neLng, new_area.swLat, new_area.swLng, type);
						}
					}
				} else {
					cleanInterpolatedCache("ALL");
					interpolated_area.reset_values();
					interpolated_area.season = season;
					var new_data = fetchFromCache(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off, type);
					updateData(new_data, neLat, neLng, swLat, swLng, type);
					updateHeatmap();
					//do more
				}
			}
		} else {
			interpolated_area.season = season;
			var new_data = fetchFromCache(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off, type);
			updateData(new_data, neLat, neLng, swLat, swLng, type);
			updateHeatmap();
		}
		console.timeEnd("_checkCacheData");
	} else {
		console.timeEnd("_checkCacheData");
		queryAndCallback(season, neLat, neLng, swLat, swLng, 
				lat_offset, lng_offset, type, function(data) {
					callback(data);
		});
	}
}

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

function _queryObjProgress(queryObj, type) {
	if (type == "WIND") {
		queryObj.wind = true;
	} else if (type == "SOLAR") {
		queryObj.solar = true;
	} else if (type == "HYDRO") {
		queryObj.hydro = true;
	}
}

function _tryUpdateHeatmap(queryObj) {
	var did_update = false;
	if (queryObj.wind !== false && queryObj.solar !== false && queryObj.hydro !== false) {
		console.log("Query object success! Updating heatmap.");
		updateHeatmap();
		did_update = true;
	}
	return did_update;
}

function buildURL() {
	var builder = window.location.origin + '/#app?';
	builder = builder + 'z=' + g_map.getZoom();
	builder = builder + '&c=' + g_map.getCenter().lat() + ',' + g_map.getCenter().lng();
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
	return builder;
}

function coldLoadDecodeURL(map) {
	console.log("Cold load launch time");
	var this_listener = google.maps.event.addListener(map, 'idle', function() {
		console.log("Cold load says we can now decode the URL!");
		decodeURL();
		google.maps.event.removeListener(this_listener);
	});
}

function decodeURL() {
	var hash = window.location.hash.split('?');
	var url = window.location.origin + '/powerdb?' + hash[1];
	var zoom = getUrlParameter('z');
	var data = getUrlParameter('d');
	var center = getUrlParameter('c');
	var markers = getUrlParameter('m');
	if (zoom[0] >= LEAST_ZOOM && zoom[0] <= MAX_ZOOM) {
		console.log(zoom[0]);
		g_map.setZoom(Number(zoom[0]));
	}
	for (var i = 0; i < markers.length; i++) {
		console.log(markers[i]);
		addMarker(g_map, new google.maps.LatLng(markers[i].split(',')[0], markers[i].split(',')[1]));
	}
	
	markerBalloon.setContent("");
	markerBalloon.close();
	if (center) {
		if (center.length > 0) {
			g_map.setCenter(new google.maps.LatLng(center[0].split(',')[0], center[0].split(',')[1]));
		}
	}
	if (data && data.length > 0) {
		$("#showCheckboxWind").prop("checked", (data[0].indexOf('w') !== -1));
		$("#showCheckboxSolar").prop("checked", (data[0].indexOf('s') !== -1));
		$("#showCheckboxHydro").prop("checked", (data[0].indexOf('h') !== -1));
		toggleHighlightCheck();
		_eventHeatmapDataToggler();
	}
	document.location.hash = hash[0];
}

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
