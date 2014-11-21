/**
 * Introduction overlay to show our features
 */
	
function startIntro() {
	var w = "Wind".bold().fontcolor("green");
	var s = "Solar".bold().fontcolor("orange");
	var h = "Hydro".bold().fontcolor("blue");
	var mark = "<div id=\"start-helper\" class=\"scrollFix\">" + 
	"<p>Right clicking on any area of the<br/>" +
	"map will place a marker and open<br/>" +
	"a window with information about<br/>" +
	"the power generation potential<br/>" + 
	"in that area?</p></div>";
	var tour = new Tour({
		steps: [
			{
				title: "Introduction",
				content: "Take a tour of our application to learn its features!",
				orphan: true
			},		
			{
		    	element: "#wind-panel",
		    	title: "Wind",
		    	content: "Click here to see more options for " + w + ". Click again to hide the menu."
		    },
		    {
		    	element: "#solar-panel",
		    	title: "Solar",
		    	content: "Click here to see more options for " + s + ". Click again to hide the menu."
		    },
		    {
		    	element: "#hydro-panel",
		    	title: "Hydro",
		    	content: "Click here to see more options for " + h + ". Click again to hide the menu."
		    },
		    {
		    	element: "#question-panel",
		    	title: "Help",
		    	content: "Click here for more help. Click again to hide the menu."
		    },
		    {
		    	title: "Markers",
		    	content: mark,
		    	orphan: true
		    }
		],
		orphan: true,
		backdrop: true,
		onShown: function(tour) {
	        var stepElement = getTourElement(tour);
	        $(stepElement).before($('.tour-step-background'));
	        $(stepElement).after($('.tour-backdrop'));
	    }
	});

	tour.init();
	tour.restart();
}

function getTourElement(tour){
    return tour._options.steps[tour._current].element
}
