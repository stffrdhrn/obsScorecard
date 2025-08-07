ScoreCard addon for OBS.

Based originally on https://github.com/ngholson/g4ScoreBoard.
https://g4billiards.com http://www.g4creations.com

this is a purely javascript/html/css driven golf scorecard system for OBS Studio

```
-------------------------------------------------------------

## Extract zip file to the folder of your choice.<br>

```
Zip contents:
{scoreCard-main.zip}
|
|-[common]
|   |-[js]
|   |   |-jquery.js
|   |   |-browser_source.js
|   |   |-control_panel.js
|   |
|   |-[css]
|   	|-[control_panel]
|   	|   |-yami.css
|    	|   |-acri.css
|   	|   |-dark.css
|  	|   |-grey.css
|   	|   |-rachni.css
|  	|   |-light.css
|	|   |-required.css
|	|
|	|-[browser_source]
|   	    |-100.css
|   	    |-125.css
|   	    |-150.css
|   	    |-200.css
|
|-scoreCard_hotkeys.lua
|-browser_source.html
|-control_panel.html
|-hotkeys.js
|-README.md
|-LICENSE

```
--------------------------------------------------------------

## Installation:

Extract the downloaded file to the directory of your choosing,
just make sure you know where to find it again.

OBS V27.1 and lower Configuration:

 1. click on the Docks Menu from the top menu bar.
 2. Select "Custom Browser Docks".
 3. type a name (G4ScoreBoard) in the "Dock Name" box.
 4. input the full path to "control_panel.html" in the URL box. 
   (example: "c:\users\yourname\desktop\scorecard\control_panel.html")
 5. Click "Close"
 6. Select the scene you want the scoreboard to display.
 7. Add a "Browser Source" -> "Create New" -> give it a name. click OK.
 8. Input the full path to "browser_source.html" in the URL box.
   (example: "c:\users\yourname\desktop\scorecard\browser_source.html")
 9. Set Width to 1920 and Height to 1080.
 10. click OK.

OBS V27.2 and higher Configuration:

 1. click on the Docks Menu from the top menu bar.
 2. Select "Custom Browser Docks".
 3. type a name (G4ScoreBoard) in the "Dock Name" box.
 4. input the full path file URI to "control_panel.html" in the URL box. 
   (example: "file:///c:/users/yourname/desktop/scorecard/control_panel.html")
 5. Click "Close"
 6. Select the scene you want the scoreboard to display.
 7. Add a "Browser Source" -> "Create New" -> give it a name. click OK.
 8. Input the full path file URI to "browser_source.html" in the URL box.
   (example: "file:///c:/users/yourname/desktop/scorecard/browser_source.html")
 9. Set Width to 1920 and Height to 1080.
 10. click OK.


To install Hotkeys:

 1. Click on "Tools" from the top menu in OBS.
 2. Select "Scripts" from the menu.
 3. Click the "+" in the lower left.
 4. Navigate to and select the "scorecard_hotkeys.lua" file that came with this download.
 5. Click Open.
 6. Open the "Settings" in OBS and navigate to the "Hotkeys" section.
 7. The scoreboard hotkeys all have the "Golf" prefix for easy identification.

--------------------------------------------------------------

