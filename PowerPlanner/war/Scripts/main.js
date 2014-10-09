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

			$(".expandOptions").height(
					$(document).height() - $(".ui-header").outerHeight(true)
							- $(".ui-footer").outerHeight(true)
							- $(".ui-content").outerHeight(true));
			$("#googleMap").height(
					$(window).height() - $(".ui-header").outerHeight(true)
							- $(".ui-footer").outerHeight(true)
							- $(".ui-content").outerHeight(true));

		});