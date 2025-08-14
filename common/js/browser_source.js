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
	} else if (staticScoreCard.style == "mcgolf") {
		document.getElementById("scoreCardFull").innerHTML = formatScoreCardMcGolf();
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
			return "<td class=\"blank\">&nbsp;</td>";
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

function formatOverUnder(overUnder) {
	return overUnder == 0 ? 'E' :
		overUnder > 0 ? '+' + overUnder :
		overUnder;
}

function calculateScoreCard() {
	let frontPar = 0;
	let backPar = 0;
	const playerCount = staticScoreCard.players.length;
	const playerScores = [];

	for (let i = 0; i < playerCount; i++) {
		playerScores[i] = {};
		playerScores[i].front = 0;
		playerScores[i].frontComplete = 0;
		playerScores[i].back = 0;
		playerScores[i].backComplete = 0;
		playerScores[i].overUnder = 0;
		playerScores[i].scores = [];
	}

	for (let i = 0; i < staticScoreCard.holes; i++) {
		let par = Number(staticScoreCard.par[i]);

		if (i < 9) {
			frontPar += par;
		} else {
			backPar += par;
		}

		/* Calculate player scores */
		for (let k = 0; k < playerCount; k++) {
			let scoreCardPlayer = scoreCard.players[k];
			let playerScore = Number(scoreCardPlayer.scores[i]);
			if (playerScore > 0) {
				if (i < 9) {
					playerScores[k].frontComplete++;
					playerScores[k].front += playerScore;
				} else {
					playerScores[k].backComplete++;
					playerScores[k].back += playerScore;
				}
				playerScores[k].overUnder += (playerScore - par);
				playerScores[k].scores[i] = playerScore;
			}
		}
	}
	return {
		frontPar: frontPar,
		backPar: backPar,
		playerScores: playerScores
	};
}

function formatScoreCardVertical() {

	const scoreCard = calculateScore_;
	const playerScore = scoreCard.playerScores[0];

	let html = "<table>"
		+ "<tr class=\"vscHeader\"><td>front 9</td><td>back 9</td></tr>\n";

	for (let i = 0; i < 9; i++) {
		let frontScore = playerScore.scores[i];
		let backScore = playerScore.scores[i+9];
		html += "<tr class=\"vscData\">";
		html += formatScore(frontScore, Number(staticScoreCard.par[i]), true);
		html += formatScore(backScore, Number(staticScoreCard.par[i+9]), true);
		html += "</td>\n";
	}

	html += "<tr class=\"vscTotal\">";
	if (playerScore.frontComplete >= 9) {
		html += "<td class=\"done\">" + playerScore.front + "</td>";
	} else {
		html += "<td>" + scoreCard.frontPar + "</td>";
	}
	if (playerScore.backComplete >= 9) {
		html += "<td class=\"done\">" + playerScore.back + "</td>";
	} else {
		html += "<td>" + scoreCard.backPar + "</td>";
	}
	html += "</tr>";

	return html + "</table>";
}

function formatScoreCard() {

	const scoreCard = calculateScoreCard();

	let headerRow = "<tr class=\"scHeader\"><td>&nbsp;</td>";
	let parRow = "<tr class=\"scSubHeader\"><td>&nbsp;</td>";
	const playerCount = staticScoreCard.players.length;
	const playerScores = [];

	for (let i = 0; i < playerCount; i++) {
		playerScores[i] = {};
		playerScores[i].row =
			"<tr class=\"scData\"><td class=\"scName\">"
			+ staticScoreCard.players[i].name
			+ "</td>";
	}

	for (let i = 0; i < staticScoreCard.holes; i++) {
		let par = Number(staticScoreCard.par[i]);
		headerRow += "<td>" + (i+1) + "</td>";
		parRow += "<td>" + par + "</td>";

		for (let k = 0; k < playerCount; k++) {
			let playerScore = scoreCard.playerScores[k].scores[i];
			playerScores[k].row += formatScore(playerScore, par, false);
		}
	}

	let html = "<table>";
	html += headerRow + "<td class=\"scTotal\">TOTAL</td></tr>";
	html += parRow + "<td class=\"scTotal\">PAR " + (scoreCard.frontPar + scoreCard.backPar) + "</td></td>";

	for (let i = 0; i < playerCount; i++) {
		let overUnder = scoreCard.playerScores[i].overUnder;
		html += playerScores[i].row +
			"<td class=\"scTotal\">" + formatOverUnder(overUnder) + "</td></tr>";
	}
	return html + "</table>";
}

function formatScoreCardMcGolf() {

	const scoreCard = calculateScoreCard();

	let headerRow = "<tr class=\"mcScHeader\"><td>HOLE</td>";
	let parRow = "<tr class=\"mcScSubHeader\"><td>PAR</td>";
	const playerCount = staticScoreCard.players.length;
	const playerScores = [];

	for (let i = 0; i < playerCount; i++) {
		playerScores[i] = {};
		playerScores[i].row =
			"<tr class=\"mcScData\"><td class=\"mcScName\">"
			+ staticScoreCard.players[i].name
			+ "</td>";
	}

	function scoreFmt(score, classes) {
		let fmt = "<td class=\"";
		fmt += classes;
		if (score == 0) {
			fmt += " blank";
		}
		fmt += "\">" + (score == 0 ?  "&nbsp;" : String(score)) + "</td>";
		return fmt;
	}

	/* Iterate and add Hole, Par and Player columns */
	for (let i = 0; i < staticScoreCard.holes; i++) {
		let par = Number(staticScoreCard.par[i]);
		headerRow += "<td>" + (i+1) + "</td>";
		parRow += "<td>" + par + "</td>";

		if (i == 8) {
			headerRow += "<td class=\"band\">OUT</td>";
			parRow += "<td class=\"band\">" + scoreCard.frontPar + "</td>";
		} else if (i == 17) {
			headerRow += "<td class=\"band\">IN</td>";
			parRow += "<td class=\"band\">" + scoreCard.backPar + "</td>";
		}

		for (let k = 0; k < playerCount; k++) {
			let playerScore = scoreCard.playerScores[k].scores[i];
			playerScores[k].row += formatScore(playerScore, par, false);
			if (i == 8) {
				playerScores[k].row += scoreFmt(scoreCard.playerScores[k].front, "band");
			} else if (i == 17) {
				playerScores[k].row += scoreFmt(scoreCard.playerScores[k].back, "band");
			}
		}
	}

	let html = "<table class=\"mcGolf\">";
	html += headerRow + "<td class=\"mcScTotal\">TOTAL</td></tr>";
	html += parRow + "<td class=\"mcScTotal\">" + (scoreCard.frontPar + scoreCard.backPar) + "</td></td>";

	for (let i = 0; i < playerCount; i++) {
		html += playerScores[i].row +
			scoreFmt(scoreCard.playerScores[i].front + scoreCard.playerScores[i].back, "mcScTotal") + "</td>";
	}
	return html + "</table>";
}

function setOpacity(n) {
	const opacityHex = Math.floor((255*Number(n))).toString(16).toUpperCase();
	const opacityPct = (100*Number(n)) + '%';

	console.log("Opacity set to: " + n + " hex: " + opacityHex + " pct: " + opacityPct);

	document.querySelectorAll(".scData > td, .vscData > td").forEach((el) => {
		el.style.background = 'rgb(120 120 120 / ' + opacityPct + ')';
	});
	document.querySelectorAll(".scData > td.scName").forEach((el, i) => {
		el.style.background = 'linear-gradient(to left, rgb(120 120 120 / ' + opacityPct + '), ' +
					staticScoreCard.players[i].color + ")";
	});
	document.querySelectorAll(".scSubHeader > td, .vscTotal > td, .vscHeader > td").forEach((el) => {
		el.style.background = 'rgb(80 80 80 / ' + opacityPct + ')';
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
	const mcColors = new Map([
		[".mcScHeader > td, .mcScData > td", "#333FBC"],
		[".mcScSubHeader > td", "#5A91CB"],
		[".mcScHeader > td.band, .mcScData > td.band", "#0D1FE2"],
		[".mcScSubHeader > td.band", "#6BE5F5"],
	]);
	mcColors.forEach((val, key) => {
		document.querySelectorAll(key).forEach((el) => {
			el.style.background = val + opacityHex;
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
