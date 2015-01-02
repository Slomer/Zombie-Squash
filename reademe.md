#Zombie Squash

1. Download all files, then run index.html in a modern browser.
2. Alternatively, a live version can be found [here](http://friskynomad.com/gametest/) 

##Technical notes:

* The game relies on the load order of the javascript files from the current index.html
* When index.html is loaded in a broswer, the game will load.
* Developement was done on windows 8.1 in chrome.
* IE11 tests well also.
* Firefox works but the animation of the jumps seems to stretch player.
* Mixed results with safari varying between no load and graphics issues on jump.
* Initially it will be paused with instructions showing.  A click on the screen will start the gameplay.
* When a player dies, the game will automatically pause to allow the player a chance to check the final score and then reset on unpausing.

##gameplay instruction:

* **movement:** ASWD, arrow keys, numpad 4,5/2,6,8
* **jump:** space, numpad 0
* **attack:** F, control, enter, numpad +
* **attack:** F, control, numpad +
* **pause:** P, pause/break, pause button at top right


* movement keys can be held or tapped.  Either works fine.
* You can damage enemies by jumping on their head.  You can also attack them,
but your attack has a delay.
* Zombie kills will be counted at the top left, along with your current level
* Some zombies just wander around, but most will charge you.
* As your level goes up, so does the game difficulty.  Zombies will be faster,
more numerous, and you will be invincible less time after being hurt.
* Your health shows at the bottom left of the game area
* An exclamation point above you means you took damage and are temporarily
invulnerable.
* There is a pause button at the top right, which will also reshow these
instructions.
* The game will also pause any time the game window loses focus.
* The level is procedurally generated, so reload if you don't like yours.
* You can walk through the left/right side of the screen but not the top/bottom.
* The game will reset after you die and unpause.