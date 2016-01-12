var lvl;
exports = Class(GC.Application, function () {
  this.initUI = function () { lvl = jsio('import .lvl'); };
  this.launchUI = function () { startGame(); };
});

function startGame () {
  lvl.camera.setCustomViewportDimensions(BG_WIDTH, BG_HEIGHT, true);
};