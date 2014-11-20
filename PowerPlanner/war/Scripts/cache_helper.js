/* Raw data cache */
var wind_cache = [];
var solar_cache = [];
var hydro_cache = [];

/* calculated wind data's boundary */
var wind_data_bounds = {
				neLat: 0,
				neLng: -180,
				swLat: 90,
				swLng: 180
};

function checkCache(neLat, neLng, swLat, swLng, type) {
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
						if (typeof wind_cache[lat][lng] != 'undefined') {
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
		if(solar_cache.length > 0) {
			cache_hit = true;
		}
	} else if (type == "HYDRO") {
		console.log("CHECKING HYDRO CACHE");
		if(hydro_cache.length > 0) {
			cache_hit = true;
		}
	}
	
	return cache_hit;
}

function fetchFromCache(neLat, neLng, swLat, swLng, type) {
	var neLat_floor = Math.floor(neLat);
	var neLng_floor = Math.floor(neLng);
	var swLat_floor = Math.floor(swLat);
	var swLng_floor = Math.floor(swLng);
	var new_data = [];
	
	if (type == "WIND") {
		console.log("ACCESSING WIND CACHE");
		for (var lat = swLat_floor; lat <= neLat_floor; lat++) {
			for (var lng = swLng_floor; lng <= neLng_floor; lng++) {
				new_data = new_data.concat(wind_cache[lat][lng]);
			}
		}
	} else if (type == "SOLAR") {
		console.log("ACCESSING SOLAR CACHE");
		new_data = solar_cache;
	} else if (type == "HYDRO") {
		console.log("ACCESSING HYDRO CACHE");
		new_data = hydro_cache;
	}
	
	return new_data;
}

function addToCache(new_data, type) {
	if (type == "WIND") {
		// do binning here
		for(var i = 0; i < new_data.length; i++) {
			if(typeof wind_cache[new_data[i].grid.swLat] == 'undefined') {
				wind_cache[new_data[i].grid.swLat] = [];
			}
			wind_cache[new_data[i].grid.swLat][new_data[i].grid.swLng] = new_data[i];
		}
		// wind_cache = _.union(wind_cache,data);
	} else if (type == "SOLAR") {
		solar_cache = _.union(solar_cache, new_data);
	} else if (type == "HYDRO") {
		hydro_cache = _.union(hydro_cache, new_data);
	}
}