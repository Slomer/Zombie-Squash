/**
 * this object holds templates of tile sets we can sample from when generating
 * our level.
 * @type {Object}
 */
var allLevelTiles = {
    //this is the original tiles set
    clean : [
        //tiles
        {
            type: 'stone',
            sprite:'images/stone-block1a.png',
        },
        {
            type: 'water',
            sprite : 'images/water-block1.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1a.png',
        },
    ],
    //a messy version of the original tile set
    //not super fond of it, but it shows this works
    //for multiple tiles of the same type correctly
    messy : [
        //tiles
        {
            type: 'stone',
            sprite:'images/stone-block1a.png',
        },
        {
            type: 'stone',
            sprite:'images/stone-block1b.png',
        },
        {
            type: 'stone',
            sprite:'images/stone-block1c.png',
        },
        {
            type: 'stone',
            sprite:'images/stone-block1d.png',
        },
        {
            type: 'water',
            sprite : 'images/water-block1.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1a.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1b.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1c.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1d.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1e.png',
        },
    ],
    //original tile set but more of a dark night time look
    darkclean : [
        //tiles
        {
            type: 'stone',
            sprite:'images/stone-block2.png',
        },
        {
            type: 'water',
            sprite : 'images/water-block2.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block2.png',
        },
    ],
    //al the tiles together.. just because
    uglymessy : [
        //tiles
        {
            type: 'stone',
            sprite:'images/stone-block1a.png',
        },
        {
            type: 'stone',
            sprite:'images/stone-block1b.png',
        },
        {
            type: 'stone',
            sprite:'images/stone-block1c.png',
        },
        {
            type: 'stone',
            sprite:'images/stone-block1d.png',
        },
        {
            type: 'stone',
            sprite:'images/stone-block2.png',
        },
        {
            type: 'water',
            sprite : 'images/water-block1.png',
        },
        {
            type: 'water',
            sprite : 'images/water-block2.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1a.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1b.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1c.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1d.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block1e.png',
        },
        {
            type : 'grass',
            sprite : 'images/grass-block2.png',
        },

    ],
};

/**
 * This is the class for our game level.  Procedurally generates a level with
 * some really rough logic and check to ensure it isn't a bunch of random
 * individual squares
 */
var Level = function() {

    //grab a random tile set
    this.tiles = _.sample(allLevelTiles);

    //check how many squares to generate and fill
    this.totalSquares = GLBL.rows * GLBL.cols;

    //how many tiles of each type will we try to allow
    this.typeMax = {
        stone : Math.floor(this.totalSquares * 0.4), //36 on a 9x10 board
        water : Math.floor(this.totalSquares * 0.3), //27 on a 9x10 board
        grass : Math.floor(this.totalSquares * 0.4), //36 on a 9x10 board
    };

    //how many non contiguous groups of each type will we try to allow
    //this is a bit misleading because we want contiguous sections
    //but not necessarilly of this type.  Just when checking this type
    this.groupMax = {
        stone : Math.ceil(this.totalSquares / 30), //should be 1 to 3 normally
        water : Math.ceil(this.totalSquares / 25), //should be 1 to 3 normally
        grass : Math.ceil(this.totalSquares / 25), //should be 2 to 6 normally
    };

    //counters for how many tiles of a type we have already generated
    this.typeCount = {
        stone : 0,
        water : 0,
        grass : 0,
    };

    //counters for how many groups we have generated while checking this type
    this.groupCount = {
        stone : 0,
        water : 0,
        grass : 0,
    };

    this.tiles = _.sample(allLevelTiles);
    //disposable square holder and boolean for our loop
    var currentSquare;
    var haveASquare = false;
    //once this hits 1000 we give up and add whatever the thing wants
    //after 2000 we give up altogether rather than looping forever
    var safeCounter = 0;
    var contiguousCounter = 0;
    //procedurally build our board
    for (var squareCounter2 = 0; squareCounter2 < 
        this.totalSquares; squareCounter2++) {
            
            haveASquare = false; //start with false and loop until true

            while (haveASquare !== true && safeCounter < 2000) {
                safeCounter += 1;
                currentSquare = _.sample(this.tiles);

            //make sure we aren't maxed on this type already. If we are,
            //try for another
            while ((this.typeCount[currentSquare.type] >
                this.typeMax[currentSquare.type] ||
                this.groupCount[currentSquare.type]) > 
                this.groupMax[currentSquare.type] &&
                safeCounter < 1000) {
                    safeCounter += 1;
                    currentSquare = _.sample(this.tiles);
            }

            //require that we have at least 3 contiguous squares at a time
            if (checkContiguous.call(this, squareCounter2, 
                currentSquare.type) === true) {

                contiguousCounter += 1;
                GLBL.squares.push(currentSquare);
                this.typeCount[currentSquare.type] += 1;
                haveASquare = true;
            }

            else if (contiguousCounter < 3 && squareCounter2 > 0){
                //loop until we find a square that is contiguos
                while (checkContiguous.call(this, squareCounter2,
                    currentSquare.type) !== true && safeCounter < 1000) {
                    
                    safeCounter += 1;
                    currentSquare = _.sample(this.tiles);
                }

                contiguousCounter += 1;
                GLBL.squares.push(currentSquare);
                this.typeCount[currentSquare.type] += 1;
                haveASquare = true;
            }
            //}
            if (haveASquare !== true && this.groupCount[currentSquare.type] <
                this.groupMax[currentSquare.type]) {
                
                contiguousCounter = 0;
                GLBL.squares.push(currentSquare);
                this.groupCount[currentSquare.type] += 1;
                this.typeCount[currentSquare.type] += 1;
                haveASquare = true;
            }

            //we should never get here, but if we do, just give up and use
            //whatever we get and learn to appreciate what we have :)
            if (haveASquare !== true){
                GLBL.squares.push(currentSquare);
                this.groupCount[currentSquare.type] += 1;
                this.typeCount[currentSquare.type] += 1;
                haveASquare = true;
            }
         }
    }
};


/**
 * This renders our level on screen
 */
Level.prototype.render = function() {

    //keep track of our current square as we itterate through them all
    //not doing this in the loop so we can instead use the loop to move coords
    var squareCounter = 0;
    for (row = 0; row < GLBL.rows; row++) {
        for (col = 0; col < GLBL.cols; col++) {
            ctx.drawImage(Resources.get(GLBL.squares[squareCounter].sprite),
                col * GLBL.colWidth, row * GLBL.rowHeight);
            squareCounter++;
        }
    }
};

/**
 * checks to see if any other squares of this type are in the neighborhood
 * of this square.  The intention is to prevent completely random looking
 * levels and hopefully have chunks of similar tiles near eachother most of
 * the time
 * @param  {number} squareCount is the current number of squares generated
 * @param  {string} type is a string such as water or grass representing a tile
 * @return {boolean} returns true if we have a similar neighbor
 */
function checkContiguous(squareCount, type) {
    //note, this only works correctly during level setup because it does not
    //check neighbors that would not be drawn yet.

    //get row by dividing our count by rows on this board
    var thisRow = Math.floor(squareCount / GLBL.cols) + 1;
    //get our remainder with modulus, which will be our column num
    var thisCol = ((squareCount) % GLBL.cols) + 1;

    //check our neighbors but skip ones we know will be undefined
    //since we are drawing from left to right and top to bottom

    //we are not in the first row so we have multiple things to check
    if (thisRow > 1) {
        //not in first row or column so check up+left
        if (thisCol > 1 && checkSquareType.call(this, thisRow - 1,
            thisCol - 1) === type) {return true;}

        //now check up
        else if (checkSquareType.call(this, thisRow - 1, thisCol) == type){
            return true;}

        //now check up+right, assumign we are not in the last column
        else if (thisCol < GLBL.cols && checkSquareType.call(
            this, thisRow, thisCol + 1) == type) {return true;}
    }

    //if we are not in the first column, check the square left of us
    if (thisCol > 1 && checkSquareType(thisRow, thisCol - 1) == type) {
        return true;}

    //if we made it here, we are not contiguous or are on the first square,
    //so return false
    return false;
}