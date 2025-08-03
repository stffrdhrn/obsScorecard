'use strict';

//  Golf ScoreBoard addon for OBS version 1.6.0
//  this is a purely javascript/html/css driven scoreboard system for OBS Studio
//  free to use and modify and use as long as this copyright statment remains intact.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////            
//						functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////            

function clearWinBlink() {
	document.getElementById("player1Score").classList.remove("winBlink");
	document.getElementById("player2Score").classList.remove("winBlink");
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function renderPuttCounter() {
	const threePutts = document.getElementById("threePutts");

	let count = 0;
	const putts = scoreCard.players[0].putts;

	for (let i = 0; i < putts.length; i++) {
		if (putts[i] > 2) {
			count++;
		}
	}

	threePutts.innerHTML = count;
}

function setScores(scores) {
    scoreCard.players = scores;

    renderPuttCounter();
}

function styleChange(n) {
	// Enable/disabled the scaling css
	console.log("Setting scaling to: " + n);
	document.styleSheets[1].disabled = n != 1;
	document.styleSheets[2].disabled = n != 2;
	document.styleSheets[3].disabled = n != 3;
	document.styleSheets[4].disabled = n != 4;
}
function setOpacity(n) {
	document.querySelectorAll(".scData > td").forEach((el) => {
		el.style.background = 'rgb(120 120 120 / ' + (100*Number(n)) + '%)';
	});
	document.querySelectorAll(".scData > td.scName").forEach((el, i) => {
		el.style.background = 'linear-gradient(to left, rgb(120 120 120 / ' + (100*Number(n)) + '%), ' +
					staticScoreCard.players[i].color + ")";
	});
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//										variable declarations
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			

const bc = new BroadcastChannel('sc-main');

var opacity = 0.99;
var scoreCard = {
   players: [
     { putts: [] },
     { putts: [] }
   ],
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//										broadcast channel events
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			

bc.onmessage = (event) => {

	if (event.data.opacity != null) {
		console.log("event.data(opacity): " + event.data.opacity);
		opacity = event.data.opacity;
		setOpacity(opacity);
	}

	if (event.data.scores != null) {
		setScores(event.data.scores);
	}

	if (event.data.style != null) {
		console.log("event.data.command: " + event.data.command);
		if (event.data.style == "style100") { styleChange(1); };
		if (event.data.style == "style125") { styleChange(2); };
		if (event.data.style == "style150") { styleChange(3); };
		if (event.data.style == "style200") { styleChange(4); };
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//							autostart stuff
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(() => {
	const p1Putts = localStorage.getItem("p1Putts");
	if (p1Putts != null) {
		scoreCard.players[0].putts = p1Putts.split(",");
	}

	if (localStorage.getItem("b_style") != null) {
		styleChange(localStorage.getItem("b_style"));
	} else {
		styleChange(1);
	}
	if (localStorage.getItem("opacity") > 0) {
		opacity = localStorage.getItem("opacity") / 100;
		setOpacity(opacity);
	}
	renderPuttCounter();
})();

