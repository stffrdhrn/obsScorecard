'use strict';

//  Golf ScoreBoard addon for OBS version 1.6.0
//  this is a purely javascript/html/css driven scoreboard system for OBS Studio
//  free to use and modify and use as long as this copyright statment remains intact.

// This is the code for managing the GIR updates from the control panel
// and rendering them to the HTML DOM.

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

function renderGirCounter() {
	const girCount = document.getElementById("girCount");

	let count = 0;
	const putts = scoreCard.players[0].putts;
	const scores = scoreCard.players[0].scores;

	for (let i = 0; i < staticScoreCard.holes; i++) {
		// If we have a score recorded
		if (scores[i] > 0) {
			let gir = staticScoreCard.par[i] - 2;
			let shotsToGreen = scores[i] - putts[i];
			if (shotsToGreen <= gir) {
				count++;
			}
		}
	}

	girCount.innerHTML = count;
}

function setStaticScoreCard(scoreCardHoles, scoreCardPar) {
    staticScoreCard.holes = scoreCardHoles;
    staticScoreCard.par = scoreCardPar;
    renderGirCounter();
}

function setScores(scores) {
    scoreCard.players = scores;

    renderGirCounter();
}

function styleChange(n) {
	console.log("Setting style to: " + n);

	if (n == "mcgolf") {
		document.querySelectorAll(".scHeader").forEach((el) => {
			el.classList.add("noShow");
		});
	} else {
		document.querySelectorAll(".scHeader").forEach((el) => {
			el.classList.remove("noShow");
		});
	}
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
var staticScoreCard = {
   players: [
     { name: "Player 1", color: "" }
   ],
   holes: 18,
   par: [],
};

var scoreCard = {
   players: [
     { scores: [], putts: [] },
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

	// Static scorecard update has players and scorecard data, we just
	// need the numbers.
	if (event.data.players != null) {
		setStaticScoreCard(event.data.scoreCardHoles, event.data.scoreCardPar);
	}

	if (event.data.scores != null) {
		setScores(event.data.scores);
	}

	if (event.data.style != null) {
		styleChange(event.data.style);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//							autostart stuff
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(() => {
	/* Load static scorecard data */
	const storedScoreCardPar = localStorage.getItem("scoreCardPar");
	if (storedScoreCardPar != null) {
		staticScoreCard.par = storedScoreCardPar.split(",");
	}
	/* Load scores */
	const p1ScoreCard = localStorage.getItem("p1ScoreCard");
	if (p1ScoreCard != null) {
		scoreCard.players[0].scores = p1ScoreCard.split(",");
	}
	const p1Putts = localStorage.getItem("p1Putts");
	if (p1Putts != null) {
		scoreCard.players[0].putts = p1Putts.split(",");
	}

	if (localStorage.getItem("b_style") != null) {
		styleChange(localStorage.getItem("b_style"));
	} else {
		styleChange("normal");
	}
	if (localStorage.getItem("opacity") > 0) {
		opacity = localStorage.getItem("opacity") / 100;
		setOpacity(opacity);
	}
	renderGirCounter();
})();

