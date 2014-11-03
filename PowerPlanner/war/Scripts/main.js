$(document).ready(function() {
	resizeDiv();
	$("a.start-button").click(startButtonClick);

	$("#showCheckboxWind").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";

		//TEMP (to disallow multi-selection)
		$("#showCheckboxSolar").prop("checked", false);
		$("#showCheckboxHydro").prop("checked", false);
		$("#solar-panel").css("border-color", "");
		$("#hydro-panel").css("border-color", "");
		
		$('#wind-panel').css("border-color", bg_col);
		toggleHeatmapData(
				$(this).is(':checked'),
				$("#showCheckboxSolar").is(':checked'),
				$("#showCheckboxHydro").is(':checked')
		);
	});

	$("#showCheckboxSolar").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		
		//TEMP (to disallow multi-selection)
		$("#showCheckboxWind").prop("checked", false);
		$("#showCheckboxHydro").prop("checked", false);
		$("#wind-panel").css("border-color", "");
		$("#hydro-panel").css("border-color", "");
		
		$('#solar-panel').css("border-color", bg_col);
		toggleHeatmapData(
				$("#showCheckboxWind").is(':checked'),
				$(this).is(':checked'),
				$("#showCheckboxHydro").is(':checked')
		);
	});

	$("#showCheckboxHydro").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		
		//TEMP (to disallow multi-selection)
		$("#showCheckboxWind").prop("checked", false);
		$("#showCheckboxSolar").prop("checked", false);
		$("#wind-panel").css("border-color", "");
		$("#solar-panel").css("border-color", "");
		
		$('#hydro-panel').css("border-color", bg_col);
		toggleHeatmapData(
				$("#showCheckboxWind").is(':checked'),
				$("#showCheckboxSolar").is(':checked'),
				$(this).is(':checked')
		);
	});

	$('.wind').on('click', function() {
		$('#windResource').toggleClass('show-description');
		$('#solarResource').removeClass('show-description');
		$('#hydroResource').removeClass('show-description');
		$('#showCheckboxWind').checkboxradio("refresh");

		setTimeout(function() {
			$('#windResouceRadio').toggleClass('displayRadioButtons');
			$('#windResourceCheck').toggleClass('displayRadioButtons');
		}, 400);
		
		hideSolarResources();
		hideHydroResources();
	});
	$('.solar').on('click', function() {
		$('#windResource').removeClass('show-description');
		$('#solarResource').toggleClass('show-description');
		$('#hydroResource').removeClass('show-description');
		$('#showCheckboxSolar').checkboxradio("refresh");
		
		setTimeout(function() {
			$('#solarResouceRadio').toggleClass('displayRadioButtons');
			$('#solarResourceCheck').toggleClass('displayRadioButtons');
		}, 400);		
		
		hideWindResources();
		hideHydroResources();
	});
	$('.hydro').on('click', function() {
		$('#windResource').removeClass('show-description');
		$('#solarResource').removeClass('show-description');
		$('#hydroResource').toggleClass('show-description');
		$('#showCheckboxHydro').checkboxradio("refresh");
		
		setTimeout(function() {
			$('#hydroResourceRadio').toggleClass('displayRadioButtons');
			$('#hydroResourceCheck').toggleClass('displayRadioButtons');
		}, 400);
		
		hideWindResources();
		hideSolarResources();
	});
});

window.onresize = function(event) {
	resizeDiv();
}

function hideWindResources() {
	$('#windResouceRadio').removeClass('displayRadioButtons');
}
function hideSolarResources() {
	$('#solarResouceRadio').removeClass('displayRadioButtons');
}
function hideHydroResources() {
	$('#hydroResourceRadio').removeClass('displayRadioButtons');
}
function resizeDiv() {
	// HACK: ui-header height not available during startup.
	vph = $(window).height() - 80 - 10; // 80px is ui-header and margins 40 is footer
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

