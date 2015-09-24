import animate;

// XXX: TODO: FIXME: COMPILER BUG
jsio('import .Actor', { context: { backend: backend } });
jsio('import .Actor');
jsio('import .Scenery', { context: { backend: backend } });
jsio('import .Scenery');
jsio('import .UI', { context: { backend: backend } });
jsio('import .UI');
jsio('import .Camera', { context: { backend: backend } });
jsio('import .Camera');
jsio('import .Input', { context: { backend: backend } });
jsio('import .Input');

var Level = Class("Level", function () {
  this.init = function () {
    this.bg = new Scenery('background');
    this.fg = new Scenery('foreground');
    this.ui = UI;
    this.camera = Camera;
    this.input = Input;
  };

  // TODO: remove / fix this
  this.initializeWithView = function (view) {
    this._view = view;
  };

  this.reset = function () {
    // TODO: reset backend first, then reset lvl API
    throw new Error("TODO");
  };

  this.addActor = function (resource, geometryOverrides) {
    var type = resource.getType();
    if (type === 'sprite' || type === 'image') {
      return new Actor(resource, geometryOverrides);
    } else {
      throw new Error("Invalid Resource Type for Actor:", type);
    }
  };

  this.addGroup = function () {
    throw new Error("TODO");
  };

  this.addParallax = function (resource) {
    throw new Error("TODO");
  };

  // TODO: devkit should limit global tick to ~100 ms max! BIG TICKS BREAK STUFF

  // TODO: track and clear all animations on reset?
  this.animate = animate;

  this.setTimeout = function (fn, duration) {
    // TODO: track and clear all timeouts on reset?
    // TODO: implement version that ticks w backend
    return setTimeout(fn, duration);
  };

  this.clearTimeout = function (id) {
    // TODO: implement version that ticks w backend
    return clearTimeout(id);
  };

  this.setInterval = function (fn, duration) {
    // TODO: track and clear all intervals on reset?
    // TODO: implement version that ticks w backend
    return setInterval(fn, duration);
  };

  this.clearInterval = function (id) {
    // TODO: implement version that ticks w backend
    return clearInterval(id);
  };

  // ordered by zIndex, top-most first
  this.getActorsAtScreenPosition = function (x, y) {
    throw new Error("TODO");
  };
});

// singleton Level API
exports = new Level();
