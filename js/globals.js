/**
 * Object to hold various global scope information
 * instead of cluttering up the namespace
 * @type {Object}
 */
var GLBL = {
    //boolean holding game pause state
    paused : true,
    //boolean to prevent game from diong on pause activities repeatedly
    waspaused : false,    
    //boolean holding game pause state
    //this is to seperate pause from losing focus
    //and pause from actual requested game pause
    inFocus : true,
    //this is to let it know to reset the time when we regain focus
    //but to only do it once.  Seperates user pause and focus pause
    lostFocus : true,
    //how many rows should the game render?
    rows : 8,
    //how many columns should the game render?
    cols : 10,
    //how wide is each column?
    colWidth : 101,
    //how high is each row?
    rowHeight : 83,
    //should we draw a game border?
    frame : false,
    //how wide is a standard entity sprite?
    //set statically because they are all the same
    spriteWidth: 101,
    //how tall is a standard entity sprite?
    spriteHeight: 171,
    //this will be updated in our init and it impacts collision
    //for now it should be 1 because all enemies are the same size
    ratioAdjust : 1,
    //what difficulty should we start with?  1 is pretty slow
    //so it is currently set to 3.  Game level will subtract this
    //number fomr current difficulty when displaying on UI
    difficultyStart : 3,
    //current difficulty.  His will tick up as player kills enemies
    difficulty : 3,
    //this object holds and labels all of our accepted movement keys
    //these keys will not performa their normal function while the game
    //window is in focus
    allowedKeys : {
        //standard arrows and numlock off numpad arrows
        37: 'left', //left arrow
        38: 'up', //up arrow
        39: 'right', //right arrow
        40: 'down', //down arrow
        12: 'down', //numpad 5 with numlock off
        //numpad with numlock on
        104: 'up', //numpad 8
        98: 'down', //numpad 2
        101: 'down', //numpad 5 (for using numpad as if it was standard arrows)
        100: 'left', //numpad 4
        102: 'right', //numpad 6
        107: 'attack', //numpad +
        13: 'attack', //numpad enter (and regular enter)
        //asdw is also allowed and will emulate direction keys
        65: 'left', //a
        87: 'up', //w
        68: 'right', //d
        83: 'down', //s
        //TODO: Check if every browser has 32 for space or not
        32: 'jump', //space
        96: 'jump', //numpad 0
        17: 'attack', //control
        70: 'attack', //f
        80: 'pause', //p
        19: 'pause', //pause/break
    },
    //this holds the current keys being held down so that they can be used
    //for movement.  Keys are removed from the list when they are let up
    //downside here is if you press down a key and then click away from
    //the game area, it will consider that key to still be pressed.
    //amusing, but unintended.  Emptying it in an onblue event fixes this.
    curKeys : [],
    //base distance between player and enemy before touching
    //how far away before player is hurt
    collDist : 50,
    //should be bigger than collide ot make it easier to kill
    //enemies.  Should be less than 101
    squashDist : 60,
    //sanity check on number of enemies.  Not sure what a good setting is yet
    //the intention is to prevent a crash and not to cap the difficulty
    maxEnemies : 500,
    //sanity check on splashes.
    maxSplashes : 20,
    //sanity check on gore effects.
    maxGores : 30,
    //Ideally this would be in Player, but can't use it
    //as a throttle as easily, so it goes here in global
    //TODO: set this via actual weapons.
    weaponSpeed : 30,
    //container for information on all the suqares in our current level
    //could hold it in the level object, but putting it here instead since
    //we should never have 2 levels at once anyway and it makes accessing
    //it from console more consistent with these other settings.
    squares : [],
    //boolean that is set to true after sound preloads so we know we can
    //start rendering the game and actually have sounds
    soundReady : false,
    //bounding box for our canvas will be set here once things get going
    //will also be adjusted on browser resize.  Currently only used
    //for the instructions modal because it was added late in making the game
    canvasRect : null,
    //chance of a spawning enemy to be a wandering zombie.  10 = 10%, etc.
    wanderChance : 25,
};