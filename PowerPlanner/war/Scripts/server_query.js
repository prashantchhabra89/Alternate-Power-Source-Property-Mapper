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

function queryAndCallback(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type, callback) {
	console.time("_queryServer");
	var neLat_w_off = 49;//(neLat + lat_offset);
	var neLng_w_off = -122;//(neLng + lng_offset);
	var swLat_w_off = 48;//(swLat - lat_offset);
	var swLng_w_off = -123;//(swLng - lng_offset);
	
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