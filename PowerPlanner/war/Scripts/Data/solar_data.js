/*
 * Filters the solar data, adding to an array data points with full power potential.
 * 
 * 	raw_data: unprocessed data from server
 * 	push_data: array that will be filled with filtered data
 */
function _filterSolarData(raw_data, push_data) {
	for (var i = 0; i < raw_data.length; i++) {
		push_data.push({
			lat : raw_data[i].lat,
			lng : raw_data[i].lon,
			weight : solarPow(raw_data[i].deg45,0.2,1.25,0.9)
		});
	}
}

/*
 * Gets the weight (power potential) of the data at the specified geometric
 * point. Divides data into points on an XY plane with the geometric point
 * located at the center. Applies scaled weight from closest point in each
 * plane. If any plane has no points, data weight begins to decay rapidly.
 * 
 *  hm_data: processed real data
 *  lat, lng: geometric point to get weight of
 *  
 *  returns: interpolated point weight
 */
function _getDataWeightSolar(hm_data, lat, lng) {
	var nearest = [];
	var nearest_distance = [];

	var data_bins = [ [], [], [], [] ];

	for (var i = 0; i < hm_data.length; i++) {
		if (lat >= hm_data[i].location.lat()) {
			if (lng >= hm_data[i].location.lng()) {
				data_bins[0].push(hm_data[i]);
			} else {
				data_bins[3].push(hm_data[i]);
			}
		} else {
			if (lng >= hm_data[i].location.lng()) {
				data_bins[1].push(hm_data[i]);
			} else {
				data_bins[2].push(hm_data[i]);
			}
		}
	}

	// Find nearest point in each bin (or find nothing if empty bin)
	for (var i = 0; i < data_bins.length; i++) {
		for (var j = 0; j < data_bins[i].length; j++) {
			if (nearest.length < (i+1)) {
				// Trivial case; the first point looked at is the nearest so far
				nearest.push(data_bins[i][j]);
				nearest_distance.push(distanceTo(lat, lng, data_bins[i][j].location
						.lat(), data_bins[i][j].location.lng()));
			} else {
				var dist_to_j = distanceTo(lat, lng, data_bins[i][j].location
						.lat(), data_bins[i][j].location.lng())
						if (dist_to_j < nearest_distance[i]) {
							nearest[i] = data_bins[i][j];
							nearest_distance[i] = dist_to_j;
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
			var dist_scaling = Math.pow(SOLAR_SCALING_DISTANCE / nearest_distance[i],
					4 - nearest.length + 1);
			if (dist_scaling > 1) {
				dist_scaling = 1;
			}

			final_weight += (nearest[i].weight * (1 - nearest_distance[i] / dist_sum)
					* dist_scaling);
		}
	}

	return (nearest.length > 0 ? final_weight / nearest.length : 0);
}
