/**
 * 
 */
var interpolated_area = {
	neLat: -90,
	neLng: -180,
	swLat: 90,
	swLng: 180,
	type: "WIND",
	season: "anu",
	default_state: true,
	reset_values: function() {
		this.neLat = -90;
		this.neLng = -180;
		this.swLat = 90;
		this.swLng = 180;
		this.type = "WIND";
		this.season = "anu";
		this.default_state = true;
	},
	process: function(new_neLat,new_neLng,new_swLat,new_swLng,new_type) {
		if(this.neLat <= new_neLat && this.neLng <= new_neLng) {
			this.neLat = new_neLat;
			this.neLng = new_neLng;
			this.type = new_type;
			this.default_state = false;
		}
		if(this.swLat >= new_swLat && this.swLng >= new_swLng) {
			this.swLat = new_swLat;
			this.swLng = new_swLng;
			this.type = new_type;
			this.default_state = false;
		}
	},
	extraArea: function(new_neLat,new_neLng,new_swLat,new_swLng) {
		var areas = [];
		if(this.neLat >= new_neLat && this.neLng <= new_neLng && this.swLat <= new_swLat) {
			// towards right
			for(var i = this.swLat; i < this.neLat; i = i + grid_size.lat) {
				areas.push({
					neLat: i + grid_size.lat,
					neLng: this.neLng + grid_size.lng,
					swLat: i,
					swLng: this.neLng
				});
			}
		} else if(this.neLng >= new_neLng && this.swLng <= new_swLng && this.swLat >= new_swLat) {
			// towards down
			for(var i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
				areas.push({
					neLat: this.swLat,
					neLng: i + grid_size.lng,
					swLat: this.swLat - grid_size.lat,
					swLng: i
				});
			}
		} else if(this.neLat >= new_neLat && this.swLng >= new_swLng && this.swLat <= new_swLat) {
			// towards left
			for(var i = this.swLat; i < this.neLat; i = i + grid_size.lat) {
				areas.push({
					neLat: i + grid_size.lat,
					neLng: this.swLng,
					swLat: i,
					swLng: this.swLng - grid_size.lng
				});
			}
		} else if(this.neLng >= new_neLng && this.swLng <= new_swLng && this.neLat <= new_neLat) {
			// towards up
			for(var i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
				areas.push({
					neLat: this.neLat + grid_size.lat,
					neLng: i + grid_size.lng,
					swLat: this.neLat,
					swLng: i
				});
			}
		} else if(this.neLng <= new_neLng && this.swLng <= new_swLng && this.neLat <= new_neLat) {
			// towards right up
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
				areas.push({
					neLat: this.neLat + grid_size.lat,
					neLng: i + grid_size.lng,
					swLat: this.neLat,
					swLng: i
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
				areas.push({
					neLat: j + grid_size.lat,
					neLng: this.neLng + grid_size.lng,
					swLat: j,
					swLng: this.neLng
				});
			}
			areas.push({
				neLat: j + grid_size.lat,
				neLng: i + grid_size.lng,
				swLat: j,
				swLng: i
			});
		} else if(this.neLng <= new_neLng && this.swLng <= new_swLng && this.swLat >= new_swLat) {
			// towards right down
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
				areas.push({
					neLat: this.swLat,
					neLng: i + grid_size.lng,
					swLat: this.swLat - grid_size.lat,
					swLng: i
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
				areas.push({
					neLat: j + grid_size.lat,
					neLng: this.neLng + grid_size.lng,
					swLat: j,
					swLng: this.neLng
				});
			}
			areas.push({
				neLat: this.swLat,
				neLng: i + grid_size.lng,
				swLat: this.swLat - grid_size.lat,
				swLng: i
			});
		} else if(this.neLng >= new_neLng && this.swLng >= new_swLng && this.neLat <= new_neLat) {
			// towards left up
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
				areas.push({
					neLat: this.neLat + grid_size.lat,
					neLng: i + grid_size.lng,
					swLat: this.neLat,
					swLng: i
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
				areas.push({
					neLat: j + grid_size.lat,
					neLng: this.swLng,
					swLat: j,
					swLng: this.swLng - grid_size.lng
				});
			}
			areas.push({
				neLat: j + grid_size.lat,
				neLng: this.swLng,
				swLat: j,
				swLng: this.swLng - grid_size.lng
			});
		} else if(this.neLng >= new_neLng && this.swLng >= new_swLng && this.swLat >= new_swLat) {
			// towards left down
			var i = 0.0;
			for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
				areas.push({
					neLat: this.swLat,
					neLng: i + grid_size.lng,
					swLat: this.swLat - grid_size.lat,
					swLng: i
				});
			}
			var j = 0.0;
			for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
				areas.push({
					neLat: j + grid_size.lat,
					neLng: this.swLng,
					swLat: j,
					swLng: this.swLng - grid_size.lng
				});
			}
			areas.push({
				neLat: this.swLat,
				neLng: this.swLng,
				swLat: this.swLat - grid_size.lat,
				swLng: this.swLng - grid_size.lng
			});
		} else {
			// zoomed
			var temp_neLat = this.neLat;
			var temp_neLng = this.neLng;
			var temp_swLat = this.swLat;
			var temp_swLng = this.swLng;
			while(temp_neLat <= new_neLat + grid_size.lat || temp_neLng <= new_neLng + grid_size.lng|| temp_swLng >= new_swLng - grid_size.lng || temp_swLat >= new_swLat - grid_size.lat) {
				temp_neLat = temp_neLat + grid_size.lat;
				temp_neLng = temp_neLng + grid_size.lng;
				temp_swLat = temp_swLat - grid_size.lat;
				temp_swLng = temp_swLng - grid_size.lng;
				for(var i = this.swLng - grid_size.lng; i < this.neLng + grid_size.lng; i = i + grid_size.lng) {
					areas.push({
						neLat: this.swLat,
						neLng: i + grid_size.lng,
						swLat: this.swLat - grid_size.lat,
						swLng: i
					});
					areas.push({
						neLat: this.neLat + grid_size.lat,
						neLng: i + grid_size.lng,
						swLat: this.neLat,
						swLng: i
					});
				}
				for(var j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
					areas.push({
						neLat: j + grid_size.lat,
						neLng: this.swLng,
						swLat: j,
						swLng: this.swLng - grid_size.lng
					});
					areas.push({
						neLat: j + grid_size.lat,
						neLng: this.neLng + grid_size.lng,
						swLat: j,
						swLng: this.neLng
					});
				}
			}
		}
		return areas;
	}
};

var grid_size = {
	lat: 0,
	lng: 0,
	default_state: true,
	type: "NONE",
	init: function(neLat,neLng,swLat,swLng,new_type) {
		if(this.default_state) {
			this.lat = neLat-swLat;
			this.lng = neLng-swLng;
			this.type = new_type;
			this.default_state = false;
		}
	},
	reset_state: function() {
		this.lat = 0;
		this.lng = 0;
		this.type = "NONE";
		this.default_state = true;
	}
}

function calc_extra_area(new_neLat,new_neLng,new_swLat,new_swLng) {
	var areas = [];
	if(this.neLat >= new_neLat && this.neLng <= new_neLng && this.swLat <= new_swLat) {
		// towards right
		for(var i = this.swLat; i < this.neLat; i = i + grid_size.lat) {
			areas.push({
				neLat: i + grid_size.lat,
				neLng: this.neLng + grid_size.lng,
				swLat: i,
				swLng: this.neLng
			});
		}
	} else if(this.neLng >= new_neLng && this.swLng <= new_swLng && this.swLat >= new_swLat) {
		// towards down
		for(var i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
			areas.push({
				neLat: this.swLat,
				neLng: i + grid_size.lng,
				swLat: this.swLat - grid_size.lat,
				swLng: i
			});
		}
	} else if(this.neLat >= new_neLat && this.swLng >= new_swLng && this.swLat <= new_swLat) {
		// towards left
		for(var i = this.swLat; i < this.neLat; i = i + grid_size.lat) {
			areas.push({
				neLat: i + grid_size.lat,
				neLng: this.swLng,
				swLat: i,
				swLng: this.swLng - grid_size.lng
			});
		}
	} else if(this.neLng >= new_neLng && this.swLng <= new_swLng && this.neLat <= new_neLat) {
		// towards up
		for(var i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
			areas.push({
				neLat: this.neLat + grid_size.lat,
				neLng: i + grid_size.lng,
				swLat: this.neLat,
				swLng: i
			});
		}
	} else if(this.neLng <= new_neLng && this.swLng <= new_swLng && this.neLat <= new_neLat) {
		// towards right up
		var i = 0.0;
		for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
			areas.push({
				neLat: this.neLat + grid_size.lat,
				neLng: i + grid_size.lng,
				swLat: this.neLat,
				swLng: i
			});
		}
		var j = 0.0;
		for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
			areas.push({
				neLat: j + grid_size.lat,
				neLng: this.neLng + grid_size.lng,
				swLat: j,
				swLng: this.neLng
			});
		}
		areas.push({
			neLat: j + grid_size.lat,
			neLng: i + grid_size.lng,
			swLat: j,
			swLng: i
		});
	} else if(this.neLng <= new_neLng && this.swLng <= new_swLng && this.swLat >= new_swLat) {
		// towards right down
		var i = 0.0;
		for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
			areas.push({
				neLat: this.swLat,
				neLng: i + grid_size.lng,
				swLat: this.swLat - grid_size.lat,
				swLng: i
			});
		}
		var j = 0.0;
		for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
			areas.push({
				neLat: j + grid_size.lat,
				neLng: this.neLng + grid_size.lng,
				swLat: j,
				swLng: this.neLng
			});
		}
		areas.push({
			neLat: this.swLat,
			neLng: i + grid_size.lng,
			swLat: this.swLat - grid_size.lat,
			swLng: i
		});
	} else if(this.neLng >= new_neLng && this.swLng >= new_swLng && this.neLat <= new_neLat) {
		// towards left up
		var i = 0.0;
		for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
			areas.push({
				neLat: this.neLat + grid_size.lat,
				neLng: i + grid_size.lng,
				swLat: this.neLat,
				swLng: i
			});
		}
		var j = 0.0;
		for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
			areas.push({
				neLat: j + grid_size.lat,
				neLng: this.swLng,
				swLat: j,
				swLng: this.swLng - grid_size.lng
			});
		}
		areas.push({
			neLat: j + grid_size.lat,
			neLng: this.swLng,
			swLat: j,
			swLng: this.swLng - grid_size.lng
		});
	} else if(this.neLng >= new_neLng && this.swLng >= new_swLng && this.swLat >= new_swLat) {
		// towards left down
		var i = 0.0;
		for(i = this.swLng; i < this.neLng; i = i + grid_size.lng) {
			areas.push({
				neLat: this.swLat,
				neLng: i + grid_size.lng,
				swLat: this.swLat - grid_size.lat,
				swLng: i
			});
		}
		var j = 0.0;
		for(j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
			areas.push({
				neLat: j + grid_size.lat,
				neLng: this.swLng,
				swLat: j,
				swLng: this.swLng - grid_size.lng
			});
		}
		areas.push({
			neLat: this.swLat,
			neLng: this.swLng,
			swLat: this.swLat - grid_size.lat,
			swLng: this.swLng - grid_size.lng
		});
	} else {
		// zoomed
		var temp_neLat = this.neLat;
		var temp_neLng = this.neLng;
		var temp_swLat = this.swLat;
		var temp_swLng = this.swLng;
		while(temp_neLat <= new_neLat + grid_size.lat || temp_neLng <= new_neLng + grid_size.lng|| temp_swLng >= new_swLng - grid_size.lng || temp_swLat >= new_swLat - grid_size.lat) {
			temp_neLat = temp_neLat + grid_size.lat;
			temp_neLng = temp_neLng + grid_size.lng;
			temp_swLat = temp_swLat - grid_size.lat;
			temp_swLng = temp_swLng - grid_size.lng;
			for(var i = this.swLng - grid_size.lng; i < this.neLng + grid_size.lng; i = i + grid_size.lng) {
				areas.push({
					neLat: this.swLat,
					neLng: i + grid_size.lng,
					swLat: this.swLat - grid_size.lat,
					swLng: i
				});
				areas.push({
					neLat: this.neLat + grid_size.lat,
					neLng: i + grid_size.lng,
					swLat: this.neLat,
					swLng: i
				});
			}
			for(var j = this.swLat; j < this.neLat; j = j + grid_size.lat) {
				areas.push({
					neLat: j + grid_size.lat,
					neLng: this.swLng,
					swLat: j,
					swLng: this.swLng - grid_size.lng
				});
				areas.push({
					neLat: j + grid_size.lat,
					neLng: this.neLng + grid_size.lng,
					swLat: j,
					swLng: this.neLng
				});
			}
		}
	}
	return areas;
}