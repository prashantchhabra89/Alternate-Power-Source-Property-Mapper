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
	var final_weight = 0;
	// go through each stream in the streams set
	for (var i = 0; i < streams_data.length; i++) {
		// TODO: In the future, account for more than two points
		if (pointOnLine(lat, lng, streams_data[i][0], streams_data[i][1])) {
			// if point lies *roughly* along the line of a stream, find the nearest
			// 2 hydro stations; take a weighted average of their monitoring, and
			// draw point with that weight

			// Right now, only looks for the one closest stations
			var nearest_distance;
			var nearest_weight;
			for (var j = 0; j < hm_data.length; j++) {
				if (j == 0) {
					//Trivial case, the best so far is the first
					nearest_distance = distanceTo(lat, lng, 
							hm_data[j].location.lat(), hm_data[j].location.lng());
					nearest_weight = hm_data[j].weight;
				} else {
					var next_dist = distanceTo(lat, lng, 
							hm_data[j].location.lat(), hm_data[j].location.lng());
					if (next_dist < nearest_distance) {
						nearest_distance = next_dist;
						nearest_weight = hm_data[j].weight;
					}
				}
			}
			final_weight = nearest_weight;
			break;
		}
	}

	return final_weight;
}
