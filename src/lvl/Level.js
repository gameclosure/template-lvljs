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

var Level = Class("Level", function () {
  this.init = function () {
    this.bg = new Scenery('background');
    this.fg = new Scenery('foreground');
    this.ui = UI;
    this.camera = Camera;
  };

  // TODO: remove / fix this
  this.initializeWithView = function (view) {
    this._view = view;
  };

  this.addActor = function (resource, geometryOverrides) {
    var type = resource.getType();
    if (type === 'sprite' || type === 'image') {
      return new Actor(resource, geometryOverrides);
    } else {
      throw new Error("Invalid Resource Type for Actor:", type);
    }
  };

  this.addParallax = function (resource) {
    throw new Error("TODO");
  };

  // TODO: track and clear all animations on reset?
  this.animate = animate;

  this.setTimeout = function (fn, duration) {
    // TODO: track and clear all timeouts on reset?
    return setTimeout(fn, duration);
  };

  this.clearTimeout = function (id) {
    return clearTimeout(id);
  };

  this.setInterval = function (fn, duration) {
    // TODO: track and clear all intervals on reset?
    return setInterval(fn, duration);
  };

  this.clearInterval = function (id) {
    return clearInterval(id);
  };

  // TODO: move this concept / API to camera viewport
  this.setFullScreenDimensions = function (width, height) {
    backend.setFullScreenDimensions(width, height);
  };

  // TODO: move this concept / API to camera viewport
  this.setCustomDimensions = function (width, height, scale) {
    backend.setCustomDimensions(width, height, scale);
  };
});

// singleton Level API
exports = new Level();
