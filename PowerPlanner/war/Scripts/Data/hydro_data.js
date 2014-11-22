/*
 * TODO: Add in other metrics for calculations.
 */
function _filterHydroData(raw_data, push_data, neLat, neLng, swLat, swLng) {
	for (var grid = 0; grid < raw_data.length; grid++) {
		for (var i = 0; i < raw_data[grid].data.length; i++) {
			var river_center = _getRiverCenter(raw_data[grid].data[i].points[0],
					raw_data[grid].data[i].points[raw_data[grid].data[i].points.length - 1]); 
			if (river_center.lat > swLat && river_center.lat < neLat) {
				if (river_center.lon > swLng && river_center.lon < neLng) {
					push_data.push({
						points : raw_data[grid].data[i].points,
						weight : hydroPow(raw_data[grid].data[i].weights['anu'], 0.9, 15)
					});
				}
			}
		}
	}
}

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

function _getDataWeightHydro(hm_data, lat, lng) {
	console.log(hm_data);
	console.log(hm_data[0].location.lat());
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
