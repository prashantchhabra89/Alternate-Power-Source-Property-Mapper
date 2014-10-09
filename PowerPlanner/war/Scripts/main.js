$(document).ready(
		function() {
			$(".expandSettingButton").on('click', function() {
				$(".resourceBox").toggleClass('hide-resourcesBox');
				$(".mapSettings").toggleClass('hide-resourcesBox');
				$(".mapSelect").toggleClass('hide-resourcesBox');
				$(".propertyButton").toggleClass('hide-resourcesBox');
				$(".gMap").toggleClass('expandMap');
				$(".settingsWidgets").toggleClass('hide-description');
				$(".expandSettingButton").toggleClass('ui-icon-arrow-r');
			});
			resizeDiv();

});

window.onresize = function(event) {
	resizeDiv();
}

function resizeDiv() {
	//HACK: ui-header height not available during startup. $(".ui-header").outerHeight();
	vph = $(window).height() - 80; // 80px is ui-header and margins
	$(".gMap").css({'height': vph + 'px'});
	$(".expandSettingButton").css({'height': vph + 'px'});
}