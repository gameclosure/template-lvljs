// TODO: clean up GC.Application / lvl imports situation
var lvl;
exports = Class(GC.Application, function () {
  this.initUI = function () { lvl = jsio('import .lvl'); };
  this.launchUI = function () { startGame(); };
});



var PI = Math.PI;
var random = Math.random;

var BG_WIDTH = 576;
var BG_HEIGHT = 1024;
var PLAYER_VX = 280;
var PLAYER_JUMP_VY = -600;
var GRAVITY = 1500;
var PARALLAX_URL = 'resources/config/dragonPongParallax.json';
var PLAYER_URL = 'resources/config/dragonPongPlayer.json';

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

  player.collidesWith('left', onPlayerHitWall);
  player.collidesWith('right', onPlayerHitWall);
  player.collidesWith('top', onPlayerHitPoison);
  player.collidesWith('bottom', onPlayerHitPoison);

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

    // if (difficulty < 1) { difficulty += DIFFICULTY_RAMP; }
    // player.vx = (PLAYER_VX + PLAYER_VX * 0.1 * difficulty) * newDir;
    // wallObstacles.forEachActiveActor(function (oldObstacle) {
    //   animateObstacle(oldObstacle, newDir, true);
    // });
    // scoreText.setText(++score);
    // effects.squish(scoreText, { duration: 300, loop: false, scale: 3 });
    // spawnObstacles(newDir);
  };

  function onPlayerHitPoison () {
    if (!player) { return; }
    player.destroy();
    player = null;
    // TODO: game over and reset
  };
};
