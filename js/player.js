/**
 * This file holds the player class and almot all related functions and variable
 * some shared objects may be in misc.js and some settings are in globals.js
 */

/**
 * This is the primary player class
 * There will normally be only one of these instantiated
 */
var Player = function () {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    // TODO: move these to a variable outside the class and sample it
    this.spriteSets = {
        boy : {
            up : 'images/char-boy-up.png',
            down : 'images/char-boy-down.png',
            left : 'images/char-boy-left.png',
            right : 'images/char-boy-right.png',
            current : 'images/char-boy-down.png',
            upjump : 'images/char-boy-up-jump.png',
            downjump : 'images/char-boy-down-jump.png',
            leftjump : 'images/char-boy-left-jump.png',
            rightjump : 'images/char-boy-right-jump.png',
            currentjump : 'images/char-boy-down-jump.png',
            shadow : 'images/char-shadow.png',
            alert : 'images/char-alert.png',
            status : 'images/char-alert.png' //sprite to use for current status.

        },
        girl : {
            up : 'images/char-cat-girl-up.png',
            down : 'images/char-cat-girl-down.png',
            left : 'images/char-cat-girl-left.png',
            right : 'images/char-cat-girl-right.png',
            current : 'images/char-cat-girl-down.png',
            upjump : 'images/char-boy-up-jump.png',
            downjump : 'images/char-boy-down-jump.png',
            leftjump : 'images/char-boy-left-jump.png',
            rightjump : 'images/char-boy-right-jump.png',
            currentjump : 'images/char-boy-down-jump.png',
            shadow : 'images/char-shadow.png',
            alert : 'images/char-alert.png',
            status : 'images/char-alert.png' //sprite to use for current status.

        },
    };

    this.sprites = _.sample(this.spriteSets);

    //player sounds
    this.sounds = {
        jumps : {
            jump1 : 'sounds/char-jump.mp3'
        },
        lands : {
            //land1 : 'sounds/char-land1.mp3'
            land2 : 'sounds/char-land2.mp3'
        },
        splashes : {
            splash1 : 'sounds/char-splash1.mp3'
        },
        upsplashes : {
            splash1 : 'sounds/char-upsplash1.mp3'
        },
        steps : {
            //step1 : 'sounds/char-step2.mp3',
            step2 : 'sounds/char-step1.mp3'
        },
        pains : {
            pain1 : 'sounds/char-pain1.mp3'
        },

    };
    //we really only need 1 direction instead of 2 since we didn't make corner
    //movement sprites, but leaving them both for now
    this.direction = 'down';
    this.directionjump = 'none';
    this.directiondraw = 'down';
    //starting and target sizes for player
    //primarily used for jumping
    //these original numbers should match the sprite
    //they are saved for offsetting the jump scaling effect
    this.size = {
        origwidth : 101, //the original size, which should match the sprite size
        origheight : 171,
        width : 101, //current dimenstions we will render with
        height : 171,
        width2 : 101, //set 2 is a target for animations
        height2 : 171,
        collratio : 1 //will be used in collision to offset x/y checks
    };
    this.center = { //used for collisions and other things that need actual player
        xoff : this.size.width / 2,
        yoff : this.size.height / 2,
    };

    //starting and target location for player
    this.x = GLBL.colWidth * Math.floor((GLBL.cols -1) / 2);
    this.x2 = this.x;
    this.y = GLBL.rowHeight * (GLBL.rows - 1.5);
    this.y2 = this.y;
    this.z = 0;
    this.z2 = 0;
    this.speed = 300; //default speed
    this.speedjump = 500; //default speed
    this.jumpheight = 120;
    //are we below ground level?
    this.depth = 0;
    this.splashing = false;
    this.upsplashing = false;
    this.bufferDelay = false;
    //do we have any special status?
    this.hasstatus = false;
    this.maxHealth = 5;
    this.health = this.maxHealth;
    //information of a clone/shadow of our player we can use
    //this is so we can draw the character twice if we want
    //without actually haveing 2 player entities
    this.clone = {
        cloning : false,  //this is not a toggle, it is just to hold a quick check for if both are 0 or not
        xoff : 0,
        yoff : 0
    };
    //should our next move be instant in any direction?
    //used along with cloning to cross screen boundries but could also be used for powerup
    this.teleport = {
        x : 0,
        y : 0,
        telX : false,
        telY : false
    };
    this.kills = 0;
    this.killsThisLevel = 0;
    this.swimming = false;
    //weapon stuff
    this.weapon = _.sample(allHandWeapons);
    this.attacking = false;

};

/**
 * function for player attack (any non jumping damage dealer)
 * delay on use will be dependant on weapon speed
 * will be the only way to kill certain enemies once boss types are added
 * this uses underscore library to enable throttling
 * @return {none}
 */
Player.prototype.attack = _.throttle(function() {

    //make sure we know we are attacking so we can render it
    //even if the current render is ugly and simple :)
    this.attacking = true;
    //get list of enemies close enough to hit with melee weapon
    //this should normally be a greater distance than
    //the player hurt distance, otherwise the attack is basically useless
    var attackList = _.filter(allEnemies, function(anEnemy){
        return absDis(player,anEnemy) < player.weapon.size;});
    //make our player stop attacking after a specified number of milliseconds
    //this let's our render function know when to stop drawing it
    _.delay(function(){player.attacking = false;},100);

    //hurt each enemy that we found was close enough above, if any
    if (attackList.length > 0) {
        _.each(attackList, function(Enemy){Enemy.hurt();});
    }
    //createWeapon(player.x, player.y);
    //play a sound.  Using jump sound for now.
    //TODO: make an attack sound
    createjs.Sound.play(_.sample(this.sounds.jumps));

//delay below on throttle is lower with fast weapon speed but has a minimum
},Math.max(5000 - (GLBL.weaponSpeed * 100),300),{trailing: false});

/**
 * function damages the player and makes him invulnerable after a while
 * by using underscore throttling, which is reduced based on difficult level
 * @return {none}
 */
Player.prototype.hurt = _.throttle(function() {
    //take away a health
    this.health -= 1;
    //player is hurt but alive
    if (this.health > 0){
        //turn on visual status we were hurt
        player.hasstatus = true;
        //play a pain sound
        createjs.Sound.play(_.sample(this.sounds.pains));
    }
    //player is dead
    //TODO: add actual death logic instead of just a pause
    else {
        //tell the game the player died.
        GLBL.playerDied = true;
        GLBL.paused = true;
        //play sound of zombies eating player (or me eating celery... :) )
        createjs.Sound.play('sounds/enemy-eating.mp3');
    }
    //turn back off our status, use same delay as throttling for
    //visual clue to player they can be hurt again
    _.delay(function(){player.hasstatus = false;},
        (Math.max(2000 - (GLBL.difficulty * 100),1000)));

//function is throttled so player is invulnerable a while after getting hit        
//this time goes down with difficulty levels to a minimum of 1 second
},(Math.max(2000 - (GLBL.difficulty * 100),1000)),{trailing: false});

/**
 * player jump function.  Sets up the animation destination and plays sound
 * throttle to avoid crazy flying players (which can be exploited with pause)
 * @return {none}
 */
Player.prototype.jump = _.throttle(function() {
    var curHeight = this.size.height;
    var curWidth = this.size.width;
    this.z2 = this.jumpheight;
    this.directionjump = 'up';
    //if we are at ground level when jumping play a regular
    //jump sound
    if (this.depth === 0) {
        createjs.Sound.play(_.sample(this.sounds.jumps));
    }
    //if we are not at ground level, assume we are in water an dplay upslash
    else {
        //true = upsplash instead of landing splash
        this.checksplash(true);
    }
    //delayed function makes player come back down after a while
    _.delay(function(){
        player.size.height2 = player.size.origheight;
        player.size.width2 = player.size.origwidth;
        player.z2 = 0;
        player.directionjump = 'down';
    },400);

    //this is our destination size, closer to the screen means bigger sprite
    this.size.height2 = this.size.height * 1.2;
    this.size.width2 = this.size.width * 1.2;
},700,{trailing: false});

/**
 * updates our player, including movement and key buffering
 * @param  {number} dt is a time measurement fomr our engine
 * @return {none}
 */
Player.prototype.update = function(dt) {
    //check existing movement to see what still needs to be done
    this.movement(dt);
    //this will buffer any other keys or moves after our
    //buffer speed limiter wait time from this.move() is over
    this.buffermove();
    //if we have keys buffered, check them and use them to set up moves.
    //There will be a delay enforced here
    this.move();

};

/**
 * check current depth of the player to see if it is in water
 * @return {depth as a number}
 */
Player.prototype.getdepth = function(){
    return getDepth(this.x + (GLBL.colWidth/2), this.y + GLBL.rowHeight);
};

/**
 * function to see if we can create a splash and if so, create a splash
 * @param  {boolean} upSplash toggles animation and sound styles
 * @return {none}
 */
Player.prototype.checksplash = function(upsplash) {
    //if we aren't splashing yet, go ahead and start
    //or if we are jumping, make an uplsash even if we are splashing
    if ((upsplash) || (!this.splashing)) {
        //make some sound
        if (upsplash) {
            //play water jump specific splash noise
            createSplash.call(this, this.x, this.y, true);
        }
        else {
            //set player to splashing so we don't splash repeatedly
            this.splashing = true;
            //play our splash sound for landing in water
            createSplash.call(this, this.x, this.y);
        }

        //if we are cloning, make a splash effect at the clone as well so that
        //transitions across screen while splashing look good
        //TODO: check clone for depth individually now that tiles are dynamic
        if (this.clone.cloning) {
            createSplash.call(this, this.x + this.clone.xoff, this.y + this.clone.yoff,false,true);
        }
    }
};

/**
 * draw our player on the screen
 * @param  {boolean} renderClone toggles whether we are currently rendering a copy
 * @return {none}
 */
Player.prototype.render = function(renderClone) {
    //TODO: figure out why firefox stretches issues on jumps and safari issues
    //this is to ensure other renders don't ruin the save and restore

    //check if we are trying to clone right now doing this here since we will
    //render twice if it is on and want to be really sure before we do that
    if (this.clone.xoff !== 0 || this.clone.yoff !== 0) {
        this.clone.cloning = true;
    }
    else {
        this.clone.cloning = false;
    }

    //are we drawing at the player location or his clone's?
    var drawx = 0;
    var drawy = 0;    
    if(renderClone !== true) {
        drawx = this.x;
        drawy = this.y;
    }
    else {
        drawx = this.clone.xoff + this.x;
        drawy = this.clone.yoff + this.y;
    }

    this.depth = this.getdepth();
    //just to help shorten the calls below
    var depth = this.depth;
    var width = this.size.width;
    var height = this.size.height;
    var origWidth = this.size.origwidth;
    var origHeight = this.size.origheight;

    if (depth === 0 || this.z-10 > depth){
        //we aren't in water, so reset our splash
        this.splashing = false;
        //fade drawing so we cane vary the alpha of our shadow
        ctx.globalAlpha = 1 - this.z/(this.jumpheight*2);
        //draw player shadow
        ctx.drawImage(Resources.get(this.sprites.shadow),
            drawx + this.z/4 - ((width - origWidth)/2),
            drawy + this.z/2.4 -((height - origHeight)/1.2),
            width-this.z/2,
            height-this.z/2);
        //return alpha on drawing
        ctx.globalAlpha = 1;
    }
    else {
        //we are in water so see if we need to render a splash
        this.checksplash();
        //lower alpha for shadow on water that we will draw a bit higher up
        ctx.globalAlpha = 0.5;
        //draw shadow on water
        ctx.drawImage(Resources.get(this.sprites.shadow),
            drawx + this.z/4 - (((width * 1.4) -origWidth)/2),
            drawy -((height - origHeight)/1.2),
            (width * 1.4) - this.z/2,
            height);
        //return alpha to normal
    }   ctx.globalAlpha = 1;

    //by all rights we should subtract from y here, but adding makes it look
    //like we hit the ground hard at the end, which is a nice effect
    //Jump height must be set higher to compensate for the lack of offset
    ctx.drawImage(Resources.get(this.sprites.current),
        0,
        0+this.z/2,origWidth,origHeight-depth,
        drawx - ((width - origWidth)/2),
        drawy + ((height-depth - origHeight)/1.2) - this.z/2 + depth,
        width, height-((height/origHeight)*depth));

    //add some joy to the jump with an overlay sprite :)
    if (this.z !== 0) {
        ctx.drawImage(Resources.get(this.sprites.currentjump),
            0,
            0+this.z/2,origWidth,
            this.size.origheight-depth,
            drawx - ((width - origWidth)/2),
            drawy + ((height-depth - origHeight)/1.2) - this.z/2 + depth,
            width, height-((height/origHeight)*depth));
    }

    //render an ugly little non animated attack effect
    if (this.attacking === true) {
        //sprite
        ctx.drawImage(Resources.get(this.weapon.sprites[this.direction]),
            //clipping area inside image X
            0,
            //clipping area inside image Y
            0,
            //size of clipped image width
            origWidth,
            //size of clipped image height
            this.size.origheight,
            //where to draw the actual image X
            drawx - ((width - origWidth)/2),
            //where to draw the actual image Y
            drawy + ((height - depth - origHeight)/1.2) +
            depth*origHeight/100 - this.z,
            //final render width
            width,
            //final render height
            height-((height/origHeight)*depth));
    }

    //render our current status icon if we have a status
    //this rendering used to lok much nicer, but it broke IE and it was
    //the only thing breaking IE, so I changed it to the current version.  :P
    if (this.hasstatus === true) {
        //sprite
        ctx.drawImage(Resources.get(this.sprites.status),
            //clipping area inside image X
            0,
            //clipping area inside image Y
            0,
            //size of clipped image width
            origWidth,
            //size of clipped image height
            this.size.origheight,
            //where to draw the actual image X
            drawx - ((width - origWidth)/2),
            //where to draw the actual image Y
            drawy + ((height - depth - origHeight)/1.2) +
            depth*origHeight/100 - this.z,
            //final render width
            width,
            //final render height
            height-((height/origHeight)*depth));
    }

    //if we are not rendering our clone, but we have a clone, rerun for clone
    if (this.clone.cloning && renderClone !== true) {
        this.render(true);
    }
};

/**
 * holds movement keypresses to process for the next player move if the delay
 * is currently not active
 * @return {none}
 */
Player.prototype.buffermove = function() {
    if(_.size(GLBL.curKeys) > 0 && this.bufferDelay === false){
        for (var i = 0; i < _.size(GLBL.curKeys); i++) {
            this.handleInput(GLBL.allowedKeys[GLBL.curKeys[i]]);
        }
    }
};

/**
 * function to ensure player landing resets correct scale and plays a sound
 * @return {none}
 */
Player.prototype.landing = function() {
    //reset to our original scale
    this.z = this.z2;
    if (this.z === 0){
        //turn of jump direction indications
        this.directionjump = 'none';
        //make sure we only play a sound if we aren't in water
        //if we are in water, checkSplash will play a sound already
        if (this.depth === 0){
            createjs.Sound.play(_.sample(this.sounds.lands));
        }
    }
};

/**
 * function to finalize movement.  Taking the last step basically
 * needs it's own function because of screen crossing and to play sound
 * @param  {string} axis tells it if this is an up/down step or left/right step
 * @return {none}
 */
Player.prototype.step = function(axis) {
    //x means left/rigth step
    if (axis == "x") {
        //we are teleporting, probably form screen crossing
        //do that and reset some things
        if (this.teleport.telX) {
            this.teleport.telX = false;
            this.x = this.teleport.x;
            this.x2 = this.x;
            this.clone.xoff = 0;
        }
        //we arent releporting so just finish the step
        else{
            this.x = this.x2;
        }
    }
    //assume it is y since we checked for x already, so left/right movement
    else {
        //we are teleporting, probably form screen crossing
        //do that and reset some things
        if (this.teleport.telY) {
            this.teleport.telY = false;
            this.y = this.teleport.y;
            this.y2 = this.y;
            this.clone.yoff = 0;
        }
        //we arent releporting so just finish the step
        else{
            this.y = this.y2;
        }
    }
    //if we aren't in water or in the air play a step sound to indicate
    //that we finished a movement in one direction
    if (this.depth === 0 && this.z === 0){
        createjs.Sound.play(_.sample(this.sounds.steps));
    }
};

/**
 * handle actual movement of the player.  Helper for update function.
 * @param  {number} dt is a time measurement from our engine
 * @return {none}
 */
Player.prototype.movement = function(dt) {
    //z2 = height of jump we are aiming for
    //double check no one is trying to go underground
    //and if so, move them to ground level.  Only impacts animation
    if (this.z2 < 0) {this.z2 = 0;}
    if (this.z < 0) {this.z = 0;}
    //actual jump movement
    //we are going up, so do that based on jump speed and our time measurement
    if (this.z2 > this.z && this.directionjump == 'up') {
        if ((this.speedjump * dt) <= (this.z2 - this.z)) {
            this.z += (this.speedjump * dt);
        }
        else {
            //finish this jump up if we are close enough
            this.z = this.z2;
        }
    }
    //we are going down, so do it based on jump speed and our time measurement
    else if (this.z > this.z2 && this.directionjump == 'down') {
        if ((this.speedjump * dt) <= (this.z - this.z2)) {
            this.z -= (this.speedjump * dt);
        }
        else {
            //finish this jump landing if we are close enough
            this.landing();
        }
    }
    else {
        //catch all, put us where we want to be
        this.z = this.z2;
    }

    //TODO: finish shortening this crud!

    //figure out scale of player during jump
    //we are going up, so do it based on jump speed and our time measurement
    if ((this.size.height2 > this.size.height) && (this.directionjump == 'up')) {
        if (((this.size.height2 - this.size.height) * dt * 0.016) <= (this.size.height2 - this.size.height)) {
            this.size.height += ((this.size.height2 - this.size.height) * dt * this.speedjump * 0.016);
            this.size.width += ((this.size.width2 - this.size.width) * dt * this.speedjump * 0.016);
        }
        else {
            this.size.height = this.size.origheight;
            this.size.width = this.size.origwidth;
        }
    }
    // we are going down, so do it based on jump speed and our time measurement
    else if ((this.size.height2 < this.size.height) && (this.directionjump == 'down')) {
        if (this.size.height < this.size.origheight || this.size.width < this.size.origwidth) {
            // reset to our original scale
            this.size.height = this.size.origheight;
            this.size.width = this.size.origwidth;
        }
        else if (((this.size.height - this.size.height2) * dt * 0.016) <= (this.size.height - this.size.height2)) {
            this.size.height -= ((this.size.height - this.size.height2) * dt * this.speedjump * 0.016);
            this.size.width -= ((this.size.width - this.size.width2) * dt * this.speedjump * 0.016);
        }
        else {
            this.size.height = this.size.origheight;
            this.size.width = this.size.origwidth;
        }
    }
    else {
        this.size.height = this.size.origheight;
        this.size.width = this.size.origwidth;
    }
    // left to right movement
    if (this.x2 > this.x && this.direction != 'left') {
        if ((this.speed * dt) <= (this.x2 - this.x)) {
            this.x += (this.speed * dt);
        }
        else {
            // finish our left/right movement if we are close enough
            this.step("x");
        }
    }
    else if (this.x2 < this.x && this.direction != 'right') {
        if ((this.speed * dt) <= (this.x - this.x2)) {
            this.x -= (this.speed * dt);
        }
        else {
            // finish our left/right movement if we are close enough
            this.step("x");
        }
    }
    else {
        // catch all, put us where we wanted to by on X
        this.x = this.x2;
    }
    // up and down movement
    if (this.y2 > this.y && this.direction != 'up') {
        if ((this.speed * dt) <= (this.y2 - this.y)) {
            this.y += (this.speed * dt);
        }
        else {
            // finish our up.down movement if we are close enough
            this.step("y");
        }
        // we want up and down to be dominant draw directions
        // so overwrite left/right if we find we are moving on y
        this.directiondraw = 'down' ;
    }
    else if (this.y2 < this.y - 10 && this.direction != 'down') {
        if ((this.speed * dt) <= (this.y - this.y2)) {
            this.y -= (this.speed * dt);
        }
        else {
            // finish our up.down movement if we are close enough
            this.step("y");
        }
        // we want up and down to be dominant draw directions
        // so overwrite left/right if we find we are moving on y
        this.directiondraw = 'up' ;
        //console.log (this.y);
    }
    else {
        // catch all, put us where we wanted to be on Y
        this.y = this.y2;
    }
};

/**
 * function to set up our next move and then delay so we can only buffer
 * another move after a short delay. also throttled to prevent crazy fast
 * checking if delay is not used somewhere
 * @return {none}
 */
Player.prototype.move = function() {
    // only try to move if we have a destination on at least one axis
    if (this.x !== this.x2 || this.y != this.y2){
        // prevent moves from immediately being buffered for the next
        // turn to avoid accidental double moves
        this.bufferDelay = true;
        // change sprite as needed
        this.sprites.current = this.sprites[this.directiondraw];
        this.sprites.currentjump = this.sprites[this.directiondraw + "jump"];

        // allow a move to be buffered again after a set time
        // TODO: rework the delay variables now that move() is not throttled
        _.delay(function(){player.bufferDelay = false;},GLBL.moveDelay/2);
    }
};

/**
 * function to handle all input keys, except for pauses.
 * @param  {string} key is an identifier of the key pressed from our allowedKeys array
 * @return {none}
 */
Player.prototype.handleInput = function(key) {
    //  note, pauses presses are handled in the listener and never make it here
    switch (key){
    case 'left':
        if (this.x === this.x2) {
            this.direction = 'left' ;
            // we want up and down to be dominant draw directions
            // so don't change unless we aren't moving up or down
            if (this.y === this.y2){this.directiondraw = 'left';}
            // if we hit left side of screen, take a step then teleport to
            // right side use a clone to make this a smooth transition
            if (this.x === 0) {
                this.teleport.telX = true;
                this.teleport.x = 101 * (GLBL.cols - 1);
                this.clone.xoff = 101 * (GLBL.cols);
            }
            // set the x location of our next step
            this.x2 = this.x - 101;
        }
        break;
    case 'right':
        if (this.x === this.x2) {
            this.direction = 'right';
            // we want up and down to be dominant draw directions
            // so don't change unless we aren't moving up or down
            if (this.y === this.y2){this.directiondraw = 'right';}
            // if we hit right side of screen, take a step then teleport to
            // left side use a clone to make this a smooth transition
            if (this.x === ((GLBL.cols -1) * GLBL.colWidth)) {
                this.teleport.telX = true;
                this.teleport.x = 0;
                this.clone.xoff = -101 * (GLBL.cols);
            }
            //set the x location of our next step
            this.x2 = this.x + 101;
        }
        break;
    case 'up':
        if (this.y === this.y2) {
            this.direction = 'up';
            this.directiondraw = 'up';
            // player can't move past top row like it can on the sides
            if (this.y >= 0) { this.y2 = this.y - 83;}
        }
        break;
    case 'down':
        if (this.y === this.y2) {
            this.direction = 'down';
            this.directiondraw = 'down';
            // player can't move past bottom row like it can on the sides
            if (this.y <= 83 * (GLBL.rows - 2)) { this.y2 = this.y + 83;}
        }
        break;
    case 'jump':
        this.jump();
        break;
    case 'attack':
        this.attack();
        break;
    default :
        break;
    }
};