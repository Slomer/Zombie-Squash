/**
 * This file holds the enemy class and almot all related functions and variable
 * some shared objects may be in misc.js and some settings are in globals.js
 */

/**
 * main class for the enemies our player must avoid or kill
 */
var Enemy = function() {
    this.spawnRow = _.random(1,GLBL.rows);
    this.spawnSide = _.random(0,1); //0 is left side, 1 is right side
    //this object holds the enemy visual sprites
    this.sprites = {
        //randomly grab 1 body from allBodies
        body : _.sample(allBodies),
        //randomly grab 1 zombie makeup set from allMakeups
        makeup : _.sample(allMakeups),

        //currently unused while sprites are built for other directions)
        //left here for easy copy pasting when this is complete
        // catgirl : 'images/char-cat-girl-down.png',
        // horngirl : 'images/char-horn-girl.png',
        // pinkgirl : 'images/char-pink-girl.png',
        // princessgirl : 'images/char-princess-girl.png',
    };
    //object to hold current sounds for the enemies
    //currently they all use the same sound set
    this.sounds = {
        pains : {
            squish1 : 'sounds/enemy-squish1.mp3',
            squish2 : 'sounds/enemy-squish2.mp3',
            squish3 : 'sounds/enemy-squish3.mp3',
            squish4 : 'sounds/enemy-squish4.mp3',
        },
        eating : {
            eating1 : 'sounds/enemy-eating.mp3',
        },
        splashes : {
            splash1 : 'sounds/char-splash1.mp3'
        },
        steps : {
            //step1 : 'sounds/char-step2.mp3',
            step2 : 'sounds/char-step1.mp3'
        },

    };

    //what direction is the enmy currently facing?
    this.direction = 'down';

    //current enemy location.  Defaults to random row off sides of canvas
    this.x = (101 * GLBL.cols * this.spawnSide) + (this.spawnSide * 202) - 101;
    this.y = 83 * ((this.spawnRow - 1.5));
    //enemy destination
    this.x2 = this.x;
    this.y2 = this.y;
    //should the enemy chase the player or wander around aimlessly?
    //random based on a global setting change
    this.wander = (_.random(1,100) < GLBL.wanderChance ? true : false);
    //how fast is this enemy?
    this.speed = _.random(5,15) * GLBL.difficulty; //how fast do we move
    //enemy size information
    //hardcoding instead of grabbing fomr the sprite for flexibility
    this.size = {
        //the original size, which should match the sprite size
        origwidth : 101,
        origheight : 171,
        //current dimensions we will render with
        width : 101,
        height : 171,
        //size destination/target for animations
        width2 : 101,
        height2 : 171,
        //will be used in collision to offset x/y checks.
        //Everything should be 1 until larger enemies are added.
        collratio : 1
    };
    //object holds variable used for collisions and possibly other items
    //that aim at visual center of enemy and not actual sprite center
    this.center = {
        xoff : this.size.width / 2,
        yoff : this.size.height / 2
    };
    //start with true so enemies can never splash on spawning accidentally
    this.swimming = true;
    //start with false so we don't have it running at the player if unused
    this.active = false;
    //maybe undead instead of alive? lol.  It should not be dead until it is killed
    //this will be a sort of inactive state for activated enemies, once their death
    //event supports it.  Need to make a 'dead' sprite first.
    this.alive = true;
};

/**
 * cause damage to enemies, currently all enemies die in one hit
 * will play a sound, remove the enemy visually, and reset items of the enemy
 * @param  {number} dt is the time measurement from our engine
 * @return {none}
 */
Enemy.prototype.hurt = function(dt) {
    //TODO: make a reset function to seperate this out now that it is so long
    //a reset function will be needed for when a decent game reset is added
    createGore.call(this,this.x,this.y,false,true);
    createjs.Sound.play(_.sample(this.sounds.pains));
    this.sprites.body = _.sample(allBodies);
    this.sprites.makeup = _.sample(allMakeups);
    this.wander = (_.random(1,100) < GLBL.wanderChance ? true : false);
    this.spawnRow = _.random(1, GLBL.rows);
    //0 is left side, 1 is right side
    this.spawnSide = _.random(0,1);
    this.x = (101 * GLBL.cols * this.spawnSide) + (this.spawnSide * 202) - 101;
    this.y = 83 * ((this.spawnRow - 1.5));
    this.x2 = this.x;
    this.y2 = this.y;
    this.speed = _.random(5, 15) * GLBL.difficulty; //how fast do we move
    this.swimming = true;
    //track the kill in our player object
    player.kills += 1;
    player.killsThisLevel += 1;
    //if we have enough kills, up the difficulty
    if (player.killsThisLevel >= Math.pow(GLBL.difficulty,2)) {
        GLBL.difficulty += 1;
        player.killsThisLevel = 0;
        //we want 1 new enemy active enemy added per difficulty level
        //TODO: make this adjustable via global instead of static one per level
        createEnemy();
    }

};

/**
 * update function for our enemies, which currently only calls
 * movement after checking if active but should be used for moe
 * @param  {number} dt is a time measurement from our engine
 * @return {none}
 */
Enemy.prototype.update = function(dt) {
    //end early if we somehow called this on an inactive enemy
    if (this.active !== true) {return;}
    this.movement(dt);
};

/**
 * actual movement for our enemies
 * @param  {number} dt is a time measurement frmo our engine
 * @return {none}
 */
Enemy.prototype.movement = function(dt) {
    //find new destination only if we have arrived on an axis destination
    //this is to constrian movement to the block grid, the same as the player
    //use player as target if this is not a wandering zombie
    //use random nearby square on screen if it is a wondering zombie
    if (this.wander === false){
        if (this.x === this.x2) {
            if (this.x < player.x) {
                this.x2 = this.x + 101;
            }
            else if (this.x > player.x) {
                this.x2 = this.x - 101;
            }
        }
        if (this.y === this.y2) {
            if (this.y < player.y) {
                this.y2 = this.y + 83;
            }
            else if (this.y > player.y) {
                this.y2 = this.y - 83;
            }
        }
    }
    //random target destination
    else {
        if (this.x === this.x2) {
            if (this.x < (GLBL.colWidth * (GLBL.cols - 1)) && this.x > 0) {
                //multiply by -1 or 1 randomly to move around left or right
                this.x2 = this.x + 101 * (_.random(1) < 0.5 ? -1 : 1);
            }
            else if (this.x > 0) {
                this.x2 = this.x - 101;
            }
            else if (this.x < (GLBL.colWidth * (GLBL.cols - 1))) {
                this.x2 = this.x + 101;
            }
        }
        if (this.y === this.y2) {
            if (this.y > 0 && this.y < GLBL.rowHeight * (GLBL.rows - 2)) {
                this.y2 = this.y + 83 * (_.random(1) < 0.5 ? -1 : 1);
            }
            else if (this.y > 0) {
                this.y2 = this.y - 83;
            }
            else if (this.y < GLBL.rowHeight * (GLBL.rows - 2)) {
                this.y2 = this.y + 83;
            }
        }
    }
    //handle our actual movement now that we hav a destination
    //up/down is the animation priority so it gets the first check
    //to avoid flashing side sprites a lot
    //also redunadntly check if we are at our axis destination first
    if (this.y !== this.y2) {
        if (this.y < this.y2) {
            if ((this.y2 - this.y) > (this.speed * dt)) {
                this.y += this.speed * dt;
            }
            else {
                this.y = this.y2;
            }
        }
        else {
            if ((this.y2 - this.y) < (this.speed * dt)) {
                this.y -= this.speed * dt;
            }
            else {
                this.y = this.y2;
            }
        }
    }
    //left/right movement
    if (this.x !== this.x2) {
        if (this.x < this.x2) {
            if ((this.x2 - this.x) > (this.speed * dt)) {
                this.x += this.speed * dt;
            }
            else {
                this.x = this.x2;
            }
        }
        else {
            if ((this.x2 - this.x) < (this.speed * dt)) {
                this.x -= this.speed * dt;
            }
            else {
                this.x = this.x2;
            }
        }
    }

    //figure out what direction we should be facing based on movement
    //only change if the destination is a non negligible distance
    //to smooth animation and make it look like they turn around
    if ((this.y2 < this.y) && (this.y - this.y2 > 10)) {
        this.direction = 'up';
    }
    else if ((this.y2 > this.y) && (this.y2 - this.y > 10)) {
        this.direction = 'down';
    }
    else if ((this.x2 < this.x) && (this.x - this.x2 > 10)) {
        this.direction = 'left';
    }
    else if ((this.x2 > this.x) && (this.x2 - this.x > 10)) {
        this.direction = 'right';
    }
};

/**
 * constructs an active enemy.  Doing this here allows for recycling
 * any inactive enemies before actually creating a new instance
 * @return {none}
 */
function createEnemy(){
    //look for any available inactive Enemy
    var thisEnemy = _.find(allEnemies,function(enemy){return enemy.active !== true;});
    //if we didn't find any, make a new one (with a cap for sanity sake)
    if (thisEnemy === null && allEnemies.length < GLBL.maxEnemies) {
        allEnemies.push(thisEnemy = new Enemy);
    }
    //now activate our enemy.  It should only be null above our cap, but check it first.
    if (thisEnemy !== null){
        thisEnemy.active = true;
    }
}


/**
 * check current depth of the Enemy to see if they are in water
 * @return {depth as a number}
 */
Enemy.prototype.getdepth = function(){
    return getDepth(this.x + (GLBL.colWidth/2),this.y + GLBL.rowHeight);
};

/**
 * function to see if this enemy should make a splash, then trying to do so
 * @return {none}
 */
Enemy.prototype.checksplash = function() {
    if(this.swimming !== true){
        //use our first available splash and make it start here
        createSplash.call(this,this.x,this.y);
    }
};

/**
 * renders our enemy on the screen
 * @param  {number} dt is a time measurement fomr our engine
 * @return {none}
 */
Enemy.prototype.render = function(dt) {
    //depth is for when we are on water square
    //could be expanded for small hills or holes as well
    this.depth = this.getdepth();
    var depth = this.depth; //just to help shorten the string below
    var drawx = this.x;
    var drawy = this.y;
    var spriteToDraw = Resources.get(this.sprites.body[this.direction]);
    var spriteMakeupToDraw = Resources.get(this.sprites.makeup[this.direction]);

    //zombies can't jump so no need to check for z, just depth
    if (depth === 0){
        //we aren't in water, so reset our swimming so we can splash again
        this.swimming = false;
        //shadow code goes here if we add shadows to enemies
    }
    else {
        //we are not at ground level, so see if we need to render a splash
        this.checksplash();
        if (this.swimming !== true) {this.swimming = true;}
        //shadow code goes here if we add shadows to enemies
    }

    //draw our enemy body
    ctx.drawImage(spriteToDraw,
        0,0,
        this.size.origwidth,this.size.origheight-depth,
        //probably don't need the size x offset here but leaving it in
        //case I add enemy scaling
        drawx - ((this.size.width - this.size.origwidth)/2),
        drawy + ((this.size.height-depth - this.size.origheight)/1.2) + depth,
        this.size.width,
        this.size.height-((this.size.height/this.size.origheight)*depth));

    //draw our enemy zombie makeup
    ctx.drawImage(spriteMakeupToDraw,
        0,0,
        this.size.origwidth,this.size.origheight-depth,
        //probably don't need the size x offset here but leaving it in case
        //I add enemy scaling
        drawx - ((this.size.width - this.size.origwidth)/2),
        drawy + ((this.size.height-depth - this.size.origheight)/1.2) + depth,
        this.size.width,
        this.size.height-((this.size.height/this.size.origheight)*depth));
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