'use strict';

//  G4ScoreBoard addon for OBS version 1.6.0 Copyright 2022-2023 Norman Gholson IV
//  https://g4billiards.com http://www.g4creations.com
//  this is a purely javascript/html/css driven scoreboard system for OBS Studio
//  free to use and modify and use as long as this copyright statment remains intact.
//  Salotto logo is the copyright of Salotto and is used with their permission.
//  for more information about Salotto please visit https://salotto.app


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

function renderScoreCard() {
    document.getElementById("scoreCardFull").innerHTML = formatScoreCard();
    setOpacity(staticScoreCard.opacity);
}

function setStaticScoreCard(scoreCardHoles, scoreCardPar) {
    staticScoreCard.holes = scoreCardHoles;
    staticScoreCard.par = scoreCardPar;
    renderScoreCard();
}

function setScores(scores) {
    scoreCard.players = scores;

    renderScoreCard();
}

function setPlayerName(idx, playerName, playerColor, playerEnabled) {
    if (playerEnabled) {
	staticScoreCard.players[idx] = { name: playerName, color: playerColor };
    } else {
	staticScoreCard.players.splice(idx, 1);
    }
}

function styleChange(n) {
	// Enable/disabled the scaling css
	console.log("Setting scaling to: " + n);
	document.styleSheets[1].disabled = n != 1;
	document.styleSheets[2].disabled = n != 2;
	document.styleSheets[3].disabled = n != 3;
	document.styleSheets[4].disabled = n != 4;
}

function formatScoreCard() {

	let headerRow = "<tr class=\"scHeader\"><td>&nbsp;</td>";
	let parRow = "<tr class=\"scSubHeader\"><td>&nbsp;</td>";
	let scoreRow = "";
	let parTotal = 0;
	const playerCount = staticScoreCard.players.length;
	const playerScores = [];

	for (let i = 0; i < playerCount; i++) {
		playerScores[i] = {};
		playerScores[i].row =
			"<tr class=\"scData\"><td class=\"scName\">"
			+ staticScoreCard.players[i].name
			+ "</td>";
		playerScores[i].total = 0;
	}

	for (let i = 0; i < staticScoreCard.holes; i++) {
		let par = Number(staticScoreCard.par[i]);
		parTotal += par;
		headerRow += "<td>" + (i+1) + "</td>";
		parRow += "<td>" + par + "</td>";

		for (let k = 0; k < playerCount; k++) {
			let scoreCardPlayer = scoreCard.players[k];
			let playerScore = scoreCardPlayer.scores[i];
			if (!playerScore || playerScore <= 0) {
				playerScores[k].row += "<td>&nbsp;</td>";
			} else if (playerScore > par) {
				playerScores[k].row += "<td class=\"bogey\">" + playerScore + "</td>";
			} else if (playerScore < par) {
				playerScores[k].row += "<td class=\"birdie\">" + playerScore + "</td>";
			} else {
				playerScores[k].row += "<td>" + playerScore + "</td>";
			}
			if (playerScore > 0) {
				playerScores[k].total += (playerScore - par);
			}
		}
	}

	let html = "<table>";
	html += headerRow + "<td class=\"scTotal\">TOTAL</td></tr>";
	html += parRow + "<td class=\"scTotal\">PAR " + parTotal + "</td></td>";

	for (let i = 0; i < playerCount; i++) {
		let playerTotal = playerScores[i].total;
		playerTotal = playerTotal == 0 ? 'E' :
				playerTotal > 0 ? '+' + playerTotal :
				playerTotal;
		html += playerScores[i].row +
			"<td class=\"scTotal\">" + (playerTotal) + "</td></tr>";
	}
	return html + "</table>";
}

function setOpacity(n) {
	document.querySelectorAll(".scData > td").forEach((el) => {
		el.style.background = 'rgb(120 120 120 / ' + (100*Number(n)) + '%)';
	});
	document.querySelectorAll(".scData > td.scName").forEach((el, i) => {
		el.style.background = 'linear-gradient(to left, rgb(120 120 120 / ' + (100*Number(n)) + '%), ' +
					staticScoreCard.players[i].color + ")";
	});
	document.querySelectorAll(".scSubHeader > td").forEach((el) => {
		el.style.background = 'rgb(80 80 80 / ' + (100*Number(n)) + '%)';
	});

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//										variable declarations
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			

const bcr = new BroadcastChannel('g4-recv'); // browser_source -> control_panel channel
const bc = new BroadcastChannel('g4-main');

var staticScoreCard = {
   players: [
     { name: "Player 1", color: "" }
   ],
   holes: 18,
   par: [],
   opacity: 0.99
};

var scoreCard = {
   players: [
     { scores: [] },
     { scores: [] }
   ],
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//										broadcast channel events
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			

bc.onmessage = (event) => {

	if (event.data.opacity != null) {
		console.log("event.data(opacity): " + event.data.opacity);
		setOpacity(event.data.opacity);
	}

	if (event.data.players != null) {
		event.data.players.forEach((player, i) => {
			console.log("player: " + (i+1) + " name: " + player.name);
			if (!event.data.name == "") {
				setPlayerName(i, player.name, player.color, player.enabled);
			} else {
				setPlayerName(i, "Player " + (i+1), player.color, player.enabled);
			}
		});
		setStaticScoreCard(event.data.scoreCardHoles, event.data.scoreCardPar);
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

function loadStaticScoreCard() {
    if (localStorage.getItem("p1NameCtrlPanel") != null) {
	    staticScoreCard.players[0].name = localStorage.getItem("p1NameCtrlPanel");
	    staticScoreCard.players[0].color = localStorage.getItem("p1colorSet");
    }

    if (localStorage.getItem("p2NameCtrlPanel") != null && localStorage.getItem("p2Enabled") === "y") {
	    staticScoreCard.players[1] = {};
	    staticScoreCard.players[1].name = localStorage.getItem("p2NameCtrlPanel");
	    staticScoreCard.players[1].color = localStorage.getItem("p2colorSet");
    }
    const storedScoreCardPar = localStorage.getItem("scoreCardPar");
    if (storedScoreCardPar != null) {
	    staticScoreCard.par = storedScoreCardPar.split(",");
    }
    const p1ScoreCard = localStorage.getItem("p1ScoreCard");
    if (p1ScoreCard != null) {
	    scoreCard.players[0].scores = p1ScoreCard.split(",");
    }
    const p2ScoreCard = localStorage.getItem("p2ScoreCard");
    if (p2ScoreCard != null) {
	    scoreCard.players[1].scores = p2ScoreCard.split(",");
    }
}

loadStaticScoreCard();

if (localStorage.getItem("b_style") != null) {
	styleChange(localStorage.getItem("b_style"));
} else {
	styleChange(1);
}
if (localStorage.getItem("opacity") > 0) {
	staticScoreCard.opacity = localStorage.getItem("opacity") / 100;
}
renderScoreCard();



