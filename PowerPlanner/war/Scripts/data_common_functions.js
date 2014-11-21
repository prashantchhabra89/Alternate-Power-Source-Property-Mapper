/*
 * Call this to update global data arrays based on raw data. Will process, interpolate,
 * and assign data to matching global array.
 */
function updateData(raw_data, neLat, neLng, swLat, swLng, type) {
	//_setHeatmapSize(type);
	var hm_data = [];
	processData(raw_data, hm_data, neLat, neLng, swLat, swLng, type);	
	
	console.log("Data Points on Screen: " + hm_data.length);
	console.log("Scaler: " + scaler);
	console.log("Zoom: " + g_map.getZoom());
	
	if (POINT_DEBUGGER) {
		if (type == "WIND") {
			wind_data = hm_data;
		} else if (type == "SOLAR") {
			solar_data = hm_data;
		} else if (type == "HYDRO") {
			hydro_data = hm_data;
		}
	} else {
		console.time('_interpolateData');
		if (type == "WIND") {
			wind_data = _interpolateData(hm_data, neLat, neLng, swLat, swLng, type);
		} else if (type == "SOLAR") {
			solar_data = _interpolateData(hm_data, neLat, neLng, swLat, swLng, type);
		} else if (type == "HYDRO") {
			hydro_data = _interpolateData(hm_data, neLat, neLng, swLat, swLng, type);
		}
		console.timeEnd('_interpolateData');
	}
}

/*
 * Call this to process raw data. Don't call it on a single point, give that an
 * offset of some value first so that you don't discard all real data points before
 * determining weights. Note that hydro data is a real troublemaker and doesn't do
 * things like any other data type!
 */
function processData(raw_data, hm_data, neLat, neLng, swLat, swLng, type) {
	var lat_offset = getLatOffset(neLat, swLat);
	var lng_offset = getLngOffset(neLng, swLng);
	set_scaler(type);
	
	if (type == "HYDRO") {
		_filterData(raw_data, hm_data,
				neLat + lat_offset,
				neLng + lng_offset,
				swLat - lat_offset,
				swLng - lng_offset,
				type);
	} else {
		var usable_data = [];
		_filterData(raw_data, usable_data,
				neLat + lat_offset,
				neLng + lng_offset,
				swLat - lat_offset,
				swLng - lng_offset,
				type);
		
		var weight_points = [];
		for (var i = 0; i < usable_data.length; i++) {
			weight_points.push(usable_data[i].weight);
		}
		var topval = getArrayMax(weight_points);
		var botval = getArrayMin(weight_points);
	
		console.log("Top val: " + topval);
		console.log("Bottom val: " + botval);
		
		for (var i = 0; i < usable_data.length; i++) {
			addHeatmapCoord(hm_data, usable_data[i].lat, usable_data[i].lng,
					apply_scaler(usable_data[i].weight, botval, type));
		}
	}
}

function set_scaler(type) {
	if (type == "WIND") {
		scaler = WIND_SCALER;
	} else if (type == "SOLAR") {
		scaler = SOLAR_SCALER;
	} else if (type == "HYDRO") {
		scaler = HYDRO_SCALER;
	}
}

function apply_scaler(raw_weight, offset, type) {
	var scaled = raw_weight / scaler;
	if (type == "SOLAR") {
		scaled = 2.5 * ((Math.pow(10, raw_weight) - Math.pow(10, offset))
				/ Math.pow(10, scaler));
	}
	return scaled;
}

function _filterData(raw_data, push_data, neLat, neLng, swLat, swLng, type) {
	if (type == "WIND") {
		_filterWindData(raw_data, push_data, neLat, neLng, swLat, swLng);
	} else if (type == "SOLAR") {
		_filterSolarData(raw_data, push_data);
	} else if (type == "HYDRO") {
		_filterHydroData(raw_data, push_data, neLat, neLng, swLat, swLng);
	}
}

/*
 * Fills in a grid of all the points visible on the screen as defined by the
 * provided boundary coordinates (with a little bit of bleed over the boundaries
 * to prevent visible edge discolouration) by interpolating values from the
 * provided set of real data points based on a weighting algorithm. Returns the
 * set of interpolated values. Runs the interpolation in bins if the map view is
 * too large.
 */
function _interpolateData(hm_data, neLat, neLng, swLat, swLng, type) {
	var lat_offset = (neLat - swLat);// / 10;
	var lng_offset = (neLng - swLng);// / 10;

	var lat_width = (neLat - swLat) + (2 * lat_offset);
	var lng_width = (neLng - swLng) + (2 * lng_offset);

	var lngset = MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM));
	var latset = lngset / 2;
	var offset = latset;

	var temp_data = [];

	if (type == "WIND") {
		if (view_state != OVER_VIEW) {
			// if (true) {
			_createInterpolation(hm_data, temp_data, lat_width, lng_width,
					swLat - lat_offset, swLng - lng_offset, latset, lngset,
					offset, type);
		} else {
			var d_lat_offset = getLatOffset(neLat, swLat);
			var d_lng_offset = getLngOffset(neLng, swLng);
			var data_bins = _binData(hm_data, neLat, neLng, swLat, swLng,
					d_lat_offset, d_lng_offset);

			var lat_increment = lat_width / 3;
			lat_increment += latset - (lat_increment % latset);
			var lng_increment = lng_width / 3;
			lng_increment -= lng_increment % lngset;
			var BIN_SIZE = 3;

			var lat_start = swLat - lat_offset;
			var lng_start = swLng - lng_offset;
			for (var lngbin = 0; lngbin < BIN_SIZE; lngbin++) {
				for (var latbin = 0; latbin < BIN_SIZE; latbin++) {
					var hm_bin = data_bins[latbin][lngbin].concat(
							data_bins[latbin][lngbin + 1]).concat(
									data_bins[latbin + 1][lngbin]).concat(
											data_bins[latbin + 1][lngbin + 1]);
					var next_inter = _createInterpolation(hm_bin, temp_data,
							lat_increment, lng_increment, lat_start, lng_start,
							latset, lngset, offset, type);
					lat_start = next_inter.max_lat + latset;
					offset = next_inter.offset;
				}
				lat_start = swLat - lat_offset;
				lng_start = _getNextStart(lng_start, lng_start + lng_increment,
						lngset);
				offset = latset; // reset offset
			}
		}
	} else if (type == "HYDRO") {
		_boundedInterpolation(hm_data, temp_data, lat_width, 
				lng_width, swLat - lat_offset, swLng - lng_offset, latset, 
				lngset, offset, type);
	} else {
		_createInterpolation(hm_data, temp_data, lat_width, lng_width,
				swLat - lat_offset, swLng - lng_offset, latset, lngset, 
				offset, type);
	}

	return temp_data;
}

function _boundedInterpolation(hm_data, fill_data, lat_width, 
		lng_width, lat_start, lng_start, latset, lngset, offset, type) {
	console.log(hm_data);
	for (var i = 0; i < hm_data.length; i++) {
		//for (var j = 0; j < hm_data[i].points.length; j++) {
		addHeatmapCoord(fill_data, hm_data[i].points[0].lat, hm_data[i].points[0].lon, 
					Math.random());
		//}
	}
	console.log(fill_data);
}

/*
 * Fills in a grid of all the points visible on the screen as defined by the
 * provided lat/lng widths, beginning from the specified start points and
 * incrementing by the specified lat/lng set values. Applies a specified offset
 * to every other longitudinal row.
 * 
 * hm_data is the array of real data and fill_data is an array to dump the
 * interpolated points into
 * 
 * returns an object containing the maximum latitude value placed, the maximum
 * longitude value placed, and the next offset value (which would have been used
 * had there been another longitude line to add)
 */
function _createInterpolation(hm_data, fill_data, lat_width, lng_width,
		lat_start, lng_start, latset, lngset, offset, type) {
	var curr_offset = offset;
	var max_lat = -90;
	var max_lng = -180;

	for (var i = 0.0; i <= lat_width; i += latset) {
		for (var j = 0.0; j <= lng_width; j += lngset) {
			var lat_point = i + lat_start;
			var lng_point = j + curr_offset + lng_start;
			max_lat = Math.max(max_lat, lat_point);
			max_lng = Math.max(max_lng, lng_point);
			var weighted = getDataWeight(hm_data, lat_point, lng_point, type);
			//console.log("Point Weight: " + weighted);
			if (weighted > MIN_DISPLAY_WEIGHT) {
				addHeatmapCoord(fill_data, lat_point, lng_point, weighted);
			}
		}
		curr_offset = (curr_offset == 0.0 ? latset : 0.0);
	}

	return {
		max_lat : max_lat,
		max_lng : max_lng,
		offset : curr_offset
	};
}

/*
 * Takes in an array of real data points, map boundary points, and offset
 * distances for latitude and longitude. Separates data points into a 4x4 matrix
 * that evenly divides up the boundary size (with offsets added to all sides).
 */
function _binData(hm_data, neLat, neLng, swLat, swLng, data_lat_offset,
		data_lng_offset) {
	var BIN_SIZE = 4;
	var data_bins = [];
	for (var i = 0; i < BIN_SIZE; i++) {
		data_bins[i] = new Array(BIN_SIZE);
		for (var j = 0; j < BIN_SIZE; j++) {
			data_bins[i][j] = [];
		}
	}
	var lat_width = (neLat - swLat) + 2 * data_lat_offset;
	var lng_width = (neLng - swLng) + 2 * data_lng_offset;
	var southLat = swLat - data_lat_offset;
	var westLng = swLng - data_lng_offset;

	var error_state = false;
	for (var i = 0; i < hm_data.length; i++) {
		var lat_bin = 0;
		var lng_bin = 0;
		var curr_lat = southLat + (lat_width / 4);
		var curr_lng = westLng + (lng_width / 4);

		while (hm_data[i].location.lat() > curr_lat) {
			curr_lat += (lat_width / 4);
			lat_bin++;
			if (lat_bin > 3) {
				console.log("ERROR: data point failed to fit into a bin (lat failure)");
				error_state = true;
				break;
			}
		}
		if (error_state) {
			error_state = false;
			break;
		}

		while (hm_data[i].location.lng() > curr_lng) {
			curr_lng += (lng_width / 4);
			lng_bin++;
			if (lng_bin > 3) {
				console.log("ERROR: data point failed to fit into a bin (lng failure)");
				error_state = true;
				break;
			}
		}
		if (error_state) {
			error_state = false;
			break;
		}

		data_bins[lat_bin][lng_bin].push(hm_data[i]);
	}

	for (var i = 0; i < data_bins.length; i++) {
		for (var j = 0; j < data_bins[i].length; j++) {
			console.log("Bin size[" + i + "][" + j + "]: "
					+ data_bins[i][j].length);
		}
	}

	return data_bins;
}

/*
 * When binning, this safely gets you the next point you could safely draw,
 * based on where the next point would be if the view hadn't been cut into
 * sections. Pass in the current start point, the end point of the cut, and the
 * amount you increment by each step.
 */
function _getNextStart(curr_start, end_point, increment) {
	var next_start = curr_start;
	while (next_start < end_point) {
		next_start += increment;
	}

	return next_start;
}

/*
 * Returns true if distance from the lat, lng point is less than the current diameter
 * of the heatmap spots away from the line represented by point1, point2 (if the point
 * lies inside the boundary formed by the points)
 */
function pointOnLine(lat, lng, point1, point2) {
	var is_on_line = false;

	if (lat > Math.min(point1.lat, point2.lat) && lat < Math.max(point1.lat, point2.lat)) {
		if (lng > Math.min(point1.lon, point2.lon) && lng < Math.max(point1.lon, point2.lon)) {
			/*
		 	var slope = (point2.lat - point1.lat)/(point2.lon - point1.lon);
			var A = slope * (-1);
			var B = 1;
			var C = (A * point1.lon + B) * (-1);

			var numer = Math.abs(A*lng + B*lat + C);
			var denom = Math.sqrt(Math.pow(A,2) + Math.pow(B,2));

			var distance = (numer/denom);
			is_on_line = (distance <= 
				MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.98 * 2);
			console.log(distance);
			console.log(MAX_DATA_WIDTH / Math.pow(2, (g_map.getZoom() - LEAST_ZOOM)) * 0.98 * 2);
			 */
			// The above can't get close enough to ever return true with our granularity ...
			is_on_line = true;
		}
	}

	return is_on_line;
}

/*
 * Note: this returns a potentially scaled down weight!
 */
function getDataWeight(hm_data, lat, lng, type) {
	var weight_val = 0;
	if (type == "WIND") {
		weight_val = _getDataWeightWind(hm_data, lat, lng);
	} else if (type == "SOLAR") {
		weight_val = _getDataWeightSolar(hm_data, lat, lng);
	} else if (type == "HYDRO") {
		weight_val = _getDataWeightHydro(hm_data, lat, lng);
	}

	// TODO: Could probably get rid of this after fixing hydro interpolation...
	if (weight_val > 3.5) {
		weight_val = 3.5;
	}
	return weight_val;
}

/*
 * Function to call to get data from a point on the map. Provided the latitude
 * and longitude of a point, this returns a pointDataObj, which has the
 * wind_raw, solar_raw, hydro_raw, and total_energy properties.
 * 
 * All this data is fake right now.
 * 
 * TODO: Tie this in with getDataWeight ... it's exactly what's needed, though
 * ajax calls will need to be handled here first.
 */
function getPointData(lat_point, lng_point) {
	return pointDataObj = {
			lat : lat_point,
			lng : lng_point,
			wind_raw : null,
			solar_raw : null,
			hydro_raw : null
	};
}

/*
 * You want real data for each energy type at a single point? Well here you go!
 * Feast your eyes on this!
 * 
 * TODO: Clean this up a little bit. Could stand a bit of modularizing...
 */
function populatePointData(pointDataObj, uniq_id) {
	var offset = 0.05;
	
	var neLat = pointDataObj.lat + offset;
	var neLng = pointDataObj.lng + offset;
	var swLat = pointDataObj.lat - offset;
	var swLng = pointDataObj.lng - offset;

	if (wind_data.length) {
		pointDataObj.wind_raw = _getDataWeightWind(wind_data, pointDataObj.lat, pointDataObj.lng)
			* WIND_SCALER;
		$("#" + uniq_id + " .windstring").html(pointDataObj.wind_raw.toFixed(2).toString());
		_tryPopulateTotalEnergy(pointDataObj, uniq_id);
	} else if (checkCache(neLat, neLng, swLat, swLng, "WIND")) {
		var hm_data = [];
		var raw_data = fetchFromCache(pointDataObj.lat, pointDataObj.lng, 
				pointDataObj.lat, pointDataObj.lng, "WIND");
		processData(raw_data, hm_data, neLat, neLng, swLat, swLng, "WIND");
		pointDataObj.wind_raw = _getDataWeightWind(hm_data, pointDataObj.lat, pointDataObj.lng)
			* WIND_SCALER;
		$("#" + uniq_id + " .windstring").html(pointDataObj.wind_raw.toFixed(2).toString());
		_tryPopulateTotalEnergy(pointDataObj, uniq_id);
	} else {
		queryAndCallback('anu', neLat, neLng, swLat, swLng, 0, 0, "WIND", function(data) {
			var hm_data = [];
			processData(data, hm_data, neLat, neLng, swLat, swLng, "WIND");
			pointDataObj.wind_raw = _getDataWeightWind(hm_data, pointDataObj.lat, pointDataObj.lng)
				* WIND_SCALER;
			$("#" + uniq_id + " .windstring").html(pointDataObj.wind_raw.toFixed(2).toString());
			_tryPopulateTotalEnergy(pointDataObj, uniq_id);
		});
	}
	
	if (solar_data.length) {
		pointDataObj.solar_raw = _getDataWeightSolar(solar_data, pointDataObj.lat, pointDataObj.lng)
			* SOLAR_SCALER;
		$("#" + uniq_id + " .solarstring").html(pointDataObj.solar_raw.toFixed(2).toString());
		_tryPopulateTotalEnergy(pointDataObj, uniq_id);
	} else if (checkCache(neLat, neLng, swLat, swLng, "SOLAR")) {
		var hm_data = [];
		var raw_data = fetchFromCache(pointDataObj.lat, pointDataObj.lng,
				pointDataObj.lat, pointDataObj.lng, "SOLAR");
		processData(raw_data, hm_data, neLat, neLng, swLat, swLng, "SOLAR");
		pointDataObj.solar_raw = _getDataWeightSolar(hm_data, pointDataObj.lat, pointDataObj.lng)
			* SOLAR_SCALER;
		$("#" + uniq_id + " .solarstring").html(pointDataObj.solar_raw.toFixed(2).toString());
		_tryPopulateTotalEnergy(pointDataObj, uniq_id);
	} else {
		queryAndCallback('anu', neLat, neLng, swLat, swLng, 0, 0, "SOLAR", function(data) {
			var hm_data = [];
			processData(data, hm_data, neLat, neLng, swLat, swLng, "SOLAR");
			pointDataObj.solar_raw = _getDataWeightSolar(hm_data, pointDataObj.lat, pointDataObj.lng)
				* SOLAR_SCALER;
			$("#" + uniq_id + " .solarstring").html(pointDataObj.solar_raw.toFixed(2).toString());
			_tryPopulateTotalEnergy(pointDataObj, uniq_id);
		});
	}
	
	if (hydro_data.length) {
		pointDataObj.hydro_raw = _getDataWeightHydro(hydro_data, pointDataObj.lat, pointDataObj.lng)
			* HYDRO_SCALER;
		$("#" + uniq_id + " .hydrostring").html(pointDataObj.hydro_raw.toFixed(2).toString());
		_tryPopulateTotalEnergy(pointDataObj, uniq_id);
	} else if (checkCache(neLat, neLng, swLat, swLng, "HYDRO")) {
		var hm_data = [];
		var raw_data = fetchFromCache(pointDataObj.lat, pointDataObj.lng,
				pointDataObj.lat, pointDataObj.lng, "HYDRO");
		processData(raw_data, hm_data, neLat, neLng, swLat, swLng, "HYDRO");
		pointDataObj.hydro_raw = _getDataWeightHydro(hm_data, pointDataObj.lat, pointDataObj.lng)
			* HYDRO_SCALER;
		$("#" + uniq_id + " .hydrostring").html(pointDataObj.hydro_raw.toFixed(2).toString());
		_tryPopulateTotalEnergy(pointDataObj, uniq_id);
	}  else {
		queryAndCallback('anu', neLat, neLng, swLat, swLng, 0, 0, "HYDRO", function(data) {
			var hm_data = [];
			processData(data, hm_data, neLat, neLng, swLat, swLng, "HYDRO");
			pointDataObj.hydro_raw = _getDataWeightHydro(hm_data, pointDataObj.lat, pointDataObj.lng)
				* HYDRO_SCALER;
			$("#" + uniq_id + " .hydrostring").html(pointDataObj.hydro_raw.toFixed(2).toString());
			_tryPopulateTotalEnergy(pointDataObj, uniq_id);
		});
	}
}

/*
 * If all the energy types of a pointDataObj have a value, populate the total
 * energy. 
 */
function _tryPopulateTotalEnergy(pointDataObj, uniq_id) {
	if (pointDataObj.wind_raw != null && 
			pointDataObj.solar_raw != null && 
			pointDataObj.hydro_raw != null) {
		var totalEnergy = pointDataObj.wind_raw + pointDataObj.solar_raw + 
			pointDataObj.hydro_raw;
		$("#" + uniq_id + " .totalstring").html(totalEnergy.toFixed(2).toString());
	}
}

/*
 * Get season's representative index.
 */
function parseSeason(season) {
	var season_index = 0;
	switch(season) {
	case "anu": season_index = 0; break;
	case "djf": season_index = 1; break;
	case "mam": season_index = 2; break;
	case "jja": season_index = 3; break;
	case "son": season_index = 4; break;
	}
	return season_index;
}
