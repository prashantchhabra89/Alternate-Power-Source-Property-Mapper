/*
 * TODO: Add in other metrics for calculations.
 */
function _filterWindData(raw_data, push_data, neLat, neLng, swLat, swLng) {
	for (var grid = 0; grid < raw_data.length; grid++) {
		for (var i = 0; i < raw_data[grid].data.length; i++) {
			if (raw_data[grid].data[i].lat > swLat && raw_data[grid].data[i].lat < neLat) {
				if (raw_data[grid].data[i].lon > swLng && raw_data[grid].data[i].lon < neLng) {
					push_data.push({
						lat : raw_data[grid].data[i].lat,
						lng : raw_data[grid].data[i].lon,
						weight : windPow(raw_data[grid].data[i].pre15,0.34,290)
					});
				}
			}
		}
	}
}

/*
 * Gets the data weight for a given point on the map by applying a weighted
 * average to the four nearest data points (or if fewer than four data points,
 * using all the ones available).
 */
function _getDataWeightWind(hm_data, lat, lng) {
	var nearest = [];
	var nearest_distance = [];

	for (var i = 0; i < hm_data.length; i++) {
		if (nearest.length < 4) {
			// Trivial case; populate the first 4 nearest
			nearest.push(hm_data[i]);
			nearest_distance.push(distanceTo(lat, lng, hm_data[i].location
					.lat(), hm_data[i].location.lng()));
		} else {
			var dist_to_i = distanceTo(lat, lng, hm_data[i].location.lat(),
					hm_data[i].location.lng());
			var furthest_near_point = getArrayMax(nearest_distance);
			if (dist_to_i < furthest_near_point) {
				for (var j = 0; j < nearest_distance.length; j++) {
					if (nearest_distance[j] == furthest_near_point) {
						nearest[j] = hm_data[i];
						nearest_distance[j] = dist_to_i;
						break;
					}
				}
			}
		}
	}

	var final_weight = 0;
	if (nearest.length > 0) {
		var dist_sum = nearest_distance.reduce(function(a, b) {
			return a + b;
		});

		for (var i = 0; i < nearest.length; i++) {
			var dist_scaling = Math.pow(WEIGHT_SCALING_DISTANCE
					/ nearest_distance[i], 4);
			if (dist_scaling > 1) {
				dist_scaling = 1;
			}
			final_weight += (nearest[i].weight
					* (1 - nearest_distance[i] / dist_sum) * dist_scaling);
			// final_weight += ((1 - (nearest_distance[i] / dist_sum))
			// * (nearest[i].weight / weight_max));
		}

	}
	return (nearest.length > 0 ? 
			final_weight / (nearest.length > 1 ? nearest.length - 1 : nearest.length/2) : 0);
}