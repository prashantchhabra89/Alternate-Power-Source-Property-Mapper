function queryAndUpdate(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type) {
	console.time("_getInitialHeatmapData");
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
			console.timeEnd("_getInitialHeatmapData");
			var extra_lat_offset = getExtraLatOffset(neLat, swLat);
			var extra_lng_offset = getExtraLngOffset(neLng, swLng);
			_queryAndUpdate('anu', neLat+extra_lat_offset, neLng+extra_lng_offset, 
					swLat-extra_lat_offset, swLng-extra_lng_offset, type);
		}
	});
}

function queryAndUpdate_extra(season, neLat, neLng, swLat, swLng, type) {
	console.time("_getExtraHeatmapData");
	$.ajax({
		url : '/powerdb',
		type : 'POST',
		data : {
			type : type,
			neLat : neLat,
			neLng : neLng,
			swLat : swLat,
			swLng : swLng,
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
			console.timeEnd("_getExtraHeatmapData");
		}
	});
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
