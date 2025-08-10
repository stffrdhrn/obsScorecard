'use strict';

//  G4ScoreBoard addon for OBS version 1.6.0 Copyright 2022-2023 Norman Gholson IV
//  https://g4billiards.com http://www.g4creations.com
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

function renderScoreCard() {
	if (staticScoreCard.style == "vertical") {
		document.getElementById("scoreCardFull").innerHTML = formatScoreCardVertical();
	} else {
		document.getElementById("scoreCardFull").innerHTML = formatScoreCard();
	}
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
	console.log("Setting style to: " + n);
	staticScoreCard.style = n;
	renderScoreCard();
}

function formatScore(playerScore, par, showPar) {
	if (!playerScore || playerScore <= 0) {
		if (showPar) {
			return "<td>" + par + "</td>";
		} else {
			return "<td>&nbsp;</td>";
		}
	} else if (playerScore > par) {
		return "<td class=\"bogey\">" + playerScore + "</td>";
	} else if ((par - playerScore) == 1) {
		return "<td class=\"birdie\">" + playerScore + "</td>";
	} else if (playerScore < par) {
		return "<td class=\"eagle\">" + playerScore + "</td>";
	} else {
		return "<td class=\"par\">" + playerScore + "</td>";
	}
}

function formatScoreCardVertical() {

	let frontComplete = 0;
	let backComplete = 0;
	let frontPar = 0;
	let backPar = 0;

	const playerScore = {};
	playerScore.front = [];
	playerScore.back = [];
	playerScore.frontTotal = 0;
	playerScore.backTotal = 0;

	for (let i = 0; i < staticScoreCard.holes; i++) {
		let par = Number(staticScoreCard.par[i]);

		let scoreCardPlayer = scoreCard.players[0];
		let holeScore = Number(scoreCardPlayer.scores[i]);
		if (i < 9) {
			frontPar += par;
			if (holeScore > 0) {
				frontComplete++;
				playerScore.front[i] = holeScore;
				playerScore.frontTotal += holeScore;
			}
		} else {
			backPar += par;
			if (holeScore > 0) {
				backComplete++;
				playerScore.back[i%9] = holeScore;
				playerScore.backTotal += holeScore;
			}
		}
	}

	let html = "<table>"
		+ "<tr class=\"vscHeader\"><td>front 9</td><td>back 9</td></tr>\n";

	for (let i = 0; i < 9; i++) {
		let frontScore = playerScore.front[i];
		let backScore = playerScore.back[i];
		html += "<tr class=\"vscData\">";
		html += formatScore(frontScore, Number(staticScoreCard.par[i]), true);
		html += formatScore(backScore, Number(staticScoreCard.par[i+9]), true);
		html += "</td>\n";
	}

	html += "<tr class=\"vscTotal\">";
	if (frontComplete >= 9) {
		html += "<td class=\"done\">" + playerScore.frontTotal + "</td>";
	} else {
		html += "<td>" + frontPar + "</td>";
	}
	if (backComplete >= 9) {
		html += "<td class=\"done\">" + playerScore.backTotal + "</td>";
	} else {
		html += "<td>" + backPar + "</td>";
	}
	html += "</tr>";

	return html + "</table>";
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
			playerScores[k].row += formatScore(playerScore, par, false);
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
	document.querySelectorAll(".scData > td, .vscData > td").forEach((el) => {
		el.style.background = 'rgb(120 120 120 / ' + (100*Number(n)) + '%)';
	});
	document.querySelectorAll(".scData > td.scName").forEach((el, i) => {
		el.style.background = 'linear-gradient(to left, rgb(120 120 120 / ' + (100*Number(n)) + '%), ' +
					staticScoreCard.players[i].color + ")";
	});
	document.querySelectorAll(".scSubHeader > td, .vscTotal > td, .vscHeader > td").forEach((el) => {
		el.style.background = 'rgb(80 80 80 / ' + (100*Number(n)) + '%)';
	});

	const verticalStyles = new Map([
		["par",    "white"],
		["birdie", "lime"],
		["bogey",  "black"],
		["eagle",  "yellow"],
	]);
	verticalStyles.forEach((val, key) => {
		document.querySelectorAll(".vscData > td." + key).forEach((el) => {
			el.style.background = "url('http://shorne.noip.me/downloads/images/" + val + "-disc.png'), "
				+  'rgb(120 120 120 / ' + (100*Number(n)) + '%)';
			el.style.backgroundSize = "contain";
			el.style.backgroundPosition = "center";
			el.style.backgroundRepeat = "no-repeat";
		});
	});
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//										variable declarations
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			

const bc = new BroadcastChannel('sc-main');

var staticScoreCard = {
   players: [
     { name: "Player 1", color: "" }
   ],
   holes: 18,
   par: [],
   opacity: 0.99,
   style: "horizontal"
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
		staticScoreCard.opacity = event.data.opacity;
		setOpacity(staticScoreCard.opacity);
	}

	if (event.data.players != null) {
		event.data.players.forEach((player, i) => {
			console.log("player: " + (i+1) + " name: " + player.name);
			if (!player.name == "") {
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
		console.log("event.data.style: " + event.data.style);
		styleChange(event.data.style);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//							autostart stuff
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(() => {
	/* Load Satic Score Card Data */
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

	/* Load scores */
	const p1ScoreCard = localStorage.getItem("p1ScoreCard");
	if (p1ScoreCard != null) {
		scoreCard.players[0].scores = p1ScoreCard.split(",");
	}
	const p2ScoreCard = localStorage.getItem("p2ScoreCard");
	if (p2ScoreCard != null) {
		scoreCard.players[1].scores = p2ScoreCard.split(",");
	}

	/* Load Style Data */
	const bsStyle = localStorage.getItem("b_style");
	if (localStorage.getItem("b_style") !== null) {
		staticScoreCard.style = bsStyle;
	}
	if (localStorage.getItem("opacity") > 0) {
		staticScoreCard.opacity = localStorage.getItem("opacity") / 100;
	}
	renderScoreCard();
})();
