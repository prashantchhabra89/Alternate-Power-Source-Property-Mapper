/**
 * Introduction overlay to show our features
 */
function startIntro() {
	var intro = introJs();
	var w = "Wind".bold().fontcolor("green");
	var s = "Solar".bold().fontcolor("orange");
	var h = "Hydro".bold().fontcolor("blue");
	intro.setOptions({
		steps: [
		    {
		    	intro: "Take a tour of our application to learn its features!"
		    },
		    {
		    	element: document.querySelectorAll('#start-helper')[0],
		    	intro: "Check this out!",
		    	position: 'bottom'
		    },
		    {
		    	element: document.querySelectorAll('#wind-panel')[0],
		    	intro: "Click here to see more options for " + w + ". Click again to hide the menu.",
		    	position: 'right'
		    },
		    {
		    	element: document.querySelectorAll('#solar-panel')[0],
		    	intro: "Click here to see more options for " + s + ". Click again to hide the menu.",
		    	position: 'right'
		    },
		    {
		    	element: document.querySelectorAll('#hydro-panel')[0],
		    	intro: "Click here to see more options for " + h + ". Click again to hide the menu.",
		    	position: 'right'
		    },
		    {
		    	element: document.querySelectorAll('#question-panel')[0],
		    	intro: "Click here for more help. Click again to hide the menu.",
		    	position: 'right'
		    }
		]
	});	
	intro.start();
}