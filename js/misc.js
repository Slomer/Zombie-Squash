/**
 * This file holds effect classes such as splash, and any misc functions,
 * helpers, or other items that didn't fit as well in the other files.
 */

/**
 * object acts as a sprite template container for character and enemy bodies
 * @type {Object}
 */
var allBodies = {
    boy : {
        up : 'images/char-boy-up.png',
        down : 'images/char-boy-down.png',
        left : 'images/char-boy-left.png',
        right : 'images/char-boy-right.png',
    },
    catgirl : {
        up : 'images/char-cat-girl-up.png',
        down : 'images/char-cat-girl-down.png',
        left : 'images/char-cat-girl-left.png',
        right : 'images/char-cat-girl-right.png',
    }
};
/**
 * allMakeups acts as a sprite template container for zombie makeup/effects
 * these make the enemies look different than the player using the same body
 * @type {Object}
 */
var allMakeups = {
    zombie1 : {
        up : 'images/makeup-zombie1-up.png',
        down : 'images/makeup-zombie1-down.png',
        left : 'images/makeup-zombie1-left.png',
        right : 'images/makeup-zombie1-right.png',
    },
    zombie2 : {
        up : 'images/makeup-zombie2-up.png',
        down : 'images/makeup-zombie2-down.png',
        left : 'images/makeup-zombie2-left.png',
        right : 'images/makeup-zombie2-right.png',
    },
};
/**
 * allWeapons acts as a weapon template holder for all future weapons
 * @type {Object}
 */
var allWeapons = {
    weapon1 : {
        sprites : {
            up : 'images/weapon-slash-up.png',
            down : 'images/weapon-slash-down.png',
            left : 'images/weapon-slash-left.png',
            right : 'images/weapon-slash-right.png',
        },
        speed : 15,
        size : 120,
    }
};

/**
 * class for water splash effects that spawn when jumping into or out of water
 * these are their own entities so that they can easily stay put
 * and animate independently
 */
var Splash = function() {
    //visual sprites for our splashes
    //2 are used so that we can have a splash behind the player that does not
    //draw over them but is there if they move
    this.spritefront = 'images/splash-sheet-front.png';
    this.spriteback = 'images/splash-sheet-back.png';
    //sprite sheet is used so we set up frames, time ticks
    //and some other frame related sizes along with our overall size

    //total frames
    this.frames = 10;
    this.framewidth = 101;
    //current frame
    this.frame = 1;
    this.ticks = 0;
    this.splashing = false;
    //current coordinates, used for rendering
    this.x = 0;
    this.y = 0;
    this.size = {
        width : 1010,
        height : 171
    };
    //speed is how splash will animate, not move
    this.speed = 50;
};

/**
 * update function for our Splash class that fires every animation frame
 * @param  {number} dt is the time measurement from our engine
 * @return {none}
 */
Splash.prototype.update = function(dt) {
    //count up frames if we are animating this Splash
    //ticks would be here, but putting it in render makes it easier
    //to only count up once per frame instead of once per front/back
    if(this.splashing === true) {
        if (this.ticks > 1) {
            if (this.frame < this.frames){
                this.frame += 1;
            }
            else {
                this.frame = 1;
                this.splashing = false;
            }
            this.ticks = 0;

        }
    }

};

/**
 * render function for our Splash class that fires every animation frame
 * @param  {number} dt is the time measurement from our engine
 * @param  {boolean} front is a boolean to switch between rendering front/vs back
 * @return {none}
 */
Splash.prototype.render = function(dt,front) {
    var dsprite;
    if (front){
        dsprite = this.spritefront;
        this.ticks += dt*this.speed;
    }

    else {
        dsprite = this.spriteback;
    }
    if(this.splashing === true) {
        ctx.drawImage(
            Resources.get(dsprite), //sprite
            this.framewidth*(this.frame - 1), //clip start x
            0, //clip start y
            this.framewidth, //clip width
            this.size.height, //clip height
            this.x, //drawing location x
            this.y, //drawing location y
            this.framewidth, //final draw width
            this.size.height); //final draw height
    }
};

/**
 * constructs an active splash effect.  Doing this here allows for recycling
 * any inactive splashes before actually creating a new instance
 * @param  {number} x is positional and used for rendering
 * @param  {number} y is positional and used for rendering
 * @param  {boolean} upSplash changes sprite and sound when jumping out of water vs in
 * @param  {boolean} silent skips the sound playing for when cloning player
 * @return {none}
 */
function createSplash(x,y,upSplash,silent){
    //look for any available existing splashes
    var thisSplash = _.find(allSplashes,function(splash){return splash.splashing !== true;});
    //if we didn't find any, make a new one (with a cap for sanity sake)
    if (thisSplash === null && allSplashes.length < GLBL.maxSplashes) {
        allSplashes.push(thisSplash = new Splash);
    }
    //now activate our splash.  It should only be null above our cap, but check it first.
    if (thisSplash !== null){
        thisSplash.frame = 1;
        thisSplash.ticks = 0;
        thisSplash.x = x;
        thisSplash.y = y;
        thisSplash.splashing = true;
        if (silent !== true) {
            createSplashSound.call(this,upSplash);
        }
    }
}

/**
 * helper function used by createSplash to play a sound when splashing
 * @param  {boolean} upSplash is a boolen to decide which sound to play
 * @return {none}
 */
function createSplashSound(upSplash) {
    if (upSplash) {
        //play our splash sound for when jumping out of water
        createjs.Sound.play(_.sample(this.sounds.upsplashes));
    }
    else {
        //play our splash sound for landing in water
        createjs.Sound.play(_.sample(this.sounds.splashes));
    }

}

/**
 * class for gore splash effects that spawn when killign an enemy
 * these are their own entities so that they can easily stay put
 * and animate independently
 */
var Gore = function() {
    //visual sprites for our gore.
    //2 types are used so that we can have a splash behind the player that does
    //not draw over them but is there if they move
    //multiple fronts are available for random variation
    this.spriteFronts = {
        gore1 : 'images/gore-sheet-front1.png',
        gore2 : 'images/gore-sheet-front2.png',
        gore3 : 'images/gore-sheet-front3.png',
    };
    this.spriteback = 'images/gore-sheet-back.png';
    //sprite sheet is used so we set up frames, time ticks
    //and some other frame related sizes along with our overall size

    //total frames
    this.frames = 10;
    this.framewidth = 101;
    //current frame
    this.frame = 1;
    this.ticks = 0;
    this.goring = false;
    this.x = 0;
    this.y = 0;
    //current coordinates, used for rendering
    this.size = {
        width : 1010,
        height : 171
    };
    //speed is how splash will animate, not move
    this.speed = 50;
};

/**
 * update function for our Gore class that fires every animation frame
 * @param  {number} dt is the time measurement from our engine
 * @return {none}
 */
Gore.prototype.update = function(dt) {
    //count up frames if we are animating this gore
    //ticks would be here, but putting it in render makes it easier
    //to only count up once per frame instead of once per front/back
    if(this.goring === true) {
        if (this.ticks > 1) {
            if (this.frame < this.frames){
                this.frame += 1;
            }
            else {
                this.goring = false;
            }
            this.ticks = 0;
        }
    }

};

/**
 * render function for our Gore class that fires every animation frame
 * @param  {number} dt is the time measurement from our engine
 * @param  {boolean} front is a boolean to switch between rendering front/vs back
 * @return {none}
 */
Gore.prototype.render = function(dt,front) {

    var dsprite;
    if (front){
        dsprite = _.sample(this.spriteFronts);
        this.ticks += dt*this.speed;
    }

    else {
        dsprite = this.spriteback;
    }
    if(this.goring === true) {
        ctx.drawImage(
            Resources.get(dsprite), //sprite
            this.framewidth*(this.frame - 1), //clip start x
            0, //clip start y
            this.framewidth, //clip width
            this.size.height, //clip height
            this.x, //drawing location x
            this.y, //drawing location y
            this.framewidth, //final draw width
            this.size.height); //final draw height
    }
};

/**
 * constructs an active gore effect.  Doing this here allows for recycling
 * any inactive gore before actually creating a new instance
 * @param  {number} x is positional and used for rendering
 * @param  {number} y is positional and used for rendering
 * @param  {boolean} upGore is unused.  left as a placeholder for future use
 * @param  {boolean} silent is unused.  left as a placeholder for future use
 * @return {none}
 */
function createGore(x,y,upGore,silent){
    //look for any available existing splashes
    var thisGore = _.find(allGores,function(gore){return gore.goring !== true;});
    //if we didn't find any, make a new one (with a cap for sanity sake)
    if (thisGore === null && allGores.length < GLBL.maxGores) {
        allGores.push(thisGore = new Gore);
    }
    //now activate our gore.  It should only be null above our cap, but check it first.
    if (thisGore !== null){
        thisGore.frame = 1;
        thisGore.ticks = 0;
        thisGore.x = x;
        thisGore.y = y;
        thisGore.goring = true;
        if (silent !== true) {
            createGoreSound.call(this);
        }
    }
}

/**
 * currently unused function that will be called when we have gore specific
 * sounds created.  FOr now, enemy pain noises work to this effect solo
 * @return {none}
 */
function createGoreSound() {
    //TODO make a gore specific noise/s
    createjs.Sound.play(_.sample(this.sounds.splashes));
}

// generate a random level
// TODO: make this an option with prebuilt levels also available via parameter
var level = new ProcLevel;
// make a container for our splashes
var allSplashes = [];
// start off with 5 splashes to use.  We can make more later as we need them
for (var splashCount = 0;splashCount < 4; splashCount++) {
    allSplashes.push(new Splash);}
// make a container for our gores
var allGores = [];
// start off with 5 gores to use.  We can make more later as we need them
for (var goreCount = 0;goreCount < 4; goreCount++) {allGores.push(new Gore);}
// make a container for our enemies
var allEnemies = [];
// start off with 10 enemies to use.  We can make more later as we need them
for (var enemyCount = 0;enemyCount < 10; enemyCount++) {
    allEnemies.push(new Enemy);}
// even though we have 10, we will only activate 1 per difficulty level that we started with
for (var actEnemyCount = 0;actEnemyCount < GLBL.difficulty; actEnemyCount++){
    createEnemy();}
// make a new player instance
var player = new Player;

/**
 * This event listens for key presses and sends the keys to an array for
 * processing it also prevents player usable keys from doing things like
 * scrolling so we need to be careful with what keys we allow as input
 * pauses are instant here with no wait in an array for processing
 */
document.addEventListener('keydown', function(e) {
    // prevent only there keys from doing normal functions
    // on this page to avoid accidental scrolling and such
    if(_.has(GLBL.allowedKeys, e.keyCode)) {
        e.preventDefault();
        if (_.contains(GLBL.curKeys, e.keyCode) === false) {
            // we want to handle pauses here instead of in our updates
            // this ensures that pauses are quick and that we can
            // unpause when paused
            if (GLBL.allowedKeys[e.keyCode] == 'pause'){
                GLBL.paused = !GLBL.paused;
            }
            else{
                // anything that is not pause gets pushed into the update queue
                GLBL.curKeys.push(e.keyCode);
            }

        }
    }
    else if (e.keyCode == 27) {
        //if we hit escape, make sure our instructions are closed
        toggleInstructions(false);
    }
});

/**
 * this event listens for key up events.  Once a key is up it is removed from
 * our array of keys to process for things like movement
 */
document.addEventListener('keyup', function(e) {
    // if we were holding this key down before,
    // delete it so we know we aren't any longer
    if(_.contains(GLBL.curKeys, e.keyCode)) {
        GLBL.curKeys = _.without(GLBL.curKeys,e.keyCode);
    }

});

/**
 * helper function to find distance between 2 entities on the level
 * based on their corridinates.
 * @param  {entity} thing1 is usually the player or it's clone
 * @param  {entity} thing2 is usually an enemt
 * @param  {boolean} checkingClone is a boolean to toggle checking player clone
 * @return {number} returns distance after adjusting it for ratio
 */
function absDis(thing1,thing2,checkingClone) {
    // some pythagorean trickery to find the distance between our objects
    // we use some set offset variables in each thing to decide where a sprites
    // visual ground point is

    // adjust for the fact that our height and width are different
    // in our grid to make it work as if our height was the same.
    // distance should be relative since we are faking an angled perspective
    // the result should be that you have to be visually closer up/down than
    // left/right to collide
    var yadj = GLBL.ratioAdjust;
    
    var clonexoff = 0;
    var cloneyoff = 0;
    //if we are checking a clone, we will assume the first thing is the player
    if(checkingClone === true){
        clonexoff = player.clone.xoff;
        cloneyoff = player.clone.yoff;
    }
    else
    {
        clonexoff = 0;
        cloneyoff = 0;
    }

    //this will get the distance between the X's and Y's.
    var asquared = Math.pow((thing1.x + thing1.center.xoff + clonexoff) -
        (thing2.x + thing2.center.xoff), 2);
    var bsquared = Math.pow(((thing1.y + thing1.center.yoff + cloneyoff) -
    (thing2.y + thing2.center.yoff))*yadj , 2);
    //adjust for percieved enemy and player height/width ratios here
    //this actually returns a false distance due to ratio adjustment
    //but it should help with close collision perspective
    bsquared = bsquared * thing1.size.collratio * thing2.size.collratio;
    //now that we have the 2 sides of our triangle, we can use them to get
    //the third, which is our distance
    return Math.sqrt(asquared + bsquared);
}

/**
 * getDepth checks a square's type based on checkSquareType and returns
 * @param  {number} x axis cooridinate on canvas
 * @param  {number} y axis cooridinate on canvas
 * @return {number} depth intended for any entity on that square
 */
function getDepth(x, y) {
    //return the depth from coordinates based on a square type
    //returned by checkSquareType
    if (checkSquareType(x,y,true) === 'water') {
        return 40;
    }
    else{
        return 0;
    }
}

/**
 * gets the type of any square based on either coordinates or row/column number
 * defaults to row/column
 * @param  {number} rowOrX is either the X axis cooridinates or a row number
 * @param  {number} colOrY is either the Y axis cooridinates or a column number
 * @param  {boolean} coords is a toggle for expected input type
 * @return {string} the name of the type of square we are on, such as water or grass
 */
function checkSquareType(rowOrX, colOrY, coords) {
    //if coords is true, we fed in an x/y instead of row/col, so convert that first
    if (coords === true) {
        row = Math.floor(colOrY / GLBL.rowHeight) + 1;
        col = Math.floor(rowOrX / GLBL.colWidth) + 1;

    }
    else{
        row = rowOrX;
        col = colOrY;
    }

    var squareNum = ((row -1) * GLBL.cols) + col -1;

    if (row > GLBL.rows || col > GLBL.cols || squareNum < 0) {return null;}
    else if (GLBL.squares.length >= squareNum && GLBL.squares.length > 0) {
        return GLBL.squares[squareNum].type;
    }
}

/**
 * turns on or off the instructions modal.  The modal is self rolled so has
 * no dependancies otuside of the game files themselves and standard JS/CSS/DOM
 * @param  {boolean} hides if not true, shows if true
 * @return {none}
 */
function toggleInstructions(show) {

    //find our html div to use as a modal
    var child = document.getElementById("instructions");

    if (show === true) {
        resizeInstructions();
        child.style.visibility = "visible";
    }
    else {
        child.style.visibility = "hidden";
    }

}

/**
 * this moves and resizes the modal based on browser resize event. This ensures
 * the modal used matches the game window
 * @return {[type]}
 */
function resizeInstructions() {

    var canvas = document.getElementById("gameCanvas");
    GLBL.canvasRect = canvas.getBoundingClientRect();

    var child = document.getElementById("instructions");
    child.style.width = GLBL.canvasRect.width - (GLBL.colWidth) + "px";
    child.style.height = GLBL.canvasRect.height - (GLBL.rowHeight*2.5) + 'px';
    child.style.left = GLBL.canvasRect.left + (GLBL.colWidth/3) + 'px';
    child.style.top = GLBL.canvasRect.top + GLBL.rowHeight + 'px';
}

/**
 * window resize event listener.  Used to ensure instructions modal stays
 * in line with game window
 */
window.addEventListener("resize", resizeInstructions);

/**
 * function to handle game window losing focus
 * @return {none}
 */
function gameLostFocus(){
        //tell our game it is not in focus
        GLBL.inFocus = false;
        GLBL.lostFocus = true;
        //empty any currently held keys
        GLBL.curKeys = [];
}

/**
 * event listener for when game window loses focus
 */
window.addEventListener("blur", gameLostFocus);

/**
 * function to handle game window gains focus
 * @return {none}
 */

function gameFocus(){
        //tell our game it is in focus again
        GLBL.inFocus = true;
}
/**
 * event listener for when game window gains focus
 */
window.addEventListener("focus", gameFocus);