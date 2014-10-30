$(document).ready(function() {
	resizeDiv();
	$("a.start-button").click(startButtonClick);

	$("#showCheckboxWind").click(function() {
		toggleHeatmapData(
				$(this).is(':checked'),
				$("#showCheckboxSolar").is(':checked'),
				$("#showCheckboxHydro").is(':checked')
		);
	});

	$("#showCheckboxSolar").click(function() {
		toggleHeatmapData(
				$("#showCheckboxWind").is(':checked'),
				$(this).is(':checked'),
				$("#showCheckboxHydro").is(':checked')
		);
	});

	$("#showCheckboxHydro").click(function() {
		toggleHeatmapData(
				$("#showCheckboxWind").is(':checked'),
				$("#showCheckboxSolar").is(':checked'),
				$(this).is(':checked')
		);
	});

});

window.onresize = function(event) {
	resizeDiv();
}

function resizeDiv() {
	// HACK: ui-header height not available during startup.
	// $(".ui-header").outerHeight();
	vph = $(window).height() - 80; // 80px is ui-header and margins
	$(".gMap").css({
		'height' : vph + 'px'
	});
}
function startButtonClick() {
	if($("#pac-input-intro").val() != "")	{
		$("#pac-input").val($("#pac-input-intro").val());
	}
	
	// Resize the map to page once the new page has finished loading.
	$(document).on("pageshow", function(e, d) {
		var center = g_map.getCenter();
		google.maps.event.trigger(g_map, 'resize');
		g_map.setCenter(center);
	});
}

