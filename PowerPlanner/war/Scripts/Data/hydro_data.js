/*
 * TODO: Add in other metrics for calculations.
 */
function _filterHydroData(raw_data, push_data, neLat, neLng, swLat, swLng) {
	for (var i = 0; i < raw_data.length; i++) {
		if (raw_data[i].hasOwnProperty('points')) {
			if (raw_data[i].points[0].lat > swLat && raw_data[i].points[0].lat < neLat) {
				if (raw_data[i].points[0].lon > swLng && raw_data[i].points[0].lon < neLng) {
					streams_data.push(raw_data[i].points);
				}
			}
		} else {
			push_data.push({
				lat : raw_data[i].lat,
				lng : raw_data[i].lon,
				weight : hydroPow(raw_data[i].precalc,0.9,15)
			});
		}
	}
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
