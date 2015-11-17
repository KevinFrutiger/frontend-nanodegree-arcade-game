/**
 * @fileoverview Generates the player and enemies, and keeps track of the
 *     level and other game state information.
 * @author unknown at Udacity
 * @author Kevin Frutiger <webmessage@frutigergroup.com>
 */


/* Enemy */

/**
 * Creates a new Enemy.
 * @constructor
 * @param {number} x The starting x location.
 * @param {number} y The starting y location.
 * @param {number} speed The starting speed (px/sec).
 */
var Enemy = function(x, y, speed) {

  /** The x location.
      @type {number} */
  this.x = x;

  /** The y location.
      @type {number} */
  this.y = y;

  /** The speed in px/sec.
      @type {number} */
  this.speed = speed;

  /** The URL to the sprite graphic.
      @type {string} */
  this.sprite = 'images/enemy-bug.png';
};

/**
 * Hit area rectangle for collisions. Relative to the x,y of the sprite.
 * [x, y, width, height]
 * @type {Array.<number>}
 */
Enemy.prototype.HIT_AREA_RECT = [1, 81, 99, 83];

/**
 * Updates the position.
 * @param {number} dt Time delta between browser animation frames.
 */
Enemy.prototype.update = function(dt) {
  this.x += this.speed * dt;

  if (this.isOffStage()) {
    // Reset x to one column to the left of the stage.
    this.x = -colWidth;
  }

  if (this.collidedWithPlayer()) {
    player.reset();
  }

};

/**
 * Draws the enemy on the canvas.
 */
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

  // for debugging
  if (showBoundaries) {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.x, this.y, assetWidth, assetHeight);
    ctx.strokeStyle = 'red';
    ctx.strokeRect(this.x + this.HIT_AREA_RECT[0],
                   this.y + this.HIT_AREA_RECT[1],
                   this.HIT_AREA_RECT[2],
                   this.HIT_AREA_RECT[3]);
  }
};

/**
 * Returns whether the enemy moved off the stage.
 * @returns {boolean} Whether the enemy is off the stage.
 */
Enemy.prototype.isOffStage = function() {
  return this.x >= canvasWidth;
};

/**
 * Returns whether the enemy's hit bounds interesect with the player's hit
 * bounds, as defined by their HIT_RECT_AREA property.
 * @returns {boolean} Whether this enemy and the player's hit areas intersect.
 */
Enemy.prototype.collidedWithPlayer = function() {
  var left = this.x + this.HIT_AREA_RECT[0];
  var right = this.x + this.HIT_AREA_RECT[2];
  var top = this.y + this.HIT_AREA_RECT[1];
  var bottom = this.y + this.HIT_AREA_RECT[3];
  var playerLeft = player.x + player.HIT_AREA_RECT[0];
  var playerRight = player.x + player.HIT_AREA_RECT[2];
  var playerTop = player.y + player.HIT_AREA_RECT[1];
  var playerBottom = player.y + player.HIT_AREA_RECT[3];

  return (right >= playerLeft && left <= playerRight) &&
         (top <= playerBottom && bottom >= playerTop);
};


/* Player */

/**
 * Creates a new Player.
 * @constructor
 * @param {number} x The start x location.
 * @param {number} y The start y location.
 */
var Player = function(x,y) {

  /** The x location.
      @type {number} */
  this.x = x;

  /** The y location.
      @type {number} */
  this.y = y;

  /** The starting x location. Used to reset.
      @type {number} */
  this.startX = x;

  /** The starting y location. Used to reset.
      @type {number} */
  this.startY = y;

  /** The x location the player is going to.
      @type {number} */
  this.goalX = x;

  /** The y location the player is going to.
      @type {number} */
  this.goalY = y;

  /** The URL for the sprite asset.
      @type {string} */
  this.sprite = 'images/char-boy.png';
};

/**
 * Hit area rectangle for collisions. Relative to the x,y of the sprite.
 * [x, y, width, height]
 * @type {Array.<number>}
 */
Player.prototype.HIT_AREA_RECT = [10, 81, 81, 83];

/**
 * Updates the location of the player.
 */
Player.prototype.update = function() {

  // Update x and y if the goal is valid (eg won't take player off stage).

  if (this.isValidGoalX()) {
    this.x = this.goalX;
  }

  if (this.isValidGoalY()) {
    this.y = this.goalY;
  }

  // Check if the player is on the water tile.
  if (this.isInTheWater()) {

    // Reset the player
    this.reset();

    // Increase the level of the game
    gameStateController.levelUp();
  }
};

/**
 * Draws the player on the canvas.
 */
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

  // for debugging
  if (showBoundaries) {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.x, this.y, assetWidth, assetHeight);
    ctx.strokeStyle = 'red';
    ctx.strokeRect(this.x + this.HIT_AREA_RECT[0],
                   this.y + this.HIT_AREA_RECT[1],
                   this.HIT_AREA_RECT[2],
                   this.HIT_AREA_RECT[3]);
  }
};

/**
 * Adjusts player properties according to keyboard input.
 * @param {string} key Plain-English value for the key pressed by the user.
 */
Player.prototype.handleInput = function(key) {

  // Calculate the goal x and y based on the direction.
  switch(key) {
    case 'left':
      this.goalX = this.x - colWidth;
      break;

    case 'up':
      this.goalY = this.y - rowHeight;
      break;

    case 'right':
      this.goalX = this.x + colWidth;
      break;

    case 'down':
      this.goalY = this.y + rowHeight;
      break;

    default:
      // do nothing
  }
};

/**
 * Resets the player position and goal vars.
 */
Player.prototype.reset = function() {
  // Reset location values to the start values.
  this.x = this.startX;
  this.y = this.startY;
  this.goalX = this.x;
  this.goalY = this.y;
};

/**
 * Returns whether goalX is a valid location for the player.
 * @returns {boolean} Whether goalX is valid.
 */
Player.prototype.isValidGoalX = function() {
  return this.goalX >= 0 && this.goalX < canvasWidth;
};

/**
 * Returns whether goalY is a valid location for the player.
 * @returns {boolean} Whether goalY is valid.
 */
Player.prototype.isValidGoalY = function() {
  return this.goalY >= characterVertOffset &&
         this.goalY < canvasHeight - assetHeight;
};

/**
 * Returns whether the player is on the water, the first row of the stage.
 * @returns {boolean} Whether player is on the water.
 */
Player.prototype.isInTheWater = function() {
  return this.y == characterVertOffset;
};


/*  Treat and Treat subclasses  */

/**
 * Creates a new Treat object. A treat is anything the player collects.
 * @constructor
 * @param {number} x The x location.
 * @param {number} y The y location.
 */
var Treat = function(x, y) {

  /** The x location.
      @type {number} */
  this.x = x;

  /** The y location.
      @type {number} */
  this.y = y;

  /** The URL for the graphic.
      @type {string} */
  this.sprite = 'images/gem-blue.png';
};

/**
 * Hit area rectangle for collisions. Relative to the x,y of the sprite.
 * [x, y, width, height]
 * @type {Array.<number>}
 */
Treat.prototype.HIT_AREA_RECT = [1, 81, 99, 83];

/**
 * Updates the treat.
 */
Treat.prototype.update = function() {
  if (this.collidedWithPlayer()) {
    gameStateController.collectTreat(this);
  }
};

/**
 * Draws the treat on the canvas.
 */
Treat.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

  // for debugging
  if (showBoundaries) {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.x, this.y, assetWidth, assetHeight);
    ctx.strokeStyle = 'red';
    ctx.strokeRect(this.x + this.HIT_AREA_RECT[0],
                   this.y + this.HIT_AREA_RECT[1],
                   this.HIT_AREA_RECT[2],
                   this.HIT_AREA_RECT[3]);
  }
};

/**
 * Returns whether the treat's hit bounds intersect with the player's hit
 * bounds, as defined by their HIT_RECT_AREA properties.
 * @returns {boolean} Whether this treat and the player's hit areas intersect.
 */
Treat.prototype.collidedWithPlayer = function() {
  var left = this.x + this.HIT_AREA_RECT[0];
  var right = this.x + this.HIT_AREA_RECT[2];
  var top = this.y + this.HIT_AREA_RECT[1];
  var bottom = this.y + this.HIT_AREA_RECT[3];
  var playerLeft = player.x + player.HIT_AREA_RECT[0];
  var playerRight = player.x + player.HIT_AREA_RECT[2];
  var playerTop = player.y + player.HIT_AREA_RECT[1];
  var playerBottom = player.y + player.HIT_AREA_RECT[3];

  return (right >= playerLeft && left <= playerRight) &&
         (top <= playerBottom && bottom >= playerTop);
};


/**
 * Creates a new Gem object.
 * @constructor
 * @extends Treat
 * @param {number} x The x location.
 * @param {number} y The y location.
 * @param {string} [color=blue] The color of the gem. This should match a
 *     suffix in a PNG in images/. ex. 'orange' for gem-orange.png.
 * @example
 * var gem = new Gem(10, 20, 'orange'); // Creates an orange gem.
 */
var Gem = function(x, y, color) {
  Treat.call(this, x, y);

  this.color = color || 'blue';

  this.sprite = 'images/gem-' + this.color + '.png';
};

Gem.prototype = Object.create(Treat.prototype);
Gem.prototype.constructor = Gem;

/**
 * Creates a new Heart object.
 * @constructor
 * @extends Treat
 * @param {number} x The x location.
 * @param {number} y The y location.
 */
var Heart = function(x, y) {
  Treat.call(this, x, y);

  this.sprite = 'images/heart.png';
};

Heart.prototype = Object.create(Treat.prototype);
Heart.prototype.constructor = Heart;


/* Game State Controller */

/**
 * Creates a new controller to store game state information
 * @constructor
 * @param {number} enemyCount The number of enemy to start the game
 * @param {number} maxSpeed The maximum speed at which the enemies should start.
 * @param {number} minSpeed The minimum speed at which the enemies should start.
 */
var GameStateController = function(enemyCount, maxSpeed, minSpeed) {

  /** The current level of the game.
      @type {number} */
  this.level = 1;

  /**
      */
  this.score = 0;

  /** The number of enemies currently on the board.
      @type {number} */
  this.enemyCount = enemyCount;

  /** The maximum speed for the enemy's randomized speed calc.
      @type {number} */
  this.maxSpeed = maxSpeed;

  /** The minimum speed the enemy's randomized speed calc.
      @type {number} */
  this.minSpeed = minSpeed;

  this.treatCount = 1;

};

/**
 * Removes all the enemies.
 */
GameStateController.prototype.clearEnemies = function() {
  // Clear out the enemy objects so the next update doesn't draw any.
  allEnemies = [];
};

/**
 * Creates all of the enemies.
 */
GameStateController.prototype.generateEnemies = function() {
  var startRow = 1;
  var endRow = 3;
  var rowGroupCount = 0; // Keeps track of our multiples of number of rows.

  // Create all initial enemies.
  for (var i = startRow; i <= this.enemyCount; i++) {
    var startX = Math.random() * (canvasWidth - 0);

    // Increment the row number, normalizing to startRow through endRow.
    var rowNum = i - rowGroupCount * endRow;

    // If we've reached the end of the group, increment the row set counter.
    if (i % endRow === 0) rowGroupCount++;

    var startY = rowNum * rowHeight + characterVertOffset;
    var speed = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;

    allEnemies.push(new Enemy(startX, startY, speed));
  }
};

/**
 * Clears the treats.
 */
GameStateController.prototype.clearTreats = function() {
  allTreats = [];
};

/**
 * Creates all of the treats.
 */
GameStateController.prototype.generateTreats = function() {
  // Put X and Y values into arrays so we can randomize an index. Ignore
  // the row containing the water and the row containing the player.
  var columns = [0, colWidth, colWidth * 2, colWidth * 3, colWidth * 4];
  var rows = [rowHeight + characterVertOffset,
              rowHeight * 2 + characterVertOffset,
              rowHeight * 3 + characterVertOffset,
              rowHeight * 4 + characterVertOffset];

  // Create random indexes, storing them as pairs so we can sort them by
  // the row index for proper overlap when rendering.

  var indexPairs = [];

  // Loop to push new pairs until we get a unique pair for total number of
  // treats we need.
  while (indexPairs.length < this.treatCount) {
    var columnsIndex = Math.round(Math.random() * (columns.length - 1));
    var rowsIndex = Math.round(Math.random() * (rows.length - 1));

    var duplicate = false;

    // Check if that row,column is already in the array.
    for (var j = 0, len = indexPairs.length; j < len; j++) {
      if (indexPairs[j][0] == columnsIndex && indexPairs[j][1] == rowsIndex) {
        // Try again.
        duplicate = true;
        break;
      }
    }

    if (duplicate) {
      continue;
    } else {
      indexPairs.push([columnsIndex, rowsIndex]);
    }
  }

  // Sort the array so we can later draw the treats from top to bottom for
  // proper layering.
  indexPairs = indexPairs.sort(function(a,b) {
                                return a[1] - b[1];
                               });

  indexPairs.forEach(function(item) {console.log('indexPairs', item)});

  var treatTypes = ['blue', 'green', 'orange', 'heart'];

  // Create all the treats.
  for (i = 0; i < indexPairs.length; i++) {
    var x = columns[indexPairs[i][0]];
    var y = rows[indexPairs[i][1]];

    var treatIndex = Math.round(Math.random() * (treatTypes.length - 1));
    var treatType = treatTypes[treatIndex];

    switch(treatType) {
      case 'blue':
        allTreats.push(new Gem(x, y, 'blue'));
        break;

      case 'green':
        allTreats.push(new Gem(x, y, 'green'));
        break;

      case 'orange':
        allTreats.push(new Gem(x, y, 'orange'));
        break;

      case 'heart':
        allTreats.push(new Heart(x, y));
        break;

      default:
        console.warn('Something went wrong selecting treat with ' + treatType);
    }

  }
};

/**
 * Collects the treat.
 * @param {Treat} treat The treat to remove from the board.
 */
GameStateController.prototype.collectTreat = function(treat) {
  gameStateController.updateScore();

  // Remove the reference to this treat so it will no longer get drawn
  // in update loop.
  for (var i = allTreats.length - 1; i >= 0; i--) {
    if (allTreats[i] === treat) {
      allTreats.splice(i, 1);
      break;
    }
  }

};

/**
 * Increases level counter and upgrades enemies, treats, etc.
 */
GameStateController.prototype.levelUp = function() {
  this.level++;
  levelDisplay.innerHTML = this.level;
  console.log("level ", this.level);

  this.updateScore();

  // Increase enemy count every five levels.
  if (this.level % 5 === 0) {
    console.log(this.level, 'increasing enemy count');
    this.enemyCount++;
  }

  // Increase enemy speed and treat count every two levels.
  if (this.level % 2 === 0) {
    console.log(this.level, 'increasing speed');
    this.maxSpeed += 10;
    this.minSpeed += 5;

    console.log(this.level, 'increasting treat count');
    if (this.treatCount < 5 * 4) { // 5 columns x 4 rows
      this.treatCount++;
    }
  }

  this.clearEnemies();
  this.clearTreats();
  this.generateEnemies();
  this.generateTreats();
};

/**
 * Increases score and updates display to user.
 * @param {number} [points=1] The points to add to the score.
 */
GameStateController.prototype.updateScore = function(points) {
  points = points || 1;
  this.score += points;
  console.log('score', this.score);

  // Update the score display.
  scoreDisplay.innerHTML = this.score;
};

/** Whether to draw the boundaries of the game pieces. For debugging only. **/
var showBoundaries = false;

/** Height of each asset. */
var assetHeight = 171;

/** Width of each asset. */
var assetWidth = 101;

/** Width of image asset */
var colWidth = assetWidth;

/**
 * Height of image asset. 171px tall image assets, overlap other rows by 88px.
 */
var rowHeight = 83;

/**
 * Offset for the character asset's visual elements.
 * The character assets don't visually line up with the tile assets, even
 * though they're the same dimensions. This offset is used to line up the
 * character so it overlays the tiles correctly.
 */
var characterVertOffset = -32;

/** Width of the canvas. */
var canvasWidth = 505;

/** Height of the canvas. */
var canvasHeight = 606;

/** Instance to store game state. */
var gameStateController = new GameStateController(3, 200, 100);

/** Array that holds all the enemy instances. */
var allEnemies = [];
gameStateController.generateEnemies();

/** The player instance. */
var player = new Player(2 * colWidth, 5 * rowHeight + characterVertOffset);

/** Array to hold the treats. */
var allTreats = [];
gameStateController.generateTreats();

var scoreDisplay = document.getElementById('score');
var levelDisplay = document.getElementById('level');

// Listen for user input
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
