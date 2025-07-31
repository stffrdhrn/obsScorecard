'use strict';

//  G4ScoreBoard addon for OBS version 1.6.2 Copyright 2025 Norman Gholson IV
//  https://g4billiards.com http://www.g4creations.com
//  this is a purely javascript/html/css driven scoreboard system for OBS Studio
//  free to use and modify and use as long as this copyright statment remains intact. 
//  Salotto logo is the copyright of Salotto and is used with their permission.
//  for more information about Salotto please visit https://salotto.app


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function bsStyleChange() {
		if (document.getElementById("bsStyle").value == 1) {
		bc.postMessage({command:'style100'});
		localStorage.setItem("b_style", 1);

		}
		if (document.getElementById("bsStyle").value == 2) {
		bc.postMessage({command:'style125'});
		localStorage.setItem("b_style", 2);

		}
		if (document.getElementById("bsStyle").value == 3) {
		bc.postMessage({command:'style150'});
		localStorage.setItem("b_style", 3);

		}
		if (document.getElementById("bsStyle").value == 4) {
		bc.postMessage({command:'style200'});
		localStorage.setItem("b_style", 4);

		}
	}

	function swapColors() {
		if (localStorage.getItem('p1colorSet') != null){ var p1original = localStorage.getItem('p1colorSet'); } else { var p1original = "white"; }
		if (localStorage.getItem('p2colorSet') != null){ var p2original = localStorage.getItem('p2colorSet'); } else { var p2original = "white"; }
		setTimeout( function()  {
                    document.getElementById("p1colorDiv").value = p2original;
                    document.getElementById("p2colorDiv").value = p1original;
                    bc.postMessage({player:'1',color:p2original});
                    bc.postMessage({player:'2',color:p1original});

		    document.getElementById("p2colorDiv").style.background = p1original;
                    document.getElementById("p1colorDiv").style.background = p2original;
                    localStorage.setItem('p1colorSet', p2original);
                    localStorage.setItem('p2colorSet', p1original);

		    document.getElementsByTagName("select")[0].options[0].value = p2original;
                    document.getElementsByTagName("select")[1].options[0].value = p1original;
                    c1value = p1original;
                    c2value = p2original;

		    if (c1value == "orange" || c1value == "khaki" || c1value == "tomato" || c1value == "red" || c1value == "orangered" || c1value == "white" || c1value == "orange" || c1value == "lightgreen" || c1value == "lightseagreen")  { document.getElementById("p2colorDiv").style.color= "#000";} else { document.getElementById("p2colorDiv").style.color= "lightgrey";};
		    if (c2value == "orange" || c2value == "khaki" || c2value == "tomato" || c2value == "red" || c2value == "orangered" || c2value == "white" || c2value == "orange" || c2value == "lightgreen" || c2value == "lightseagreen")  { document.getElementById("p1colorDiv").style.color= "#000";} else { document.getElementById("p1colorDiv").style.color= "lightgrey";};
		} , 100);
	}

	function playerColorChange(player) {
	    var cvalue  = document.getElementById("p"+player+"colorDiv").value;
	    if (player == 1) {
		playerx  =  player;
		pColormsg = document.getElementById("p"+player+"colorDiv").value;
		bc.postMessage({player:playerx,color:pColormsg});
		document.getElementById("p1colorDiv").style.background = document.getElementById("p"+player+"colorDiv").value;
		if (cvalue == "orange"  || cvalue == "khaki"  || cvalue == "tomato" || cvalue == "red" || cvalue == "orangered" || cvalue == "white" || cvalue == "orange" || cvalue == "lightgreen" || cvalue == "lightseagreen")  { document.getElementById("p1colorDiv").style.color= "#000";} else { document.getElementById("p1colorDiv").style.color= "lightgrey";};
		localStorage.setItem("p1colorSet", document.getElementById("p"+player+"colorDiv").value);
		document.getElementsByTagName("select")[0].options[0].value = cvalue;
	    } else {
		playerx  =  player;
		pColormsg = document.getElementById("p"+player+"colorDiv").value;
		bc.postMessage({player:playerx,color:pColormsg});
		document.getElementById("p2colorDiv").style.background = document.getElementById("p"+player+"colorDiv").value;
		if (cvalue == "orange"  || cvalue == "khaki"  || cvalue == "tomato" || cvalue == "red" || cvalue == "orangered" || cvalue == "white" || cvalue == "orange" || cvalue == "lightgreen" || cvalue == "lightseagreen")  { document.getElementById("p2colorDiv").style.color= "#000";} else { document.getElementById("p2colorDiv").style.color= "lightgrey";};
		localStorage.setItem("p2colorSet", document.getElementById("p"+player+"colorDiv").value);
		document.getElementsByTagName("select")[1].options[0].value = cvalue;
	    }
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
	}

	function postStaticScoreCard() {
		bc.postMessage({
				players: [ {player: 1, name: p1Name, enabled: true },
					   {player: 2, name: p2Name, enabled: p2Enabled} ],
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

	function saveScores() {
		const p1Score = document.getElementById("p1Score");
		const p2Score = document.getElementById("p2Score");

		p1Data.scores[currentHole-1] = p1Score.value;
		p2Data.scores[currentHole-1] = p2Score.value;

		bc.postMessage({ scores: [ p1Data, p2Data ]});
		storeScoreCard();
	}

	function formatScoreCard(playerData) {
		let fmt = "";
		let total = 0;
		for (let i = 0; i < scoreCardHoles; i++) {
			if (i == 9) {
				// separate 9 holes;
				fmt += " ";
			}
			if (playerData.scores[i] > 0) {
				fmt += playerData.scores[i];
				total += Number(playerData.scores[i]);
			} else {
				fmt += "-";
			}
			fmt += " ";
		}
		fmt += total;
		return fmt;
	}

	function loadScores() {
		const p1Score = document.getElementById("p1Score");
		const p2Score = document.getElementById("p2Score");
		const scoreCardFmt = document.getElementById("scoreCardFmt");
		let p2Enabled = document.getElementById("p2Enabled").checked;

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
		scoreCardFmt.innerHTML =
			  "  1 2 3 4 5 6 7 8 9  101112131415161718\n" +
			"P1: " + formatScoreCard(p1Data);
		if (p2Enabled) {
			if (p2Data.scores[currentHole-1] > 0) {
				p2Score.value = p2Data.scores[currentHole-1];
			} else {
				p2Score.value = scoreCardPar[currentHole-1];
			}
			scoreCardFmt.innerHTML += "\n" +
				"P2: " + formatScoreCard(p2Data);
		}
	}

	function nextHole() {
		// Save current hole data
		saveScores();

		if (currentHole < scoreCardHoles) {
			currentHole++;
		}

		// Load next hole data
		document.getElementById("currentHole").innerHTML = currentHole;
		loadScores();
	}

	function prevHole() {
		// Save current hole data
		saveScores();

		if (currentHole > 1) {
			currentHole--;
		}
		document.getElementById("currentHole").innerHTML = currentHole;
		loadScores();
	}

	function rst_scr_btn() {
		document.getElementById('settingsBox2').style.border = "none";
		document.getElementById('logoSsImg1').style.border = "none";
		document.getElementById('logoSsImg2').style.border = "none";
		document.getElementById('logoSsImg3').style.border = "none";
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
	}

	function storeScoreCard() {
		localStorage.setItem("p1ScoreCard", p1Data.scores.join());
		localStorage.setItem("p2ScoreCard", p2Data.scores.join());
	}

	function resetScore() {
		if (confirm("Click OK to confirm score reset")) {
		p1ScoreValue = 0;
		p2ScoreValue = 0;
		localStorage.setItem("p1ScoreCtrlPanel", 0);
		localStorage.setItem("p2ScoreCtrlPanel", 0);
		bc.postMessage({player:'1',score:'0'});
		bc.postMessage({player:'2',score:'0'});
		} else { }
	}

	function obsThemeChange() {
		if (document.getElementById("obsTheme").value ==  "28") {
			localStorage.setItem("obsTheme", "28"); 
			document.getElementById("obsTheme").value =  "28";
			document.getElementsByTagName("body")[0].style.background = "#2b2e38";
			document.styleSheets[0].disabled = false;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;

		}
		if (document.getElementById("obsTheme").value ==  "27") {
			localStorage.setItem("obsTheme", "27"); 
			document.getElementById("obsTheme").value =  "27";
			document.getElementsByTagName("body")[0].style.background = "#1f1e1f";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = false;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;
		}
		if (document.getElementById("obsTheme").value ==  "acri") {
			localStorage.setItem("obsTheme", "acri"); 
			document.getElementById("obsTheme").value =  "acri";
			document.getElementsByTagName("body")[0].style.background = "#181819";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = false;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;
		}
		if (document.getElementById("obsTheme").value ==  "grey") {
			localStorage.setItem("obsTheme", "grey"); 
			document.getElementById("obsTheme").value =  "grey";
			document.getElementsByTagName("body")[0].style.background = "#2f2f2f";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = false;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;
		}
		if (document.getElementById("obsTheme").value ==  "light") {
			localStorage.setItem("obsTheme", "light"); 
			document.getElementById("obsTheme").value =  "light";
			document.getElementsByTagName("body")[0].style.background = "#e5e5e5";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = false;
			document.styleSheets[5].disabled = true;
		}
		if (document.getElementById("obsTheme").value ==  "rachni") {
			localStorage.setItem("obsTheme", "rachni"); 
			document.getElementById("obsTheme").value =  "rachni";
			document.getElementsByTagName("body")[0].style.background = "#232629";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = false;
			}
	}

	function startThemeCheck() {
		if (localStorage.getItem("obsTheme") == null) { localStorage.setItem("obsTheme", "28"); document.getElementById("obsTheme").value =  "28";  };
		if (localStorage.getItem("obsTheme") == "28") {
			document.getElementById("obsTheme").value =  "28";
			document.getElementsByTagName("body")[0].style.background = "#2b2e38";
			document.styleSheets[0].disabled = false;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;
		}
		if (localStorage.getItem("obsTheme") == "27") {
			document.getElementById("obsTheme").value =  "27";
			document.getElementsByTagName("body")[0].style.background = "#1f1e1f";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = false;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;
		}
		if (localStorage.getItem("obsTheme") == "acri") {
			document.getElementById("obsTheme").value =  "acri";
			document.getElementsByTagName("body")[0].style.background = "#181819";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = false;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;
		}
		if (localStorage.getItem("obsTheme") == "grey") {
			document.getElementById("obsTheme").value =  "grey";
			document.getElementsByTagName("body")[0].style.background = "#2f2f2f";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = false;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = true;
		}
		if (localStorage.getItem("obsTheme") == "light") {
			document.getElementById("obsTheme").value =  "light";
			document.getElementsByTagName("body")[0].style.background = "#e5e5e5";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = false;
			document.styleSheets[5].disabled = true;
		}
		if (localStorage.getItem("obsTheme") == "rachni") {
			document.getElementById("obsTheme").value =  "rachni";
			document.getElementsByTagName("body")[0].style.background = "#232629";
			document.styleSheets[0].disabled = true;
			document.styleSheets[1].disabled = true;
			document.styleSheets[2].disabled = true;
			document.styleSheets[3].disabled = true;
			document.styleSheets[4].disabled = true;
			document.styleSheets[5].disabled = false;
		}
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// variable declarations
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const bc = new BroadcastChannel('g4-main');
	var scoreCardHoles = 18;
	var p1Name = "";
	var p2Name = "";
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
	var hotkeySwapOld = hotkeySwap;
	var tev;
	var p1ScoreValue;
	var p2ScoreValue;
	var warningBeep = new Audio("./common/sound/beep2.mp3");
	var foulSound = new Audio("./common/sound/buzz.mp3");
	var msg;
	var msg2;
	var slider = document.getElementById("scoreOpacity");
	var sliderValue;
	var playerNumber;
	var playerx;
	var c1value;
	var c2value;
	var pColormsg;

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// onload stuff
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	slider.oninput = function() {
		sliderValue = this.value/100;
		bc.postMessage({opacity:sliderValue});
		localStorage.setItem("opacity", this.value);
	}

	document.getElementById('settingsBox2').onclick = function() {
			document.getElementById('settingsBox2').style.border = "1px solid blue";
			document.getElementById('FileUploadL0').click();
			setTimeout(rst_scr_btn,100);
			};

	if (localStorage.getItem('p1colorSet') !== null) {
		var cvalue = localStorage.getItem('p1colorSet');
		document.getElementById('p1colorDiv').style.background = localStorage.getItem('p1colorSet');
		document.getElementsByTagName("select")[0].options[0].value = cvalue;
		if (cvalue == "orange"  || cvalue == "khaki"  || cvalue == "tomato" || cvalue == "red" || cvalue == "white" || cvalue == "orangered" || cvalue == "orange" || cvalue == "lightgreen" || cvalue == "lightseagreen")  { document.getElementById("p1colorDiv").style.color= "#000";} else { document.getElementById("p1colorDiv").style.color= "lightgrey";};

	}

	if (localStorage.getItem('p2colorSet') !== null) {
		var cvalue = localStorage.getItem('p2colorSet');
		document.getElementById('p2colorDiv').style.background = localStorage.getItem('p2colorSet');
		if (cvalue == "orange"  || cvalue == "khaki"  || cvalue == "tomato" || cvalue == "red" || cvalue == "orangered" || cvalue == "white" || cvalue == "orange" || cvalue == "lightgreen" || cvalue == "lightseagreen")  { document.getElementById("p2colorDiv").style.color= "#000";} else { document.getElementById("p2colorDiv").style.color= "lightgrey";};

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
	loadScores();

	if (localStorage.getItem("obsTheme") == "28") { document.getElementById("obsTheme").value = "28"; }
	if (localStorage.getItem("b_style") == "1") { document.getElementById("bsStyle").value = "1"; }
	if (localStorage.getItem("b_style") == "2") { document.getElementById("bsStyle").value = "2"; }
	if (localStorage.getItem("b_style") == "3") { document.getElementById("bsStyle").value = "3"; }
	if (localStorage.getItem("opacity") > 0) {
		slider.value = localStorage.getItem("opacity");
	}
	document.getElementById("verNum").innerHTML = versionNum;
	postNames();startThemeCheck();

