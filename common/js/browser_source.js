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
function clearExtBlink(playerN) {
	document.getElementById("p" + playerN + "ExtIcon").classList.remove("extBlink");
	document.getElementById("p" + playerN + "ExtIcon").style.background = "darkred";

}

function extReset(player) {
	document.getElementById(player + "ExtIcon").style.background = "green";

}

function setPlayerScore(player,score) {
	document.getElementById(player).innerHTML = score == 0 ? 'E' : score;
	document.getElementById(player).classList.add("winBlink");

	document.getElementById(player).classList.remove("evenPar");
	document.getElementById(player).classList.remove("overPar");
	document.getElementById(player).classList.remove("underPar");
        if (score == 0) {
	   document.getElementById(player).classList.add("evenPar");
        } else if (score > 0) {
	   document.getElementById(player).classList.add("overPar");
        } else {
	   document.getElementById(player).classList.add("underPar");
        }
	setTimeout("clearWinBlink()", 500);
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

function setPlayerName(player, playerName, playerEnabled) {
    if (playerEnabled) {
	staticScoreCard.players[Number(player) - 1] = { name: playerName };
    } else {
	staticScoreCard.players.splice(Number(player) - 1, 1);
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

	let headerRow = "<tr class=\"scHeader\">";
	let parRow = "<tr class=\"scSubHeader\">";
	let scoreRow = "";
	let parTotal = 0;
	const playerCount = staticScoreCard.players.length;
	const playerScores = [];

	for (let i = 0; i < playerCount; i++) {
		playerScores[i] = {};
		playerScores[i].row = "<tr class=\"scData\">";
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
     { name: "Player 1" }
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

	if (event.data.color != null) {
		console.log("event.data.player: " + event.data.player + " event.data.color: " + event.data.color);
                document.getElementById("player" + event.data.player + "Name").style.background = "linear-gradient(to left, white , " + event.data.color; + ")";
	}

	if (event.data.players != null) {
		event.data.players.forEach((player) => {
			console.log("player: " + player.player + " name: " + player.name);
			if (!event.data.name == "") {
				setPlayerName(player.player, player.name, player.enabled);
			} else {
				setPlayerName(player.player, "Player " + player.player, player.enabled);
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

if (localStorage.getItem("p1NameCtrlPanel") != null) {
	staticScoreCard.players[0].name = localStorage.getItem("p1NameCtrlPanel");
}

if (localStorage.getItem("p2NameCtrlPanel") != null && localStorage.getItem("p2Enabled") === "y") {
	staticScoreCard.players[1].name = localStorage.getItem("p2NameCtrlPanel");
}
let storedScoreCardPar = localStorage.getItem("scoreCardPar");
if (storedScoreCardPar != null) {
	staticScoreCard.par = storedScoreCardPar.split(",");
}
let p1ScoreCard = localStorage.getItem("p1ScoreCard");
if (p1ScoreCard != null) {
	scoreCard.players[0].scores = p1ScoreCard.split(",");
}
let p2ScoreCard = localStorage.getItem("p2ScoreCard");
if (p2ScoreCard != null) {
	scoreCard.players[1].scores = p2ScoreCard.split(",");
}

/*
if (localStorage.getItem('p1colorSet') != "") {
	document.getElementById("player1Name").style.background = "linear-gradient(to left, white , " + localStorage.getItem('p1colorSet');
	console.log("p1color: " + localStorage.getItem('p1colorSet'));
}
if (localStorage.getItem('p2colorSet') != "") {
	document.getElementById("player2Name").style.background = "linear-gradient(to left, white , " + localStorage.getItem('p2colorSet');
	console.log("p2color: " + localStorage.getItem('p2colorSet'));
}
*/
if (localStorage.getItem("b_style") != null) {
	styleChange(localStorage.getItem("b_style"));
} else {
	styleChange(1);
}
if (localStorage.getItem("opacity") > 0) {
	staticScoreCard.opacity = localStorage.getItem("opacity") / 100;
	setOpacity(staticScoreCard.opacity);
}
renderScoreCard();
