var lvl;
var BG_WIDTH = 576;
var BG_HEIGHT = 1024;


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

function startGame () {
  // set letter-boxed viewport; TODO: get 3:4 aspect ratio art
  lvl.camera.setCustomViewportDimensions(BG_WIDTH, BG_HEIGHT, true);

  // add background and foreground parallax
  var parallax = lvl.resources.loadParallaxFromJSON('resources/config/dragonPongParallax.json');
  lvl.bg.add(parallax);

  lvl.input.on('touchstart', function (data) {
    logger.log('TOUCH START:', data.x, data.y, data.touchID);
  }, this);
};
