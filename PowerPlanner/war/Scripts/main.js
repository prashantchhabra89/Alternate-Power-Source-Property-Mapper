var windTogglePannelOn = false;
var solarTogglePannelOn = false;
var hydroTogglePannelOn = false;

$(document).ready(function() {
	toggleHighlightCheck();
	resizeDiv();
	$("a.tour-button").click(tourButtonClick);
	$("a.start-button").click(startButtonClick);
	$("a.home-button").click(resetIntro);
	$("#pac-input-intro").keyup(function (e) {
		if (e.keyCode == 13) {
			$("a.start-button").trigger("click");
		}
	});
	$('#form').submit(function() {
		postToGoogle();
		return false;
	});
	
	// For intro tour. Constantly checking if "question panel" is open. 
	window.setInterval(checkQuestionPanelOpen,100);
	
	// Tour tip for legend so that tooltip is above legend not beside
	window.setInterval(checkLegend,100);
	
	// Checking if a season is selected. If it is, then add 'ui-btn-active' class to Seasonal 
	// which will highlight Seasonal. Then unhighlight Annual.
	$("#wind-seasonal").change(function() {
		viewAnnualSeasonal('#windAnnual', '#windAnnualLabel', 
				'#wind-seasonal-button', '#wind-seasonal');
		if ($("#wind-seasonal").val() != null) {
			$("#solar-seasonal").val($("#wind-seasonal").val());
			$("#hydro-seasonal").val($("#wind-seasonal").val());
		}
		_eventHeatmapDataToggler();
	});
	
	$("#methodologyHeading").click(function() {
		$("#methodologyBody").toggleClass('show-methodology');
		$("#methodology").toggleClass('expandMethodologyBody');
	});
	
	//If Annual is clicked, unhighlight Seasonal and reset Seasonal value.
	$("#windAnnualLabel").click(function() {
		$("#wind-seasonal-button").removeClass('ui-btn-active');
		$("#wind-seasonal").val(null);
		$("#wind-seasonal").selectmenu("refresh");
		$("#solar-seasonal").val(null);
		$("#hydro-seasonal").val(null);
		_eventHeatmapDataToggler();
	});
	$("#solar-seasonal").change(function() {
		viewAnnualSeasonal('#solarAnnual', '#solarAnnualLabel', 
				'#solar-seasonal-button', '#solar-seasonal');
		if ($("#solar-seasonal").val() != null) {
			$("#wind-seasonal").val($("#solar-seasonal").val());
			$("#hydro-seasonal").val($("#solar-seasonal").val());
		}
		_eventHeatmapDataToggler();
	});
	$("#solarAnnualLabel").click(function() {
		$("#solar-seasonal-button").removeClass('ui-btn-active');
		$("#solar-seasonal").val(null);
		$("#solar-seasonal").selectmenu("refresh");
		$("#wind-seasonal").val(null);
		$("#hydro-seasonal").val(null);
		_eventHeatmapDataToggler();
	});
	$("#hydro-seasonal").change(function() {
		viewAnnualSeasonal('#hydroAnnual', '#hydroAnnualLabel', 
				'#hydro-seasonal-button', '#hydro-seasonal');
		if ($("#hydro-seasonal").val() != null) {
			$("#wind-seasonal").val($("#hydro-seasonal").val());
			$("#solar-seasonal").val($("#hydro-seasonal").val());
		}
		_eventHeatmapDataToggler();
	});
	$("#hydroAnnualLabel").click(function() {
		$("#hydro-seasonal-button").removeClass('ui-btn-active');
		$("#hydro-seasonal").val(null);
		$("#hydro-seasonal").selectmenu("refresh");
		$("#wind-seasonal").val(null);
		$("#solar-seasonal").val(null);
		_eventHeatmapDataToggler();
	});
	
	$("#showCheckboxWind").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		var border_width = ($(this).is(':checked')) ? "3px" : "";
		
		$("#showCheckboxOnlySolar").prop("checked", false);
		$("#showCheckboxOnlyHydro").prop("checked", false);

		if (!$(this).is(':checked')) {
			$("#showCheckboxOnlyWind").prop("checked", false);
			$('#showCheckboxOnlyWind').checkboxradio("refresh");
		}
		
		$('#wind-panel-app').css("border-color", bg_col);
		$('#wind-panel-app').css("border-width", border_width);
		_eventHeatmapDataToggler();
	});
	
	$("#showCheckboxOnlyWind").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		var border_width = ($(this).is(':checked')) ? "3px" : "";
		
		if ($(this).is(':checked')) {
			$("#showCheckboxSolar").prop("checked", false);
			$("#showCheckboxOnlySolar").prop("checked", false);
			$("#showCheckboxHydro").prop("checked", false);
			$("#showCheckboxOnlyHydro").prop("checked", false);
			$("#solar-panel-app").css("border-color", "");
			$("#hydro-panel-app").css("border-color", "");
			$('#wind-panel-app').css("border-color", bg_col);
			$('#wind-panel-app').css("border-width", border_width);
			$("#showCheckboxWind").prop("checked", true);
			$('#showCheckboxWind').checkboxradio("refresh");
			_eventHeatmapDataToggler();
		}
	});

	$("#showCheckboxSolar").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		var border_width = ($(this).is(':checked')) ? "3px" : "";
		
		$("#showCheckboxOnlyWind").prop("checked", false);
		$("#showCheckboxOnlyHydro").prop("checked", false);

		if (!$(this).is(':checked')) {
			$("#showCheckboxOnlySolar").prop("checked", false);
			$('#showCheckboxOnlySolar').checkboxradio("refresh");
		}
		
		$('#solar-panel-app').css("border-color", bg_col);
		$('#solar-panel-app').css("border-width", border_width);
		_eventHeatmapDataToggler();
	});
	
	$("#showCheckboxOnlySolar").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		var border_width = ($(this).is(':checked')) ? "3px" : "";
		
		if ($(this).is(':checked')) {
			$("#showCheckboxWind").prop("checked", false);
			$("#showCheckboxOnlyWind").prop("checked", false);
			$("#showCheckboxHydro").prop("checked", false);
			$("#showCheckboxOnlyHydro").prop("checked", false);
			$("#wind-panel-app").css("border-color", "");
			$("#hydro-panel-app").css("border-color", "");
			$('#solar-panel-app').css("border-color", bg_col);
			$('#solar-panel-app').css("border-width", border_width);
			$("#showCheckboxSolar").prop("checked", true);
			$('#showCheckboxSolar').checkboxradio("refresh");
			_eventHeatmapDataToggler();
		}
	});

	$("#showCheckboxHydro").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		var border_width = ($(this).is(':checked')) ? "3px" : "";

		$("#showCheckboxOnlyWind").prop("checked", false);
		$("#showCheckboxOnlySolar").prop("checked", false);

		$('#hydro-panel-app').css("border-color", bg_col);
		$('#hydro-panel-app').css("border-width", border_width);
		
		if (!$(this).is(':checked')) {
			$("#showCheckboxOnlyHydro").prop("checked", false);
			$('#showCheckboxOnlyHydro').checkboxradio("refresh");
		}
		
		_eventHeatmapDataToggler();
	});
	
	$("#showCheckboxOnlyHydro").click(function() {
		var bg_col = ($(this).is(':checked')) ? "#F84684" : "";
		var border_width = ($(this).is(':checked')) ? "3px" : "";
		
		if ($(this).is(':checked')) {
			$("#showCheckboxWind").prop("checked", false);
			$("#showCheckboxOnlyWind").prop("checked", false);
			$("#showCheckboxSolar").prop("checked", false);
			$("#showCheckboxOnlySolar").prop("checked", false);
			$("#wind-panel-app").css("border-color", "");
			$("#solar-panel-app").css("border-color", "");
			$('#hydro-panel-app').css("border-color", bg_col);
			$('#hydro-panel-app').css("border-width", border_width);
			$("#showCheckboxHydro").prop("checked", true);
			$('#showCheckboxHydro').checkboxradio("refresh");
			_eventHeatmapDataToggler();
		}
	});

	//HACK: Added a delay for when the panel is fully displayed or hidden, then the radio buttons/checkbox will show
	// to avoid creating a scroll bar. 
	$('.windToggleButton').on('click', function() {		
		if (windTogglePannelOn == false){
			solarTogglePannelOn = false;
			hydroTogglePannelOn = false;
			hideSolarResources();
			hideHydroResources();
			$('#windResource').toggleClass('show-description');			
			$('#solarResource').removeClass('show-description');
			$('#hydroResource').removeClass('show-description');
			$('#solarHeading').removeClass('show-description');
			$('#hydroHeading').removeClass('show-description');
			$('#showCheckboxWind').checkboxradio("refresh");
			$('#showCheckboxOnlyWind').checkboxradio("refresh");
			viewAnnualSeasonal('#windAnnual', '#windAnnualLabel', 
					'#wind-seasonal-button', '#wind-seasonal');

			setTimeout(function() {
				$('#windHeading').toggleClass('show-description');
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
				$('#windHeading').toggleClass('show-description');
				$('#solarHeading').removeClass('show-description');
				$('#hydroHeading').removeClass('show-description');
				$('#solarResource').removeClass('show-description');
				$('#hydroResource').removeClass('show-description');
			}, 100);
		}
	});
	$('.solarToggleButton').on('click', function() {
		if (solarTogglePannelOn == false){
			windTogglePannelOn = false;
			hydroTogglePannelOn = false;
			hideWindResources();
			hideHydroResources();
			$('#windResource').removeClass('show-description');
			$('#solarResource').toggleClass('show-description');
			$('#hydroResource').removeClass('show-description');
			$('#windHeading').removeClass('show-description');
			$('#hydroHeading').removeClass('show-description');
			$('#showCheckboxSolar').checkboxradio("refresh");
			$('#showCheckboxOnlySolar').checkboxradio("refresh");
			viewAnnualSeasonal('#solarAnnual', '#solarAnnualLabel', 
					'#solar-seasonal-button', '#solar-seasonal');

			setTimeout(function() {
				$('#solarHeading').toggleClass('show-description');
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
				$('#solarHeading').toggleClass('show-description');
				$('#windHeading').removeClass('show-description');
				$('#hydroHeading').removeClass('show-description');
				$('#hydroResource').removeClass('show-description');
			}, 100);
		}
	});
	$('.hydroToggleButton').on('click', function() {
		if (hydroTogglePannelOn == false){
			windTogglePannelOn = false;
			solarTogglePannelOn = false;
			hideWindResources();
			hideSolarResources();
			$('#windResource').removeClass('show-description');
			$('#solarResource').removeClass('show-description');
			$('#hydroResource').toggleClass('show-description');
			$('#solarHeading').removeClass('show-description');
			$('#windHeading').removeClass('show-description');
			$('#showCheckboxHydro').checkboxradio("refresh");
			$('#showCheckboxOnlyHydro').checkboxradio("refresh");
			viewAnnualSeasonal('#hydroAnnual', '#hydroAnnualLabel', 
					'#hydro-seasonal-button', '#hydro-seasonal');

			setTimeout(function() {
				$('#hydroResourceRadio').toggleClass('displayRadioButtons');
				$('#hydroHeading').toggleClass('show-description');
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
				$('#solarHeading').removeClass('show-description');
				$('#windHeading').removeClass('show-description');
				$('#hydroResource').toggleClass('show-description');
				$('#hydroHeading').toggleClass('show-description');
			}, 100);
		}
	});
	
	$('#shareLinkButton').on('click', function() {
		$('#copyLink').val(buildURL());
		setTimeout(function() {}, 5);
		$('#copyLink').focus(function() {
			this.select();
		});
	});
});
function viewAnnualSeasonal(annualB, annualL, seasonalB, seasonalS) {
	if ($(seasonalS).val() != null && $(seasonalS).val() != 'Seasonal') {
		$(seasonalB).addClass('ui-btn-active');
		$(annualB).prop('checked', false);
		$(annualB).checkboxradio('refresh');
		$(annualL).removeClass('ui-btn-active');
	} else {
		$(annualB).prop('checked', true);
		$(annualL).addClass('ui-btn-active');
		$(seasonalB).removeClass('ui-btn-active');
		$(seasonalS).val(null);
	}
	$(annualB).checkboxradio("refresh");
	$(seasonalS).selectmenu('refresh');
}

/*
 * Checks for changes to URL parameters and tries to interpret URL
 * in response.
 */
$(function(){
	$(window).hashchange(decodeURL);
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
		
		_eventHeatmapDataToggler();
	});
}
// This runs when the page loads or restarts; checks if any power is toggled
function toggleHighlightCheck() {
	var checks = ['#showCheckboxWind', '#showCheckboxSolar', '#showCheckboxHydro'];
	var toggles = ['#wind-panel-app', '#solar-panel-app', '#hydro-panel-app'];
	for (var i = 0; i < toggles.length; i++) {
		var bg_col = ($(checks[i]).is(':checked')) ? "#F84684" : "";
		var border_width = ($(checks[i]).is(':checked')) ? "3px" : "";
		$(toggles[i]).css("border-color", bg_col);
		$(toggles[i]).css("border-width", border_width);
	}
}
function tourButtonClick() {
	startButtonClick();
	startIntro();
}
function checkQuestionPanelOpen (){
	//If "question panel" is  open, move the step 4 tour tip to correct position.
	if($("#questionPanel" ).hasClass( "ui-panel-open" )){
		if($("#step-4").hasClass( "question-panel-open" ) == false){
			$("#step-4").addClass('question-panel-open');
		}
	}
	else {
		$("#step-4").removeClass('question-panel-open');
	}
}
function checkLegend() {
	if ($(".arrow").attr('style') !== undefined) { 
		if($(".arrow").attr('style').indexOf('top') !== -1) {
			$(".arrow").addClass('hide');
		}
	}
}
function resetIntro() {
	endIntro();
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function postToGoogle() {
	var field1 = $('#name').val();
	var field2 = $('#email').val();
	var field3 = $('#feed').val();
	if ((field1 !== "") && (field2 !== "") && ((field3 !== ""))) {
		if (validateEmail(field2))
		{
			$.ajax({
				url: "https://docs.google.com/forms/d/1t5tyq5Czneq2ADaJ33WAAaOrExEFaZaPq-FO3ninkkM/formResponse",
				data: { "entry.1896710919": field1, "entry.993986056": field2, "entry.546054061": field3},
				type: "POST",
				dataType: "xml",
				statusCode: {
					0: function() {
						//Success message
						alert("Thank you for the feedback! Your feedback has been sent.");
						$('#name').val("");
						$('#email').val("");
						$('#feed').val("");
					},
					200: function() {
						//Success Message
						alert("Thank you for the feedback! Your feedback has been sent.");
						$('#name').val("");
						$('#email').val("");
						$('#feed').val("");	
					}
				}
			});
		}
		else {
			alert("Please insert a valid email address!");
		}
	}
}
