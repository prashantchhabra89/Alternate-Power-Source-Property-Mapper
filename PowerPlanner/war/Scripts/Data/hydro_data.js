/*
 * Filters the hydro data, removing points outside the bounds, removing outliers with
 * illegal values, and adding to an array data points with full power potential.
 * 
 * 	raw_data: unprocessed data from server
 * 	push_data: array that will be filled with filtered data
 * 	neLat, neLng: northeast geometric boundary coordinates of data to process
 * 	swLat, swLng: southwest geometric boundary coordinates of data to process
 * 	season: season of data to be processed; can be anu, djf, mam, jja, son
 */
function _filterHydroData(raw_data, push_data, neLat, neLng, swLat, swLng, season) {
	for (var grid = 0; grid < raw_data.length; grid++) {
		for (var i = 0; i < raw_data[grid].data.length; i++) {
			var river_center = _getRiverCenter(raw_data[grid].data[i].points[0],
					raw_data[grid].data[i].points[raw_data[grid].data[i].points.length - 1]); 
			if (river_center.lat > swLat && river_center.lat < neLat) {
				if (river_center.lon > swLng && river_center.lon < neLng) {
					var powerweight = raw_data[grid].data[i].weights[season];
					if (powerweight < 0) {
						powerweight = 0;
					}
					push_data.push({
						points : raw_data[grid].data[i].points,
						weight : hydroPow(powerweight, 0.9, 0.5)
					});
				}
			}
		}
	}
}

/*
 * Given two points (start and end of river) return the center point of that river.
 * 
 * 	start_point: geometric point on map showing start of river
 * 	end_point: geometric point on map showing end of river
 * 
 * 	returns: geometric point that lies at the center of the line formed by start
 * 	and end points
 */
function _getRiverCenter(start_point, end_point) {
	var start_lat = start_point.lat;
	var start_lng = start_point.lon;
	var end_lat = end_point.lat;
	var end_lng = end_point.lon;
	
	return {
		'lat' : (start_lat + end_lat)/2,
		'lon' : (start_lng + end_lng)/2
	};
}

/*
 * Gets the power potential of a point at a provided latitude and longitude. If the point
 * is along a river, the value will be returned. No river means no power potential.
 * 
 *  hm_data: processed real data
 *  lat, lng: geometric point to get weight of
 *  
 *  returns: point weight
 */
function _getDataWeightHydro(hm_data, lat, lng) {
	var final_weight = 0;
	// go through each stream in the streams set
	for (var i = 0; i < hm_data.length; i++) {
		if (pointIsOnPoint(lat, lng, hm_data[i].location.lat(), hm_data[i].location.lng())) {
			final_weight = hm_data[i].weight;
			break;
		}
	}
	return final_weight;
}
