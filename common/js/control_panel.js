'use strict';

//  G4ScoreBoard addon for OBS version 1.6.2 Copyright 2025 Norman Gholson IV
//  https://g4billiards.com http://www.g4creations.com
//  this is a purely javascript/html/css driven scoreboard system for OBS Studio
//  free to use and modify and use as long as this copyright statment remains intact.

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function bsStyleChange() {
		let bsStyle = document.getElementById("bsStyle").value;
		bc.postMessage({style: bsStyle});
		localStorage.setItem("b_style", bsStyle);
	}

	function setSelectColor(divId, cvalue) {
		const selectDiv = document.getElementById(divId);

                selectDiv.value = cvalue;
		selectDiv.style.background = cvalue;
		selectDiv.options[0].value = cvalue;
		/* Set a high contrast font color */
		if (cvalue == "orange" || cvalue == "khaki"
		    || cvalue == "tomato" || cvalue == "red"
		    || cvalue == "orangered" || cvalue == "white"
		    || cvalue == "orange" || cvalue == "lightgreen"
		    || cvalue == "lightseagreen") {
		    selectDiv.style.color= "#000";
		} else {
		    selectDiv.style.color= "lightgrey";
		}
	}

	function swapColors() {
		if (localStorage.getItem('p1colorSet') != null) {
			var p1original = localStorage.getItem('p1colorSet');
		} else {
			var p1original = "white";
		}
		if (localStorage.getItem('p2colorSet') != null) {
			var p2original = localStorage.getItem('p2colorSet');
		} else {
			var p2original = "white";
		}
		setTimeout( function()  {
		    p1Color = p2original;
		    p2Color = p1original;

                    localStorage.setItem('p1colorSet', p2original);
                    localStorage.setItem('p2colorSet', p1original);

		    setSelectColor("p1colorDiv", p2original);
		    setSelectColor("p2colorDiv", p1original);
		    postStaticScoreCard();
		} , 100);
	}

	function playerColorChange(player) {
	    const cvalue  = document.getElementById("p"+player+"color").value;
	    if (player == 1) {
	       p1Color = cvalue;
	       localStorage.setItem("p1colorSet", cvalue);
	       setSelectColor("p1color", cvalue);
	    } else {
	       p2Color = cvalue;
	       localStorage.setItem("p2colorSet", cvalue);
	       setSelectColor("p2color", cvalue);
	    }
            postStaticScoreCard();
	}

	function setOpacity(pct) {
		document.getElementById("opacityLabel").innerHTML = "Opacity: " + (pct) + "%";
		const sliderValue = pct/100;
		bc.postMessage({opacity:sliderValue});
		localStorage.setItem("opacity", pct)
	}

	function postNames() {
		/* Read DOM to model */
		p1Name = document.getElementById("p1Name").value;
		p2Name = document.getElementById("p2Name").value;
		p2Enabled = document.getElementById("p2Enabled").checked;
		for (let i = 0; i < scoreCardHoles; i++) {
			let holePar = document.getElementById("h"+(i+1)).value;
			if (holePar > 0) {
				scoreCardPar[i] = holePar;
			} else {
				scoreCardPar[i] = 0;
			}
		}

		/* Render control DOM bits */
		const p1FirstName = p1Name.split(" ")[0];
		const p2FirstName = p2Name.split(" ")[0];
		if (!p1FirstName == "") {
                    document.getElementById("p1ScoreLabel").innerHTML = p1FirstName + " Hole Stats";
                } else {
                    document.getElementById("p1ScoreLabel").innerHTML = "Player 1 Hole Stats";
                }
		if (!p2FirstName == "") {
                    document.getElementById("p2ScoreLabel").innerHTML = p2FirstName + " Hole Stats";
                } else {
                    document.getElementById("p2ScoreLabel").innerHTML = "Player 2 Hole Stats";
                }
		const player2DataGroup = document.getElementById("player2DataGroup");
		if (p2Enabled) {
			player2DataGroup.classList.remove("noShow");
		} else {
			player2DataGroup.classList.add("noShow");
		}

		postStaticScoreCard();
		storeStaticScoreCardPar();
		renderScoreCard();
	}

	function postStaticScoreCard() {
		bc.postMessage({
				players: [ {player: 1, name: p1Name, color: p1Color, enabled: true },
					   {player: 2, name: p2Name, color: p2Color, enabled: p2Enabled} ],
				scoreCardHoles: scoreCardHoles, scoreCardPar: scoreCardPar });
		let front9 = 0;
		let back9 = 0;
		for (let i = 0; i < scoreCardHoles; i++) {
			if (i < 9) {
				front9 += Number(scoreCardPar[i]);
			} else {
				back9 += Number(scoreCardPar[i]);
			}
		}
		let total = front9 + back9;
		document.getElementById("front9").innerHTML = front9 > 0 ? front9 : "";
		document.getElementById("back9").innerHTML = back9 > 0 ? back9 : "";
		document.getElementById("total").innerHTML = total > 0 ? total : "";
	}

	function addScore(player, val) {
		const pScore = document.getElementById("p" + player + "Score");
		if (player == '1') {
			p1Data.scores[currentHole-1] = Number(p1Score.value) + val;
			pScore.value = p1Data.scores[currentHole-1];
		} else {
			p2Data.scores[currentHole-1] = Number(p2Score.value) + val;
			pScore.value = p2Data.scores[currentHole-1];
		}
	}

	function addPutt(player, val) {
		const pPutts = document.getElementById("p" + player + "Putts");
		if (player == '1') {
			p1Data.putts[currentHole-1] = Number(p1Putts.value) + val;
			pPutts.value = p1Data.putts[currentHole-1];
		} else {
			p2Data.putts[currentHole-1] = Number(p2Putts.value) + val;
			pPutts.value = p2Data.putts[currentHole-1];
		}
	}


	function postScores(update = true) {
		/* Update the current score, allow bypassing during reset */
		if (update) {
			const p1Score = document.getElementById("p1Score");
			const p2Score = document.getElementById("p2Score");
			const p1Putts = document.getElementById("p1Putts");
			const p2Putts = document.getElementById("p2Putts");

			p1Data.scores[currentHole-1] = p1Score.value;
			p2Data.scores[currentHole-1] = p2Score.value;
			p1Data.putts[currentHole-1] = p1Putts.value;
			p2Data.putts[currentHole-1] = p2Putts.value;
		}

		bc.postMessage({ scores: [ p1Data, p2Data ]});
	}

	function formatScoreCard(playerData) {
		let fmt = "";
		let girs = "";
		let putts = "";
		let total = 0;
		let totalGirs = 0;
		let totalPutts = 0;
		for (let i = 0; i < scoreCardHoles; i++) {
			if (i == 9) {
				// separate 9 holes;
				fmt += " ";
				girs += " ";
				putts += " ";
			}
			if (playerData.scores[i] > 0) {
				fmt += playerData.scores[i];
				putts += playerData.putts[i];
				total += Number(playerData.scores[i]);
				totalPutts += Number(playerData.putts[i]);
				let girShots = scoreCardPar[i] - 2;
				let shotsToGreen = playerData.scores[i] - playerData.putts[i];
				if (shotsToGreen <= girShots) {
					totalGirs++;
					girs += "o";
				} else {
					girs += "x";
				}
			} else {
				fmt += "-";
				girs += "-";
				putts += "-";
			}
			fmt += " ";
			girs += " ";
			putts += " ";
		}

		fmt += total;
		putts += totalPutts;
		girs += totalGirs;
		return fmt
			+ "\r\n  p " + putts
			+ "\r\n  g " + girs;
	}

	function renderScoreCard() {
		const p1Score = document.getElementById("p1Score");
		const p2Score = document.getElementById("p2Score");
		const p1Putts = document.getElementById("p1Putts");
		const p2Putts = document.getElementById("p2Putts");
		const scoreCardFmt = document.getElementById("scoreCardFmt");

		if (p1Data.scores[currentHole-1] > 0) {
			p1Score.value = p1Data.scores[currentHole-1];
		} else {
			p1Score.value = scoreCardPar[currentHole-1];
		}
		if (p2Data.scores[currentHole-1] > 0) {
			p2Score.value = p2Data.scores[currentHole-1];
		} else {
			p2Score.value = scoreCardPar[currentHole-1];
		}
		if (p1Data.putts[currentHole-1] > 0) {
			p1Putts.value = p1Data.putts[currentHole-1];
		} else {
			p1Putts.value = 2;
		}
		if (p2Data.putts[currentHole-1] > 0) {
			p2Putts.value = p2Data.putts[currentHole-1];
		} else {
			p2Putts.value = 2;
		}

		document.getElementById("currentHole").innerHTML = currentHole;
		scoreCardFmt.innerHTML =
 			"    1 2 3 4 5 6 7 8 9  101112131415161718\r\n" +
			"P1: " + formatScoreCard(p1Data);
		if (p2Enabled) {
			scoreCardFmt.innerHTML += "\r\n" +
				"P2: " + formatScoreCard(p2Data);
		}
	}

	function nextHole() {
		// Post current hole data
		postScores();

		if (currentHole < scoreCardHoles) {
			currentHole++;
		}
		storeScoreCard();

		// Load next hole data
		renderScoreCard();
	}

	function prevHole() {
		if (currentHole > 1) {
			currentHole--;
		}
		storeScoreCard();
		renderScoreCard();
	}

	function clearCurrentHole() {
		const p1Score = document.getElementById("p1Score");
		const p2Score = document.getElementById("p2Score");
		const p1Putts = document.getElementById("p1Putts");
		const p2Putts = document.getElementById("p2Putts");

		p1Score.value = 0;
		p2Score.value = 0;
		p1Putts.value = 0;
		p2Putts.value = 0;

		postScores();
		storeScoreCard();
		renderScoreCard();
	}

	/* Read static score card from local storage */
	function loadStaticScoreCard() {
		let storedScoreCardPar = localStorage.getItem("scoreCardPar");
		if (storedScoreCardPar != null) {
			scoreCardPar = storedScoreCardPar.split(",");
		}
		p1Name = localStorage.getItem("p1NameCtrlPanel");
		p2Name = localStorage.getItem("p2NameCtrlPanel");
		p2Enabled = localStorage.getItem("p2Enabled") === "y";
	}

	function storeStaticScoreCardPar() {
		localStorage.setItem("scoreCardPar", scoreCardPar.join());
		localStorage.setItem("p1NameCtrlPanel", p1Name);
		localStorage.setItem("p2NameCtrlPanel", p2Name);
		if (p2Enabled) {
			localStorage.setItem("p2Enabled", "y");
		} else {
			localStorage.removeItem("p2Enabled");
		}

	}

	function loadScoreCard() {
		let p1ScoreCard = localStorage.getItem("p1ScoreCard");
		if (p1ScoreCard != null) {
			p1Data.scores = p1ScoreCard.split(",");
		}
		let p2ScoreCard = localStorage.getItem("p2ScoreCard");
		if (p2ScoreCard != null) {
			p2Data.scores = p2ScoreCard.split(",");
		}
		let p1Putts = localStorage.getItem("p1Putts");
		if (p1Putts != null) {
			p1Data.putts = p1Putts.split(",");
		}
		let p2Putts = localStorage.getItem("p2Putts");
		if (p2Putts != null) {
			p2Data.putts = p2Putts.split(",");
		}
		let storedCurrentHole = localStorage.getItem("currentHole");
		if (storedCurrentHole != null) {
			currentHole = Number(storedCurrentHole);
		}
	}

	function storeScoreCard() {
		localStorage.setItem("p1ScoreCard", p1Data.scores.join());
		localStorage.setItem("p2ScoreCard", p2Data.scores.join());
		localStorage.setItem("p1Putts", p1Data.putts.join());
		localStorage.setItem("p2Putts", p2Data.putts.join());
		localStorage.setItem("currentHole", currentHole);
	}

	function resetScore() {
		if (confirm("Click OK to confirm score reset")) {
		p1Data.scores.length = 0;
		p2Data.scores.length = 0;
		p1Data.putts.length = 0;
		p2Data.putts.length = 0;
		currentHole = 1;
		storeScoreCard();
		renderScoreCard();
		postScores(false); /* Post scores but don't update */
		} else { }
	}

	function obsThemeChange() {
		const styleToBackground = new Map([
			["28", "#2b2e38"],
			["27", "#1f1e1f"],
			["acri", "#181819"],
			["grey", "#2f2f2f"],
			["light", "#e5e5e5"],
			["rachni", "#232629"],
		]);

		const obsTheme = document.getElementById("obsTheme").value;

		localStorage.setItem("obsTheme", obsTheme);
		document.getElementById("obsTheme").value = obsTheme;
		document.getElementsByTagName("body")[0].style.background = styleToBackground.get(obsTheme);
		document.styleSheets[0].disabled = obsTheme !== "28";
		document.styleSheets[1].disabled = obsTheme !== "27";
		document.styleSheets[2].disabled = obsTheme !== "acri";
		document.styleSheets[3].disabled = obsTheme !== "grey";
		document.styleSheets[4].disabled = obsTheme !== "light";
		document.styleSheets[5].disabled = obsTheme !== "rachni";
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// variable declarations
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const bc = new BroadcastChannel('sc-main');
	var scoreCardHoles = 18;
	var p1Name = "";
	var p2Name = "";
	var p1Color = "";
	var p2Color = "";
	var p2Enabled = false;
	var scoreCardPar = [];
        var currentHole = 1;
        var p1Data = {
          scores: [],
          putts: [],
          fairways: []
        };
        var p2Data = {
          scores: [],
          putts: [],
          fairways: []
        };
	var hotkeyP1ScoreUp;
	var hotkeyP1ScoreDown;
	var hotkeyP2ScoreUp;
	var hotkeyP2ScoreDown;
	var hotkeyScoreReset;
	var hotkeySwap;
	var hotkeyP1ScoreUpOld = hotkeyP1ScoreUp;
	var hotkeyP2ScoreUpOld = hotkeyP2ScoreUp;
	var hotkeyP1ScoreDownOld = hotkeyP1ScoreDown;
	var hotkeyP2ScoreDownOld = hotkeyP2ScoreDown;
	var hotkeyNextHoleOld = hotkeyNextHole;
	var hotkeySwapOld = hotkeySwap;
	var slider = document.getElementById("scoreOpacity");

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// onload stuff
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	slider.oninput = function() {
		setOpacity(this.value);
	}

	if (localStorage.getItem('p1colorSet') !== null) {
		const cvalue = localStorage.getItem('p1colorSet');
		setSelectColor("p1color", cvalue);
	}

	if (localStorage.getItem('p2colorSet') !== null) {
		var cvalue = localStorage.getItem('p2colorSet');
		setSelectColor("p2color", cvalue);

	}

	loadStaticScoreCard();
	// Sync static score card to DOM
	document.getElementById("p1Name").value = p1Name;
	document.getElementById("p2Name").value = p2Name;
	document.getElementById("p2Enabled").checked = p2Enabled;
	scoreCardPar.forEach((holePar, i) => {
		if (holePar > 0) {
			document.getElementById("h"+(i+1)).value = holePar;
		}
	});
	postStaticScoreCard();
	loadScoreCard();
	renderScoreCard();

	const obsTheme = localStorage.getItem("obsTheme");
	if (obsTheme !== null) {
		document.getElementById("obsTheme").value = obsTheme;
	}
	const style = localStorage.getItem("b_style");
	if (style !== null) {
		document.getElementById("bsStyle").value = style;
	}
	if (localStorage.getItem("opacity") > 0) {
		slider.value = localStorage.getItem("opacity");
		setOpacity(slider.value);
	}
	document.getElementById("verNum").innerHTML = versionNum;
	postNames();
	obsThemeChange();

