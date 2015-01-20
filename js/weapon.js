/**
 * This file holds effect classes such as splash, and any misc functions,
 * helpers, or other items that didn't fit as well in the other files.
 */

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
var Weapon = function() {
    //visual sprites for our splashes
    //2 are used so that we can have a splash behind the player that does not
    //draw over them but is there if they move
    this.sprites = {
            up : 'images/weapon-knife-up.png',
            down : 'images/weapon-knife-down.png',
            left : 'images/weapon-knife-left.png',
            right : 'images/weapon-knife-right.png',
        };

    this.direction = 'down';

    this.thrown = false;
    //current coordinates, used for rendering
    this.x = 0;
    this.y = 0;
    //weapon destination
    this.x2 = this.x;
    this.y2 = this.y;

    this.size = {
        width : 101,
        height : 171,
        //will be used in collision to offset x/y checks.
        //Everything should be 1 until larger enemies are added.
        collratio : 1        
    };

    //speed of thrown weapon
    this.speed = 500;

    //object holds variable used for collisions and possibly other items
    //that aim at visual center of enemy and not actual sprite center
    this.center = {
        xoff : this.size.width / 2,
        yoff : this.size.height / 2
    };

};

/**
 * update function for our Weapon class that fires every animation frame
 * @param  {number} dt is the time measurement from our engine
 * @return {none}
 */
Weapon.prototype.update = function(dt) {
    //end early if we somehow called this on an inactive enemy
    if (this.thrown !== true) {return;}
    this.movement(dt);
};

/**
 * actual movement for our enemies
 * @param  {number} dt is a time measurement frmo our engine
 * @return {none}
 */
Weapon.prototype.movement = function(dt) {
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

    //disable thrown weapon if it reaches it's destination
    if (this.x === this.x2 && this.y === this.y2) {
        this.thrown = false;
    }
};


/**
 * render function for our Weapon class that fires every animation frame
 * @param  {number} dt is the time measurement from our engine
 * @param  {boolean} front is a boolean to switch between rendering front/vs back
 * @return {none}
 */
Weapon.prototype.render = function(dt) {
    var dsprite;
    dsprite = this.sprites[this.direction];

    if(this.thrown === true) {
        ctx.drawImage(
            Resources.get(dsprite), //sprite
            0, //clip start x
            0, //clip start y
            this.size.width, //clip width
            this.size.height, //clip height
            this.x, //drawing location x
            this.y, //drawing location y
            this.size.width, //final draw width
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
function createWeapon(x, y, direction){
    //look for any available existing splashes
    var thisWeapon = _.find(allWeapons,function(weapon){return weapon.thrown !== true;});
    //if we didn't find any, make a new one (with a cap for sanity sake)
    if (thisWeapon === undefined && allWeapons.length < GLBL.maxWeapons) {
        allWeapons.push(thisWeapon = new Weapon);
    }

    var destX = x;
    var destY = y;
    if (direction === 'up'){
        destY = -200;
    }
    else if (direction === 'down'){
        destY = GLBL.canvasRect.height + 200;
    }
    else if (direction === 'right'){
        destX = GLBL.canvasRect.width + 200;
    }
    else if (direction === 'left'){
        destX = -200;
    }
    //now activate our splash.  It should only be undefined above our cap, but check it first.
    if (thisWeapon !== undefined){
        thisWeapon.x2 = destX;
        thisWeapon.y2 = destY;
        thisWeapon.x = x;
        thisWeapon.y = y;
        thisWeapon.direction = direction
        thisWeapon.thrown = true;
        createWeaponSound.call(this);
    }
}

/**
 * helper function used by createSplash to play a sound when splashing
 * @param  {boolean} upSplash is a boolen to decide which sound to play
 * @return {none}
 */
function createWeaponSound() {
    //play our weapon sound
    //createjs.Sound.play(_.sample(this.sounds.splashes));
}