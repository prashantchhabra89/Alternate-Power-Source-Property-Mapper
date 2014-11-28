/* Raw data cache */
/* Seasons is in cache */
/* index 0 = annual, 1 = winter, 2 = spring, 3 = summer, 4 = fall */
var wind_cache = [];
var solar_cache = [];
var hydro_cache = [];
//var stream_cache = [];

/* calculated wind data's boundary */
var wind_data_bounds = {
				neLat: 0,
				neLng: -180,
				swLat: 90,
				swLng: 180
};

function checkCache(neLat, neLng, swLat, swLng, type, season) {
	var neLat_floor = Math.floor(neLat);
	var neLng_floor = Math.floor(neLng);
	var swLat_floor = Math.floor(swLat);
	var swLng_floor = Math.floor(swLng);
	var cache_hit = false;
	
	console.log("CHECKING CACHE");
	if (type == "WIND") {
		if (wind_cache.length > 0) {
			console.log("CHECKING WIND CACHE");
			
			for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
				if (typeof wind_cache[lat] != 'undefined') {
					for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
						if ((typeof wind_cache[lat][lng] != 'undefined') 
							&& (typeof wind_cache[lat][lng][parseSeason(season)] != 'undefined')) {
							cache_hit = true;
						} else {
							cache_hit = false;
							break;
						}
					}
				} else {
					cache_hit = false;
					break;
				}
				if (!cache_hit) {
					break;
				}
			}
		}
	} else if (type == "SOLAR") {
		console.log("CHECKING SOLAR CACHE");
		if(typeof solar_cache[parseSeason(season)] != 'undefined') {
			cache_hit = true;
		}
	} else if (type == "HYDRO") {
		console.log("CHECKING HYDRO CACHE");
		if (hydro_cache.length > 0) {
		
			for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
				if (typeof hydro_cache[lat] != 'undefined') {
					for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
						if (typeof hydro_cache[lat][lng] != 'undefined') {
							cache_hit = true;
						} else {
							cache_hit = false;
							break;
						}
					}
				} else {
					cache_hit = false;
					break;
				}
				if (!cache_hit) {
					break;
				}
			}
		}
	}
	
	return cache_hit;
}

function checkInterpolatedCache(neLat, neLng, swLat, swLng, type, season) {
	console.log("CHECKING INTERPOLATED CACHE");
	if (type == "SOLAR") {
		if (type == interpolated_area.type && season == interpolated_area.season) {
			return true;
		}
	} else {
		if (type == interpolated_area.type && season == interpolated_area.season &&
				interpolated_area.neLat >= neLat && interpolated_area.neLng >= neLng &&
				interpolated_area.swLat <= swLat && interpolated_area.swLng <= swLng) {
			return true;
		}
	}
	return false;
}
	
function cleanInterpolatedCache(types) {
	if (types.wind && !types.solar && !types.hydro) {
		solar_data = [];
		hydro_data = [];
	} else if (!types.wind && types.solar && !types.hydro) {
		wind_data = [];
		hydro_data = [];
	} else if (!types.wind && !types.solar && types.hydro) {
		wind_data = [];
		solar_data = [];
	} else if (types.wind && types.solar && !types.hydro) {
		hydro_data = [];
	} else if (!types.wind && types.solar && types.hydro) {
		wind_data = [];
	} else if (types.wind && !types.solar && types.hydro) {
		solar_data = [];
	} else if (!types.wind && !types.solar && !types.hydro) {
		wind_data = [];
		solar_data = [];
		hydro_data = [];
	}
}

function fetchFromCache(neLat, neLng, swLat, swLng, type, season) {
	var neLat_floor = Math.floor(neLat);
	var neLng_floor = Math.floor(neLng);
	var swLat_floor = Math.floor(swLat);
	var swLng_floor = Math.floor(swLng);
	var new_data = [];
	
	if (type == "WIND") {
		console.log("ACCESSING WIND CACHE");
		for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
			for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
				new_data.push(wind_cache[lat][lng][parseSeason(season)]);
			}
		}
	} else if (type == "SOLAR") {
		console.log("ACCESSING SOLAR CACHE");
		new_data = solar_cache[parseSeason(season)];
	} else if (type == "HYDRO") {
		console.log("ACCESSING HYDRO CACHE");
		for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
			for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
				new_data.push(hydro_cache[lat][lng]);
			}
		}
	}
	
	return new_data;
}

function fetchCacheStream(neLat, neLng, swLat, swLng) {
	var neLat_floor = Math.floor(neLat);
	var neLng_floor = Math.floor(neLng);
	var swLat_floor = Math.floor(swLat);
	var swLng_floor = Math.floor(swLng);
	var new_data = [];
	
	for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
		for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
			new_data.push(hydro_cache[lat][lng]);
		}
	}
	return new_data;
}

function addToCache(new_data, type, season) {
	if (type == "WIND") {
		for(var i = 0; i < new_data.length; i++) {
			if(typeof wind_cache[new_data[i].grid.swLat] == 'undefined') {
				wind_cache[new_data[i].grid.swLat] = [];
			}
			if(typeof wind_cache[new_data[i].grid.swLat][new_data[i].grid.swLng] == 'undefined') {
				wind_cache[new_data[i].grid.swLat][new_data[i].grid.swLng] = [];
			}
			wind_cache[new_data[i].grid.swLat][new_data[i].grid.swLng][parseSeason(season)] = new_data[i];
		}
	} else if (type == "SOLAR") {
		solar_cache[parseSeason(season)] = new_data;
	} else if (type == "HYDRO") {
		var hydro_new_data = [];
		for(var i = 0; i < new_data.length; i++) {
			if(typeof hydro_cache[new_data[i].grid.swLat] == 'undefined') {
				hydro_cache[new_data[i].grid.swLat] = [];
			}
			if(typeof hydro_cache[new_data[i].grid.swLat][new_data[i].grid.swLng] == 'undefined') {
				hydro_cache[new_data[i].grid.swLat][new_data[i].grid.swLng] = [];
			}
			hydro_cache[new_data[i].grid.swLat][new_data[i].grid.swLng] = new_data[i];
		}
	}
}
