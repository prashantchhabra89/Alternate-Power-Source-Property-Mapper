/* 
 * Raw data caches. Cache holds different seasons:
 * index 0 = annual, 1 = winter, 2 = spring, 3 = summer, 4 = fall 
 */
var wind_cache = [];
var solar_cache = [];
var hydro_cache = [];

/* Calculated wind data's boundary */
var wind_data_bounds = {
				neLat: 0,
				neLng: -180,
				swLat: 90,
				swLng: 180
};

/*
 * Searches cache to see if data of type and season exists within
 * specified bounds.
 * 
 * 	neLat, neLng: northeast geometric boundary coordinates of bounds to check
 * 	swLat, swLng: southwest geometric boundary coordinates of bounds to check
 * 	type: type of data to check for; WIND, SOLAR, or HYDRO
 * 	season: season of data to check for; can be anu, djf, mam, jja, son
 * 
 * 	returns: true if data is in cache; false otherwise
 */
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

/*
 * Fetches data of specified type and season from the cache within
 * specified bounds.
 * 
 * 	neLat, neLng: northeast geometric boundary coordinates of bounds to fetch
 * 	swLat, swLng: southwest geometric boundary coordinates of bounds to fetch
 * 	type: type of data to fetch; WIND, SOLAR, or HYDRO
 * 	season: season of data to fetch; can be anu, djf, mam, jja, son
 * 
 * 	returns: array of fetched data
 */
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

/*
 * Adds data from array of specified type and season to the cache.
 * 
 * 	new_data: array of data to add to the cache
 * 	type: type of data to be added
 * 	season: season of data to be added
 */
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
