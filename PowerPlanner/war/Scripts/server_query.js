function queryAndUpdate(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type) {
	console.time("_getHeatmapData");
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

function buildURL() {
	var builder = window.location.origin + '/#app?';
	builder = builder + 'z=' + g_map.getZoom();
	builder = builder + '&c=' + g_map.getCenter().lat() + ',' + g_map.getCenter().lng();
	for (var i = 0; i < markerSet.length; i++) {
		builder = builder + '&m=' + 
					markerSet[i].getPosition().lat() + ',' +
					markerSet[i].getPosition().lng();
	}
	return builder;
}

function decodeURL() {
	var url = window.location.origin + '/powerdb?' + window.location.hash.split('?')[1];
	var zoom = getUrlParameter('z');
	var center = getUrlParameter('c');
	var markers = getUrlParameter('m');
	if (zoom[0] >= LEAST_ZOOM && zoom[0] <= MAX_ZOOM) {
		console.log(zoom[0]);
		g_map.setZoom(Number(zoom[0]));
	}
	if (center != []) {
		g_map.setCenter(new google.maps.LatLng(center[0].split(',')[0], center[0].split(',')[1]));
	}
	for (var i = 0; i < markers.length; i++) {
		console.log(markers[i]);
		addMarker(g_map, new google.maps.LatLng(markers[i].split(',')[0], markers[i].split(',')[1]));
	}
	
	markerBalloon.setContent("");
	markerBalloon.close();
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.hash.split('?',2)[1];
    var sURLVariables = sPageURL.split('&');
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