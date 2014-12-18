/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

 var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    //resize our canvas to something we can use.  Add 1.5 rows to leave room
    //for UI elements
    canvas.width = GLBL.colWidth * GLBL.cols;
    canvas.height = GLBL.rowHeight * (GLBL.rows+1.5);
    //add an event listener for canvas click.  Currently only used for
    //pausing the game with pause icon
    canvas.addEventListener('click',
        function(evt){getCursorPosition(canvas,evt,true);}, false);
    //give our canvas an id.  Allows us to check it's bounding box again
    //later without storing the actual canvas in global scope
    //in retrospect probably would have been better to just make canvas
    //available in global scope
    canvas.setAttribute("id", "gameCanvas");
    //add the canvas to our DOM
    doc.body.appendChild(canvas);

    /**
     * This finds the in game coordinates of our mouse click
     * and if they match our pause button, pauses the game
     * @param  {dom element} The canvas we clicked
     * @param  {event} event is the actual click event
     * @param  {boolean} is this a click?  Not sure if this is needed
     * @return {none}
     */
    function getCursorPosition(canvas, event, click) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        //check if we clicked the pause button and if so, pause the game
        if (click){
            if(checkClicked(canvas,x,y)){
                GLBL.paused = !GLBL.paused;
            }
            else {
                //make sure we are not paused after a click elsewhere
                GLBL.paused = false;
            }
        }
        //make sure our instructions are not showing after a click

        if (click){
            toggleInstructions(false);
        }
    }

    /**
     * this function is a helper for getCursorPosition that does the actual
     * check to see if we are inside of the pause button
     * @param  {dom element} The canvas we clicked
     * @param  {number} x coordinate in game canvas of click
     * @param  {number} y coordinate in game canvas of click
     * @return {boolean} true only if click is inside game pause button
     */
    function checkClicked(canvas, x, y){
        //check if we paused
        var rect = canvas.getBoundingClientRect();
        var buttonRad = (GLBL.rowHeight/3);
        var pauseX = canvas.width - (GLBL.colWidth/2);
        var pauseY = (GLBL.rowHeight/3) - rect.top;
        var disX = x-pauseX;
        var disY = y-pauseY;
        //return true if click is inside of game button radius
        return Math.pow(disX,2)+Math.pow(disY, 2) <= Math.pow(buttonRad,2);
    }

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        if (GLBL.paused !== true && GLBL.soundReady === true &&
            GLBL.inFocus === true) {

            //if we just unpaused or gained focus, reset our dt and hide
            //instructions
            if (GLBL.waspaused === true || GLBL.lostFocus === true) {
                lastTime = _.now();
                GLBL.waspaused = false;
                GLBL.lostFocus = false;
                toggleInstructions(false);
            }
            var now = _.now();
                dt = (_.now() - lastTime) / 1000.0;

            /* Call our update/render functions, pass along the time delta to
             * our update function since it may be used for smooth animation.
             */
            update(dt);
            render(dt);

            /* Set our lastTime variable which is used to determine the time
             * delta for the next time this function is called.
             */
            lastTime = _.now();

        }
        else if (GLBL.waspaused !== true && GLBL.paused === true){
            //set our waspaused so that when we unpause we know it happened
            //also go ahead and tell our pause button to look different
            //show instructions while we are at it
            GLBL.waspaused = true;
            renderUI(true);
            toggleInstructions(true);
        }
        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        //set our ratio adjust for use with collision detection offsets
        //console.log("init");
        //and possibly movement speed offsets if I feel like taking the time
        GLBL.ratioAdjust = GLBL.colWidth / GLBL.rowHeight;
        reset();
        lastTime = _.now();
        initUI();

        main();
    }
    /**
     * this function fires when sounds are ready and let's our game know via
     * a boolean in our GLBL object.
     * @return {none}
     */
    function soundInit() {
        GLBL.soundReady = true;
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allSplashes.forEach(function(splash) {
            splash.update(dt);
        });

        allGores.forEach(function(gore) {
            gore.update(dt);
        });

        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render(dt) {
        //fill the canvas with white to erase it before we draw rows
        //this will avoid ghosts when player clips off screen top during a jump
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //render our level
        level.render();
        //render player, enemies, and effects
        renderEntities(dt);
        //render UI elements
        renderUI();
    }

    /**
     * this sets some initial UI styles that we want to avoid repeating
     * @return {none}
     */
    function initUI(){
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.font = '40px Impact';
    }

    /**
     * renders our actual UI elements
     * @param  {boolean} if we are paused we will change the pause button
     * @return {none}
     */
    function renderUI(paused){

        //draw the pause button in the middle of the last column
        //above the playarea
        if (paused !== true){
            ctx.drawImage(Resources.get('images/ui-pause1.png'),
                canvas.width - (GLBL.spriteWidth / 4) - (GLBL.colWidth/2),
                -GLBL.spriteHeight / 8,
                GLBL.spriteWidth / 2,
                GLBL.spriteHeight / 2);
        }
        else {
            ctx.drawImage(Resources.get('images/ui-pause2.png'),
                canvas.width - (GLBL.spriteWidth / 4) - (GLBL.colWidth/2),
                -GLBL.spriteHeight / 8,
                GLBL.spriteWidth / 2,
                GLBL.spriteHeight / 2);
        }

        //draw the kill icon in the middle of the first column
        //above the playarea
        ctx.drawImage(Resources.get('images/ui-kill.png'),
            (GLBL.colWidth/2) - (GLBL.spriteWidth / 4),
            -GLBL.spriteHeight / 8,
            GLBL.spriteWidth / 2,
            GLBL.spriteHeight / 2);

        //draw our heart icons below the play area, on the left, sized to
        //fit 2 per column
        var heartLoc = 0;

        for (var healthCount = 0;healthCount < player.health;healthCount++){
            ctx.drawImage(Resources.get('images/ui-heart1.png'),heartLoc,
                (GLBL.rows+0.5)*GLBL.rowHeight -10,50,85);
            heartLoc +=GLBL.colWidth/2;
        }
        for (healthCount = player.health;healthCount < 
            player.maxHealth;healthCount++){

            ctx.drawImage(Resources.get('images/ui-heart2.png'),heartLoc,
                (GLBL.rows+0.5)*GLBL.rowHeight -10,50,85);
            heartLoc +=GLBL.colWidth/2;
        }

        //draw our info text a little to the right of our kill icon
        uiText = player.kills + '  Level: ' + (GLBL.difficulty - 
            GLBL.difficultyStart + 1);

        ctx.fillText( uiText,
            (GLBL.colWidth) - (GLBL.spriteWidth / 8),
            40);
        ctx.strokeText( uiText,
            (GLBL.colWidth) - (GLBL.spriteWidth / 8),
            40);

        //draw a thin black border around the entire game area if that
        //setting is on in our GLBL object
        if (GLBL.frame === true){
            ctx.strokeRect(0,0,canvas.width,canvas.height);}
    }

    /* This function is called by the render function and is called on each
     * game tick. It's purpose is to then call the render functions you have
     * defined on your enemy and player entities within app.js
     */
    function renderEntities(dt) {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        //render the back of any splashes
        allSplashes.forEach(function(splash) {
            splash.render(dt,false);
        });
        //render the back of any gores
        allGores.forEach(function(gore) {
            gore.render(dt,false);
        });
        //sorting the list before rendering makes enemies in front render over
        //ones in backs plitting it into 2 render groups let's the player also
        //render over enemies behind him
        _.filter(_.sortBy(allEnemies,function(Enemy){return Enemy.y;}),
            function(Enemy){return Enemy.y <= player.y;}).
                forEach(function(enemy) {enemy.render(dt);
        });

        //render the front of any gores that are all the way behind the player
        _.filter(allGores, function(gore){return gore.y + 5 < player.y;}).
            forEach(function(gore) {gore.render(dt,true);});
        //render the front of any splashes that are all the way behind the player
        _.filter(allSplashes, function(splash){return splash.y + 5 < player.y;}).
            forEach(function(splash) {splash.render(dt,true);});
        //render the player
        player.render(dt);
        //render the front of any gores that are at or in front of the player
        _.filter(allGores, function(gore){return gore.y + 5 >= player.y;}).
            forEach(function(gore) {gore.render(dt,true);});
        //render the front of any splashes that are at or in front of player
        _.filter(allSplashes, function(splash){return splash.y + 5 >= player.y;
            }).forEach(function(splash) {splash.render(dt,true);});

        //render any enemies that are in front of the player
        _.filter(_.sortBy(allEnemies,function(Enemy){return Enemy.y;}),
            function(Enemy){return Enemy.y > player.y;}).
                forEach(function(enemy) {enemy.render(dt);
        });

    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        //TODO: add an actual reset and game over instead of just a pause
    }

    /**
     * check collission based on distance and where necessary hurt either
     * the player or the enemies
     * @param  {boolean} checkClone tells us to check a copy of the player
     * @return {none}
     */
    function checkCollisions(checkClone) {

        //get list of enemies close enough to squish
        //this should normally be a greater distance than
        //the player hurt distance because fair isn't as fun
        var squashList = _.filter(allEnemies, function(Enemy){
                return (absDis(player,Enemy,checkClone) < GLBL.squashDist);
            });

        //check for squished enemies
        //TODO: consider making player bounce when he lands on an enemy
        if (squashList.length > 0 && player.z !== 0) {
            if (player.z < 20 && player.directionjump == 'down') {
                _.each(squashList, function(Enemy){Enemy.hurt();});
            }
        }

        //get remaining enemies that player is close enough to collide with
        var adjcollDist = GLBL.collDist + GLBL.difficulty;
        var collList = _.filter(allEnemies, function(Enemy){
                return (absDis(player,Enemy,checkClone) < GLBL.collDist);
            });

        //check for player pain, no pain if jumping or crossing the screen
        if (collList.length > 0 && player.z === 0 && 
            player.clone.cloning !== true) {
                player.sprites.status = player.sprites.alert;
                player.hurt();
        }

        //if we are cloning, we need to check collisions on the clone as well
        //if clone is ever used for anything besides transitions this may need
        //to be refactored
        if (player.clone.cloning && checkClone !== true) {
            checkCollisions(true);
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    
    //load up our sound plugin and tell it to only use HTML5 audio
    createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
    //to enable web audio,uncomment this instead
    //createjs.Sound.registerPlugins([createjs.WebAudioPlugin,
    //    createjs.HTMLAudioPlugin]);

    createjs.Sound.alternateExtensions = ["mp3","wav"];

    //preload all sounds in a preloadJS queue.  Probably overkill
    //but I had intended to use it for images as well originally
    //and was tired of trying to shoehorn in my own sound solution
    var queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", soundInit);
    queue.loadManifest([
        {id:'sounds/char-jump.mp3', src:'sounds/char-jump.mp3'},
        {id:'sounds/char-land1.mp3', src:'sounds/char-land1.mp3'},
        {id:'sounds/char-land2.mp3', src:'sounds/char-land2.mp3'},
        {id:'sounds/char-step1.mp3', src:'sounds/char-step1.mp3'},
        //this mp3 shows corrupt in some browsers, so turning it off for now
        //{id:'sounds/char-step2.mp3', src:'sounds/char-step2.mp3'},
        {id:'sounds/char-splash1.mp3', src:'sounds/char-splash1.mp3'},
        {id:'sounds/char-upsplash1.mp3', src:'sounds/char-upsplash1.mp3'},
        {id:'sounds/char-pain1.mp3', src:'sounds/char-pain1.mp3'},
        {id:'sounds/enemy-squish1', src:'sounds/enemy-squish1.mp3'},
        {id:'sounds/enemy-squish2', src:'sounds/enemy-squish2.mp3'},
        {id:'sounds/enemy-squish3', src:'sounds/enemy-squish3.mp3'},
        {id:'sounds/enemy-squish4', src:'sounds/enemy-squish4.mp3'},
        {id:'sounds/enemy-eating.mp3', src:'sounds/enemy-eating.mp3'}
    ]);

    //preload up all of our images using the provided resources helper
    Resources.load([
        //tiles
        'images/stone-block1a.png',
        'images/stone-block1b.png',
        'images/stone-block1c.png',
        'images/stone-block1d.png',
        'images/water-block1.png',
        'images/grass-block1a.png',
        'images/grass-block1b.png',
        'images/grass-block1c.png',
        'images/grass-block1d.png',
        'images/grass-block1e.png',
        'images/stone-block2.png',
        'images/water-block2.png',
        'images/grass-block2.png',
        //player
        'images/char-boy-down.png',
        'images/char-boy-up.png',
        'images/char-boy-right.png',
        'images/char-boy-left.png',
        'images/char-alert.png',
        'images/char-shadow.png',
        'images/char-boy-down-jump.png',
        'images/char-boy-up-jump.png',
        'images/char-boy-right-jump.png',
        'images/char-boy-left-jump.png',
        //effects
        'images/splash-sheet-front.png',
        'images/splash-sheet-back.png',
        'images/gore-sheet-front1.png',
        'images/gore-sheet-front2.png',
        'images/gore-sheet-front3.png',
        'images/gore-sheet-back.png',
        //enemies
        'images/char-cat-girl-down.png',
        'images/char-cat-girl-up.png',
        'images/char-cat-girl-right.png',
        'images/char-cat-girl-left.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        //makeup
        'images/makeup-zombie1-down.png',
        'images/makeup-zombie1-up.png',
        'images/makeup-zombie1-left.png',
        'images/makeup-zombie1-right.png',
        'images/makeup-zombie2-down.png',
        'images/makeup-zombie2-up.png',
        'images/makeup-zombie2-left.png',
        'images/makeup-zombie2-right.png',
        //weapon slashes
        'images/weapon-slash-down.png',
        'images/weapon-slash-up.png',
        'images/weapon-slash-left.png',
        'images/weapon-slash-right.png',
        //UI
        'images/ui-pause1.png',
        'images/ui-pause2.png',
        'images/ui-kill.png',
        'images/ui-heart1.png',
        'images/ui-heart2.png',
     ]);

    //tell resources to call init when it is done working
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

//this call's itself and uses (this) to feed in the global scope
})(this);