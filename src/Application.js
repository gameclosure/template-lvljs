// TODO: clean up GC.Application / lvl imports situation
var lvl;
exports = Class(GC.Application, function () {
  this.initUI = function () { lvl = jsio('import .lvl'); };
  this.launchUI = function () { startGame(); };
});



var PI = Math.PI;
var min = Math.min;
var max = Math.max;
var floor = Math.floor;
var random = Math.random;

var BG_WIDTH = 576;
var BG_HEIGHT = 1024;
var PLAYER_VX = 280;
var PLAYER_JUMP_VY = -600;
var GRAVITY = 1500;
var SPEAR_SLOTS = 7;
var SPEAR_MARGIN = 150;
var SPEAR_SPACING = (BG_HEIGHT - SPEAR_MARGIN * 2) / (SPEAR_SLOTS - 1);
var DIFFICULTY_STEP = 0.05;
var DIFFICULTY_MAX = 1;
var PARALLAX_URL = 'resources/config/dragonPongParallax.json';
var PLAYER_URL = 'resources/config/dragonPongPlayer.json';
var SPEAR_URL = 'resources/config/dragonPongSpear.json';

function startGame () {
  // set letter-boxed viewport; TODO: get 3:4 aspect ratio art
  lvl.camera.setCustomViewportDimensions(BG_WIDTH, BG_HEIGHT, true);

  // add background parallax
  var parallaxResource = lvl.resource.loadParallaxFromJSON(PARALLAX_URL);
  lvl.bg.add(parallaxResource);

  // subscribe to player touch events
  lvl.input.on('touchstart', onTouchStart);

  // add the player to the game
  var playerResource = lvl.resource.loadSpriteFromJSON(PLAYER_URL);
  var player = lvl.addActor(playerResource);

  // add obstacles to the game
  var spearResource = lvl.resource.loadImageFromJSON(SPEAR_URL);
  var spears = lvl.addGroup('spears');
  var difficulty = 0;

  player.collidesWith('left', onPlayerHitWall);
  player.collidesWith('right', onPlayerHitWall);
  player.collidesWith('top', onGameOver);
  player.collidesWith('bottom', onGameOver);
  player.collidesWith(spears, onGameOver);

  function onTouchStart (touch) {
    if (!player) { return; }
    if (player.vx === 0) {
      player.vx = PLAYER_VX;
      player.ay = GRAVITY;
    }
    player.vy = PLAYER_JUMP_VY;
    player.startSprite("fly");
  };

  function onPlayerHitWall (player, wall) {
    var currDir = player.vx > 0 ? 1 : -1;
    var newDir = wall === lvl.bounds.screenRight ? -1 : 1;
    if (newDir === currDir) { return; }
    player.vx = newDir * PLAYER_VX;
    player.view.flipX = newDir > 0;
    difficulty = min(DIFFICULTY_MAX, difficulty + DIFFICULTY_STEP);
    // hide and destroy old spears
    spears.forEach(function (spear) { animateSpear(spear, newDir, true); });
    // spawn new spears
    spawnSpears(newDir);

    // player.vx = (PLAYER_VX + PLAYER_VX * 0.1 * difficulty) * newDir;
    // scoreText.setText(++score);
    // effects.squish(scoreText, { duration: 300, loop: false, scale: 3 });
  };

  function spawnSpears (direction) {
    var flipped = direction < 0;
    var spearPositions = getSpearPositions();
    for (var i = 0; i < SPEAR_SLOTS; i++) {
      if (spearPositions[i]) {
        var spear = lvl.addActor(spearResource, { group: spears });
        spear.view.flipX = flipped;
        spear.x = flipped
          ? lvl.camera.left - spear.view.width
          : lvl.camera.right;
        spear.y = SPEAR_MARGIN + i * SPEAR_SPACING;
        animateSpear(spear, direction, false);
      }
    }
  };

  function getSpearPositions () {
    var spearPositions = [];
    var count = floor(difficulty * (SPEAR_SLOTS - 2)) + 1;
    for (var i = 0; i < SPEAR_SLOTS; i++) {
      spearPositions[i] = i < count;
    }
    return lvl.util.shuffle(spearPositions);
  };

  function animateSpear (spear, direction, destroy) {
    lvl.animate(spear)
      .now({ x: spear.x - spear.view.width * direction }, 400)
      .then(function () { destroy && spear.destroy(); });
  };

  function onGameOver () {
    if (!player) { return; }
    player.destroy();
    player = null;
    lvl.setTimeout(function () {
      // TODO: startGame moves into lvl?
      lvl.reset();
      startGame();
    }, 2000);
  };
};
