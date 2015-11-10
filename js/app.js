/**
 * @fileoverview Generates the player and enemies, and keeps track of the
 *     level and other game state information.
 * @author Udacity
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
var Enemy = function(x,y,speed) {

  /** @member {number} Enemy#x
      @description The x location. */
  this.x = x;

  /** @member {number} Enemy#y
      @description The y location. */
  this.y = y;

  /** @member {number} Enemy#speed
      @description The speed in px/sec. */
  this.speed = speed;

  /** @member {number} Enemy#sprite
      @description The URL to the sprite graphic */
  this.sprite = 'images/enemy-bug.png';
};

/**
 * Hit area rectangle for collisions. Relative to the x,y of the sprite.
 * [x, y, width, height]
 * @type {Array.<number>}
 */
Enemy.prototype.HIT_AREA_RECT = [0,81,101,83];

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
  // ctx.strokeStyle = 'black';
  // ctx.strokeRect(this.x, this.y, assetWidth, assetHeight);
  // ctx.strokeStyle = 'red';
  // ctx.strokeRect(this.x + this.HIT_AREA_RECT[0],
  //                this.y + this.HIT_AREA_RECT[1],
  //                this.HIT_AREA_RECT[2],
  //                this.HIT_AREA_RECT[3]);
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
 * @returns {boolean} Whether this enemy and the player's hit areas interesect.
 */
Enemy.prototype.collidedWithPlayer = function() {
  var leftBounds = this.x + this.HIT_AREA_RECT[0];
  var rightBounds = this.x + this.HIT_AREA_RECT[2];
  var topBounds = this.y + this.HIT_AREA_RECT[1];
  var bottomBounds = this.y + this.HIT_AREA_RECT[3];
  var playerLeftBounds = player.x + player.HIT_AREA_RECT[0];
  var playerRightBounds = player.x + player.HIT_AREA_RECT[2];
  var playerTopBounds = player.y + player.HIT_AREA_RECT[1];
  var playerBottomBounds = player.y + player.HIT_AREA_RECT[3];

  var collisionX = (rightBounds >= playerLeftBounds &&
                    rightBounds <= playerRightBounds) ||
                   (leftBounds >= playerLeftBounds &&
                    leftBounds <= playerRightBounds);

  var collisionY = (topBounds >= playerTopBounds &&
                    topBounds <= playerBottomBounds) ||
                   (bottomBounds >= playerTopBounds &&
                    bottomBounds <= playerBottomBounds);

  return collisionX && collisionY;
}


/* Player */

/**
 * Creates a new Player.
 * @constructor
 * @param {number} x The start x location.
 * @param {number} y The start y location.
 */
var Player = function(x,y) {

  /** @member {number} Player#x
      @description The x location. */
  this.x = x;

  /** @member {number} Player#y
      @description The y location. */
  this.y = y;

  /** @member {number} Player#startX
      @description The starting x location. Used to reset. */
  this.startX = x;

  /** @member {number} Player#startY
      @description The starting y location. Used to reset. */
  this.startY = y;

  /** @member {number} Player#goalX
      @description The x location the player is going to. */
  this.goalX = x;

  /** @member {number} Player#goalY
      @description The y location the player is going to. */
  this.goalY = y;

  /** @member {string} Player#sprite
      @description The URL for the sprite asset. */
  this.sprite = 'images/char-boy.png';
};

/**
 * Hit area rectangle for collisions. Relative to the x,y of the sprite.
 * [x, y, width, height]
 * @type {Array.<number>}
 */
Player.prototype.HIT_AREA_RECT = [0,81,101,83];

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
  // ctx.strokeStyle = 'black';
  // ctx.strokeRect(this.x, this.y, assetWidth, assetHeight);
  // ctx.strokeStyle = 'red';
  // ctx.strokeRect(this.x + this.HIT_AREA_RECT[0],
  //                this.y + this.HIT_AREA_RECT[1],
  //                this.HIT_AREA_RECT[2],
  //                this.HIT_AREA_RECT[3]);
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


/* Game State Controller */

/**
 * Creates a new controller to store game state information
 * @constructor
 * @param {number} enemyCount The number of enemy to start the game
 * @param {number} maxSpeed The maximum speed at which the enemies should start.
 * @param {number} minSpeed The minimum speed at which the enemies should start.
 */
var GameStateController = function(enemyCount, maxSpeed, minSpeed) {

  /** @member {number} GameStateController#level
      @description The current level of the game. */
  this.level = 1;

  /** @member {number} GameStateController#enemyCount
      @description The number of enemies currently on the board. */
  this.enemyCount = enemyCount;

  /** @member {number} GameStateController#maxSpeed
      @description The maximum speed for the enemy's randomized speed calc. */
  this.maxSpeed = maxSpeed;

  /** @member {number} GameStateController#minSpeed
      @description The minimum speed the enemy's randomized speed calc. */
  this.minSpeed = minSpeed;
}

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
    if (i % endRow == 0) rowGroupCount++;

    var startY = rowNum * rowHeight + characterVertOffset;
    var speed = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;

    allEnemies.push(new Enemy(startX, startY, speed));
  }
};

/**
 * Increases level counter and upgrades enemies.
 */
GameStateController.prototype.levelUp = function() {
  this.level++;
  console.log("level ", this.level);

  // Increase enemy count every five levels.
  if (this.level % 5 == 0) {
    console.log(this.level, 'increasing enemy count');
    this.enemyCount++;
  }

  // Increase enemy count every two levels.
  if (this.level % 2 == 0) {
    console.log(this.level, 'increasing speed');
    this.maxSpeed += 10;
    this.minSpeed += 5;
  }

  this.clearEnemies();
  this.generateEnemies();
};



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
