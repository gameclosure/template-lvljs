// TODO: clean up GC.Application / lvl imports situation
var lvl;
exports = Class(GC.Application, function () {
  this.initUI = function () {
    lvl = jsio('import .lvl');
    lvl.initializeWithView(this.view);
  };

  this.launchUI = function () {
    startGame();
  };
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
  var parallaxResource = lvl.resources.loadParallaxFromJSON(PARALLAX_URL);
  lvl.bg.add(parallaxResource);

  // subscribe to player touch events
  lvl.input.on('touchstart', onTouchStart);

  // add the player to the game
  var playerResource = lvl.resources.loadSpriteFromJSON(PLAYER_URL);
  var player = lvl.addActor(playerResource);

  // player.collidesWith(lvl.bounds, onPlayerHitBounds);

  function onTouchStart (touch) {
    if (!player) { return; }
    if (player.vx === 0) {
      player.vx = PLAYER_VX;
      player.ay = GRAVITY;
    }
    player.vy = PLAYER_JUMP_VY;
    player.startSprite("fly");
  };

  function onPlayerHitBounds () {};
};
