var interpolated_area = {
	neLat: -90,
	neLng: -180,
	swLat: 90,
	swLng: 180,
	wind: false,
	solar: false,
	hydro: false,
	season: "anu",
	default_state: true,
	isType: function(type) {
		switch(type) {
		case "WIND": return this.wind; break;
		case "SOLAR": return this.solar; break;
		case "HYDRO": return this.hydro; break;
		}
	},
	reset_values: function() {
		this.neLat = -90;
		this.neLng = -180;
		this.swLat = 90;
		this.swLng = 180;
		this.wind = false;
		this.solar = false;
		this.hydro = false;
		this.season = "anu";
		this.default_state = true;
	},
	process: function(new_neLat,new_neLng,new_swLat,new_swLng,new_type) {
		if(this.neLat <= new_neLat) {
			this.neLat = new_neLat;
			this.default_state = false;
			switch(new_type) {
			case "WIND": this.wind = true; break;
			case "SOLAR": this.wind = true; break;
			case "HYDRO": this.wind = true; break;
			}
		}
		if(this.neLng <= new_neLng) {
			this.neLng = new_neLng;
			this.default_state = false;
			switch(new_type) {
			case "WIND": this.wind = true; break;
			case "SOLAR": this.wind = true; break;
			case "HYDRO": this.wind = true; break;
			}
		}
		if(this.swLat >= new_swLat) {
			this.swLat = new_swLat;
			this.default_state = false;
			switch(new_type) {
			case "WIND": this.wind = true; break;
			case "SOLAR": this.wind = true; break;
			case "HYDRO": this.wind = true; break;
			}
		}
		if(this.swLng >= new_swLng) {
			this.swLng = new_swLng;
			this.default_state = false;
			switch(new_type) {
			case "WIND": this.wind = true; break;
			case "SOLAR": this.wind = true; break;
			case "HYDRO": this.wind = true; break;
			}
		}
	},
	extraArea: function(new_neLat,new_neLng,new_swLat,new_swLng) {
		var areas = [];
		var interpol_lat_offset = grid_size.interpol_lat_offset;
		var interpol_lng_offset = grid_size.interpol_lng_offset;
		
		if(this.neLat >= new_neLat && this.neLng <= new_neLng && this.swLat <= new_swLat) {
			// towards right
			for(var i = this.swLat; i < this.neLat; i = i + grid_size.lat + interpol_lat_offset * 2) {
				areas.push({
					neLat: i + grid_size.lat + interpol_lat_offset,
					neLng: this.neLng + grid_size.lng + interpol_lng_offset,
					swLat: i + interpol_lat_offset,
					swLng: this.neLng + interpol_lng_offset
				});
			}
		} else if(this.neLng >= new_neLng && this.swLng <= new_swLng && this.swLat >= new_swLat) {
			// towards down
			for(var i = this.swLng; i < this.neLng; i = i + grid_size.lng + interpol_lng_offset * 2) {
				areas.push({
					neLat: this.swLat - interpol_lat_offset,
					neLng: i + grid_size.lng + interpol_lng_offset,
					swLat: this.swLat - grid_size.lat - interpol_lat_offset,
					swLng: i + interpol_lng_offset
				});
			}
		} else if(this.neLat >= new_neLat && this.swLng >= new_swLng && this.swLat <= new_swLat) {
			// towards left
			for(var i = this.swLat; i < this.neLat; i = i + grid_size.lat + interpol_lat_offset * 2) {
				areas.push({
					neLat: i + grid_size.lat + interpol_lat_offset,
					neLng: this.swLng - interpol_lng_offset,
					swLat: i + interpol_lat_offset,
					swLng: this.swLng - grid_size.lng - interpol_lng_offset
				});
			}
		} else if(this.neLng >= new_neLng && this.swLng <= new_swLng && this.neLat <= new_neLat) {
			// towards up
			for(var i = this.swLng; i < this.neLng; i = i + grid_size.lng + interpol_lng_offset * 2) {
				areas.push({
					neLat: this.neLat + grid_size.lat + interpol_lat_offset,
					neLng: i + grid_size.lng + interpol_lng_offset,
					swLat: this.neLat + interpol_lat_offset,
					swLng: i + interpol_lng_offset
				});
			}
		} else if(this.neLng <= new_neLng && this.swLng <= new_swLng && this.neLat <= new_neLat) {
			// towards right up
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng + interpol_lng_offset * 2) {
				areas.push({
					neLat: this.neLat + grid_size.lat + interpol_lat_offset,
					neLng: i + grid_size.lng + interpol_lng_offset,
					swLat: this.neLat + interpol_lat_offset,
					swLng: i + interpol_lng_offset
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat + interpol_lat_offset * 2) {
				areas.push({
					neLat: j + grid_size.lat + interpol_lat_offset,
					neLng: this.neLng + grid_size.lng + interpol_lng_offset,
					swLat: j + interpol_lat_offset,
					swLng: this.neLng + interpol_lng_offset
				});
			}
			areas.push({
				neLat: j + grid_size.lat + interpol_lat_offset,
				neLng: i + grid_size.lng + interpol_lng_offset,
				swLat: j + interpol_lat_offset,
				swLng: i + interpol_lng_offset
			});
		} else if(this.neLng <= new_neLng && this.swLng <= new_swLng && this.swLat >= new_swLat) {
			// towards right down
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng + interpol_lng_offset * 2) {
				areas.push({
					neLat: this.swLat - interpol_lat_offset,
					neLng: i + grid_size.lng + interpol_lng_offset,
					swLat: this.swLat - grid_size.lat - interpol_lat_offset,
					swLng: i + interpol_lng_offset
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat + interpol_lat_offset * 2) {
				areas.push({
					neLat: j + grid_size.lat + interpol_lat_offset,
					neLng: this.neLng + grid_size.lng + interpol_lng_offset,
					swLat: j + interpol_lat_offset,
					swLng: this.neLng + interpol_lng_offset
				});
			}
			areas.push({
				neLat: this.swLat - interpol_lat_offset,
				neLng: i + grid_size.lng + interpol_lng_offset,
				swLat: this.swLat - grid_size.lat - interpol_lat_offset,
				swLng: i + interpol_lng_offset
			});
		} else if(this.neLng >= new_neLng && this.swLng >= new_swLng && this.neLat <= new_neLat) {
			// towards left up
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng + interpol_lng_offset * 2) {
				areas.push({
					neLat: this.neLat + grid_size.lat + interpol_lat_offset,
					neLng: i + grid_size.lng + interpol_lng_offset,
					swLat: this.neLat + interpol_lat_offset,
					swLng: i + interpol_lng_offset
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat + interpol_lat_offset * 2) {
				areas.push({
					neLat: j + grid_size.lat + interpol_lat_offset,
					neLng: this.swLng - interpol_lng_offset,
					swLat: j + interpol_lat_offset,
					swLng: this.swLng - grid_size.lng - interpol_lng_offset
				});
			}
			areas.push({
				neLat: j + grid_size.lat + interpol_lat_offset,
				neLng: this.swLng - interpol_lng_offset,
				swLat: j + interpol_lat_offset,
				swLng: this.swLng - grid_size.lng - interpol_lng_offset
			});
		} else if(this.neLng >= new_neLng && this.swLng >= new_swLng && this.swLat >= new_swLat) {
			// towards left down
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng + interpol_lng_offset * 2) {
				areas.push({
					neLat: this.swLat - interpol_lat_offset,
					neLng: i + grid_size.lng + interpol_lng_offset,
					swLat: this.swLat - grid_size.lat - interpol_lat_offset,
					swLng: i + interpol_lng_offset
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat + interpol_lat_offset * 2) {
				areas.push({
					neLat: j + grid_size.lat + interpol_lat_offset,
					neLng: this.swLng - interpol_lng_offset,
					swLat: j + interpol_lat_offset,
					swLng: this.swLng - grid_size.lng - interpol_lng_offset
				});
			}
			areas.push({
				neLat: this.swLat - interpol_lat_offset,
				neLng: this.swLng - interpol_lng_offset,
				swLat: this.swLat - grid_size.lat - interpol_lat_offset,
				swLng: this.swLng - grid_size.lng - interpol_lng_offset
			});
		} else {
			// zoomed
			var temp_neLat = this.neLat;
			var temp_neLng = this.neLng;
			var temp_swLat = this.swLat;
			var temp_swLng = this.swLng;
			while(temp_neLat <= new_neLat || temp_neLng <= new_neLng || 
					temp_swLng >= new_swLng || temp_swLat >= new_swLat) {				
				for(var i = temp_swLng - grid_size.lng  - interpol_lng_offset * 2; 
				i < temp_neLng + grid_size.lng + interpol_lng_offset * 2; 
				i = i + grid_size.lng + interpol_lng_offset * 2) {
					areas.push({
						neLat: temp_swLat - interpol_lat_offset,
						neLng: i + grid_size.lng + interpol_lng_offset,
						swLat: temp_swLat - grid_size.lat - interpol_lat_offset,
						swLng: i + interpol_lng_offset
					});
					areas.push({
						neLat: temp_neLat + grid_size.lat + interpol_lat_offset,
						neLng: i + grid_size.lng + interpol_lng_offset,
						swLat: temp_neLat + interpol_lat_offset,
						swLng: i + interpol_lng_offset
					});
				}
				for(var j = temp_swLat; j < temp_neLat; j = j + grid_size.lat + interpol_lat_offset * 2) {
					areas.push({
						neLat: j + grid_size.lat + interpol_lat_offset,
						neLng: temp_swLng - interpol_lng_offset,
						swLat: j + interpol_lat_offset,
						swLng: temp_swLng - grid_size.lng - interpol_lng_offset
					});
					areas.push({
						neLat: j + grid_size.lat + interpol_lat_offset,
						neLng: temp_neLng + grid_size.lng + interpol_lng_offset,
						swLat: j + interpol_lat_offset,
						swLng: temp_neLng + interpol_lng_offset
					});
				}
				temp_neLat = temp_neLat + grid_size.lat + interpol_lng_offset * 2;
				temp_neLng = temp_neLng + grid_size.lng + interpol_lng_offset * 2;
				temp_swLat = temp_swLat - grid_size.lat - interpol_lng_offset * 2;
				temp_swLng = temp_swLng - grid_size.lng - interpol_lng_offset * 2;
			}
		}
		return areas;
	}
};

var grid_size = {
	lat: 0,
	lng: 0,
	interpol_lat_offset: 0,
	interpol_lng_offset: 0,
	default_state: true,
	wind: false,
	solar: false,
	hydro: false,
	init: function(neLat,neLng,swLat,swLng,type) {
		if(this.default_state) {
			this.lat = neLat-swLat;
			this.lng = neLng-swLng;
			this.wind = type.wind;
			this.solar = type.solar;
			this.hydro = type.hydro;
			this.interpol_lat_offset = this.lat / 10;
			this.interpol_lng_offset = this.lng / 10;
			this.default_state = false;
		}
	},
	reset_state: function() {
		this.lat = 0;
		this.lng = 0;
		this.wind = false;
		this.solar = false;
		this.hydro = false;
		this.interpol_lat_offset = 0;
		this.interpol_lng_offset = 0;
		this.default_state = true;
	}
};

function calc_init_extra_area(neLat,neLng,swLat,swLng) {
	var areas = [];
	var interpol_lat_offset = grid_size.interpol_lat_offset;
	var interpol_lng_offset = grid_size.interpol_lng_offset;
	var new_neLat = neLat + interpol_lat_offset;
	var new_neLng = neLng + interpol_lng_offset;
	var new_swLat = swLat - interpol_lat_offset;
	var new_swLng = swLng - interpol_lng_offset;
	var i = 0;
	var j = 0;
	var k = 0;
	var l = 0;
	var m = 0;
	for(k = 1, l = new_swLat - interpol_lat_offset, m = new_neLat + interpol_lat_offset; 
	k < 2; k++, l = l - grid_size.lat - interpol_lat_offset * 2, m = m + grid_size.lat + interpol_lat_offset * 2) {
		for(i = new_swLng - grid_size.lng * k  - interpol_lng_offset * 2 * k, j = 2 - k * 2; 
		j < 3;//i < new_neLng + grid_size.lng + interpol_lng_offset * 2; 
		i = i + grid_size.lng + interpol_lng_offset * 2, j++) {
			areas.push({
				neLat: l,
				neLng: i + grid_size.lng + interpol_lng_offset,
				swLat: l - grid_size.lat,
				swLng: i + interpol_lng_offset
			});
			areas.push({
				neLat: m + grid_size.lat,
				neLng: i + grid_size.lng + interpol_lng_offset,
				swLat: m,
				swLng: i + interpol_lng_offset
			});
		}
	}
	for(k = 0, l = new_swLng - interpol_lng_offset, m = new_neLng + interpol_lng_offset; 
	k < 1; k++, l = l - grid_size.lng - interpol_lng_offset * 2, m = m + grid_size.lng + interpol_lng_offset * 2) {
		for(i = new_swLat - grid_size.lat * k  + interpol_lat_offset - interpol_lat_offset * 2 * k, j = 0 - k * 2; 
		j < 1;//i < new_neLng + grid_size.lng + interpol_lng_offset * 2; 
		i = i + grid_size.lat + interpol_lat_offset * 2, j++) {
			areas.push({
				neLat: i + grid_size.lat,
				neLng: l,
				swLat: i,
				swLng: l - grid_size.lng
			});
			areas.push({
				neLat: i + grid_size.lat,
				neLng: m + grid_size.lng,
				swLat: i,
				swLng: m
			});
		}
	}
	return areas;
}