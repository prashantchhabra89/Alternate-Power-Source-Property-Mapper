var windTogglePannelOn = false;
var solarTogglePannelOn = false;
var hydroTogglePannelOn = false;

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

	//HACK: Added a delay for when the panel is fully displayed or hidden, then the radio buttons/checkbox will show
	// to avoid creating a scroll bar. 
	$('.wind').on('click', function() {		
		if (windTogglePannelOn == false){
			solarTogglePannelOn = false;
			hydroTogglePannelOn = false;
			hideSolarResources();
			hideHydroResources();
			$('#windResource').toggleClass('show-description');
			$('#solarResource').removeClass('show-description');
			$('#hydroResource').removeClass('show-description');
			$('#showCheckboxWind').checkboxradio("refresh");

			setTimeout(function() {
				$('#windResouceRadio').toggleClass('displayRadioButtons');				
			}, 500);
			windTogglePannelOn = true;
		}
		else {
			$('#windResouceRadio').toggleClass('displayRadioButtons');

			hideSolarResources();
			hideHydroResources();
			windTogglePannelOn = false;
			setTimeout(function() {
				$('#windResource').toggleClass('show-description');
				$('#solarResource').removeClass('show-description');
				$('#hydroResource').removeClass('show-description');
				$('#showCheckboxWind').checkboxradio("refresh");
			}, 100);
		}

	});
	$('.solar').on('click', function() {
		if (solarTogglePannelOn == false){
			windTogglePannelOn = false;
			hydroTogglePannelOn = false;
			hideWindResources();
			hideHydroResources();
			$('#windResource').removeClass('show-description');
			$('#solarResource').toggleClass('show-description');
			$('#hydroResource').removeClass('show-description');
			$('#showCheckboxSolar').checkboxradio("refresh");

			setTimeout(function() {
				$('#solarResouceRadio').toggleClass('displayRadioButtons');				
			}, 500);
			solarTogglePannelOn = true;
		}
		else {
			$('#solarResouceRadio').toggleClass('displayRadioButtons');

			hideWindResources();
			hideHydroResources();
			solarTogglePannelOn = false;
			setTimeout(function() {
				$('#windResource').removeClass('show-description');
				$('#solarResource').toggleClass('show-description');
				$('#hydroResource').removeClass('show-description');
				$('#showCheckboxSolar').checkboxradio("refresh");
			}, 100);
		}
	});
	$('.hydro').on('click', function() {
		if (hydroTogglePannelOn == false){
			windTogglePannelOn = false;
			solarTogglePannelOn = false;
			hideWindResources();
			hideSolarResources();
			$('#windResource').removeClass('show-description');
			$('#solarResource').removeClass('show-description');
			$('#hydroResource').toggleClass('show-description');
			$('#showCheckboxHydro').checkboxradio("refresh");

			setTimeout(function() {
				$('#hydroResourceRadio').toggleClass('displayRadioButtons');				
			}, 500);
			hydroTogglePannelOn = true;
		}
		else {
			$('#hydroResourceRadio').toggleClass('displayRadioButtons');

			hideWindResources();
			hideSolarResources();
			hydroTogglePannelOn = false;
			setTimeout(function() {
				$('#windResource').removeClass('show-description');
				$('#solarResource').removeClass('show-description');
				$('#hydroResource').toggleClass('show-description');
				$('#showCheckboxHydro').checkboxradio("refresh");
			}, 100);
		}
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

