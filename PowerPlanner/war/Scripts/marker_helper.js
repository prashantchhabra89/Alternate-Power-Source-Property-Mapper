// *********************************************************************************************
// ********************************** Code by Charlie ******************************************
// *********************************************************************************************
// ******* The terms "info window", "balloon" and "bubble" are used interchangeably. ***********

// the following adds an info window (bubble) to the map upon right click. 
// Until now, the marker is not created yet.
// Yes, we created a bubble first, then we created a marker.
// markerBalloon is declared global.
var markerBalloon = new google.maps.InfoWindow();
var markerSet = [];

/* For unique ids */
var markerHTMLIdSubscript = 0;

// Code for get rid of top-left bug. Doesn't affect functions.
// Explanation:
// When an info window is created, it is not tied with any marker.
// When it is first tied with a marker, and the function "marker.open(position)" is called, 
// the info window will be shown at the top left corner instead of at "position" parameter
// for a very brief moment with its proper content. Wouldn't be a big problem if the bubble
// doesn't contain a lot of information to display; but in our case, the bubble has several lines,
// so that can be a problem. (Real big bubble flashes at an inappropriate place)
// This behavior is probably not designed by google on purpose. I would say this is a bug from google;
// however there is a solution.

// Solution is here: before tying our bubble to the proper marker created by a right click, 
// we first tie our bubble with a temporary marker called "testMarker". 
// Then we tell the bubble to open at position "null", so the bubble is not actually shown with
// testMarker. But since the bubble is tied with a marker already, re-tying it with another one
// won't cause the "top left flash" bug anymore. 

// create a temporary marker.
function initializeMarkers(map) {
	testMarker = new google.maps.Marker({
		position:map.getCenter(),
		map : map,
		icon : "../../images/icon_nopower.png"	
	});
	// tie our balloon with the temporary marker.
	markerBalloon.setContent("1");
	markerBalloon.open(map, testMarker);
	
	// don't show our test marker.
	testMarker.setVisible(false);
	// call .open() function, but with position = null, so we call open() and purposely show nothing.
	// after this, the balloon won't be shown at top left for a brief moment anymore.
	markerBalloon.open(null);
	// end of the top-left thing.
	
	map.addListener('rightclick', function(event) {
		addMarker(map, event.latLng);
	});
}

function addMarker(map, loc) {
	if (markerBalloon === undefined) {
		console.log("Initializing marker balloon!");
		markerBalloon = new google.maps.InfoWindow();
	}
	marker = new google.maps.Marker({
		position : loc,
		map : map,
		icon : "../../images/icon_nopower.png"		
	});
	markerSet.push(marker);

	// the object handle holding the data
	var pointDataObject = getPointData(marker);		

	// this is the bubble displayed when pin is dropped
	// the function _balloonText() is called to get the string displayed in the balloon.
	var balloonUniqID = "balloon" + markerHTMLIdSubscript;
	markerHTMLIdSubscript += 1;
	markerBalloon.setContent(_balloonText(balloonUniqID, pointDataObject));	
	markerBalloon.bindTo('position', marker, 'position');
	markerBalloon.open(map, marker);
	populatePointData(pointDataObject, balloonUniqID);

	// this is the bubble displayed when pin is left-clicked.
	// left click to toggle the bubble.
	// if you left click another pin, the bubble on that pin will show up.
	marker.addListener('click', function() {
		// if the current balloon is closed
		if (markerBalloon.getContent()=="") {
			markerBalloon.setContent(_balloonText(balloonUniqID, pointDataObject));
			markerBalloon.bindTo('position', this, 'position');
			markerBalloon.open(map, this);	
		} else {
			// clicking a different pin, show a bubble for that pin.
			if (markerBalloon.getPosition().lat() != this.getPosition().lat()
					|| markerBalloon.getPosition().lng() != this.getPosition().lng()) {
				markerBalloon.setContent(_balloonText(balloonUniqID, pointDataObject));
				markerBalloon.bindTo('position', this, 'position');
				markerBalloon.open(map, this);	
			} else {
				// we are clicking the same pin. close the bubble.
				markerBalloon.setContent("");
				markerBalloon.setPosition(null);
				markerBalloon.open(null, null);
			}
		}										
	});

	// right click on a marker to remove the pin.
	// if that pin has a bubble showing right now, close that bubble as well.
	marker.addListener('rightclick', function() {
		// didn't actually delete or close the marker, just set it to invisible.
		this.setVisible(false);
		markerSet.pop(this);

		// test if we are right clicking the pin with opening bubble.
		// if we are, close the bubble. If we are not, don't do anything.
		if (markerBalloon.getPosition().lat() == this.getPosition().lat()
				&& markerBalloon.getPosition().lng() == this.getPosition().lng()) {
			markerBalloon.setContent("");
			markerBalloon.close();
		}
	});
}

function showHelpMarker() {
	markerBalloon.setContent("<div class=\"scrollFix\">" + 
			"<h3>Did you know that ...</h3>" +
			"<p><em>Right clicking on any area of the map <br/>" +
			"will place a marker and open a similar <br/>" +
			"window with information about the power <br/>" +
			"generation potential in that area?</em></p>" +
			"<p><em>For more info on all the cool things <br/>" +
			"you can do, click the blue question mark <br/>" +
			"to the left!</em></p></div>");
}

// the function to return the string to be displayed in the balloon.
// this function exists to factor out some code in the previous section.
// numeric values are rounded to 2 digits. change this if needed.
function _balloonText(div_id, pointDataObject) {
	var balloonString = ""; 
	if (pointDataObject.wind_raw == null ||
			pointDataObject.solar_raw == null ||
			pointDataObject.hydro_raw == null) {
		balloonString = "<div class=\"scrollFix\" id=\"" + div_id + "\">" + 
		"<h2>Detailed Energy Data (kWh/yr)</h2>" +
		"<h3>Latitude: " + pointDataObject.lat.toFixed(3).toString() + "<br/>" + 
		"Longitude: " + pointDataObject.lng.toFixed(3).toString() + "</h3>" +
		"Wind Energy: <span class=\"windstring\"><em>Loading</em></span> kWh/yr<br/>" +
		"Solar Energy: <span class=\"solarstring\"><em>Loading</em></span> kWh/yr<br/>" +
		"Hydro Energy: <span class=\"hydrostring\"><em>Loading</em></span> kWh/yr" +
		"<h4>Total Energy: <span class=\"totalstring\"><em>Loading</em></span> kWh/yr</h4>" +
		"<p><i>Right click on the pin to remove pin.</i></p>" +
		"<p><i>Left click on the pin to toggle this window.</i></p></div>";
	} else {
		var totalEnergy = pointDataObject.wind_raw + pointDataObject.solar_raw + 
			pointDataObject.hydro_raw;
		balloonString = "<div class=\"scrollFix\" id=\"" + div_id + "\">" + 
		"<h2>Detailed Energy Data (kWh)</h2>" +
		"<h3>Latitude: " + pointDataObject.lat.toFixed(3).toString() + "<br/>" + 
		"Longitude: " + pointDataObject.lng.toFixed(3).toString() + "</h3>" +
		"Wind Energy: <span class=\"windstring\">" + 
		pointDataObject.wind_raw.toFixed(2).toString() + "</span> kWh/yr<br/>" + 
		"Solar Energy: <span class=\"solarstring\">" + 
		pointDataObject.solar_raw.toFixed(2).toString() + "</span> kWh/yr<br/>" +
		"Hydro Energy: <span class=\"hydrostring\">" + 
		pointDataObject.hydro_raw.toFixed(2).toString() + "</span> kWh/yr<br/>" +
		"<h4>Total Energy: <span class=\"totalstring\">" + 
		totalEnergy.toFixed(2).toString() + "</span> kWh/yr</h4>" +
		"<p><i>Right click on the pin to remove pin.</i></p>" +
		"<p><i>Left click on the pin to toggle this window.</i></p></div>";
	}
	
	return balloonString;
}

// change the marker's icon according to energy level.
// this function is called by _tryPopulateTotalEnergy in data_common_functions.js.
function changeMarkerIcon(marker, energyLevel) {
	if (energyLevel < 0.5) {
		marker.setIcon("../../images/icon_nopower.png");
	} else if (energyLevel >= 0.5 && energyLevel < 0.8) {
		marker.setIcon("../../images/icon_low.png");
	} else if (energyLevel >= 0.8 && energyLevel < 1.45) {
		marker.setIcon("../../images/icon_medium.png");
	} else if (energyLevel >= 1.45) {
		marker.setIcon("../../images/icon_high.png");
	}
}
