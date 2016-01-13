var lvl;
exports = Class(GC.Application, function () {
  this.initUI = function () { lvl = jsio('import .lvl'); };
  this.launchUI = function () { startGame(); };
});

var BG_WIDTH = 576;
var BG_HEIGHT = 1024;

function startGame () {
  lvl.camera.setCustomViewportDimensions(BG_WIDTH, BG_HEIGHT, true);
};