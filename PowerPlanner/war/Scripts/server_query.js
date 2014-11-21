var getStream = true; // Prevent request for stream data when not needed

function queryAndUpdate(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type) {
	console.time("_getHeatmapData");
	var neLat_w_off = (neLat + lat_offset);
	var neLng_w_off = (neLng + lng_offset);
	var swLat_w_off = (swLat - lat_offset);
	var swLng_w_off = (swLng - lng_offset);
	
	var getHydro = false;	
	if (typeof hydro_cache[parseSeason(season)] == 'undefined') {
		getHydro = true;
	}
	
	$.ajax({
		url : '/powerdb',
		type : 'POST',
		data : {
			type : type,
			neLat : neLat_w_off,
			neLng : neLng_w_off,
			swLat : swLat_w_off,
			swLng : swLng_w_off,
			season : season,
			sendHydro : getHydro,
			sendStream : getStream
		},
		dataType : 'json',
		success : function(data, status) {
			if (status) {
				console.log("Total Data Points: " + data.length);

				// Cache all points
				addToCache(data, type, season);
				if(type == "HYDRO" && !getHydro) {
					data.push(hydro_cache[parseSeason(season)]);
				} else if (type == "HYDRO" && !getStream) {
					data.push(fetchCacheStream(neLat_w_off, neLng_w_off, swLat_w_off, swLng_w_off));
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

function queryAndCallback(season, neLat, neLng, swLat, swLng, lat_offset, lng_offset, type, callback) {
	console.time("_queryServer");
	var neLat_w_off = (neLat + lat_offset);
	var neLng_w_off = (neLng + lng_offset);
	var swLat_w_off = (swLat - lat_offset);
	var swLng_w_off = (swLng - lng_offset);
	
	var getHydro = false;
	if (typeof hydro_cache[parseSeason(season)] == 'undefined') {
		getHydro = true;
	}
	
	$.ajax({
		url : '/powerdb',
		type : 'POST',
		data : {
			type : type,
			neLat : neLat_w_off,
			neLng : neLng_w_off,
			swLat : swLat_w_off,
			swLng : swLng_w_off,
			season : season,
			sendHydro: getHydro
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