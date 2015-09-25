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
jsio('import .Input', { context: { backend: backend } });
jsio('import .Input');
jsio('import .resources', { context: { backend: backend } });
jsio('import .resources');
jsio('import .sounds', { context: { backend: backend } });
jsio('import .sounds');
jsio('import .shapes', { context: { backend: backend } });
jsio('import .shapes');

var Level = Class("Level", function () {
  this.init = function () {
    // attach special class instances
    this.bg = new Scenery('background');
    this.fg = new Scenery('foreground');

    // attach special class singletons
    this.ui = UI;
    this.camera = Camera;
    this.input = Input;

    // attach library modules
    this.resources = resources;
    this.sounds = sounds;
    this.shapes = shapes;

    // collideable bounds that stick to the screen (camera viewport edges)
    // this.bounds = {};
    // this.bounds.screenTop = new Rect();
    // this.bounds.screenRight = new Rect();
    // this.bounds.screenBottom = new Rect();
    // this.bounds.screenLeft = new Rect();
  };

  // TODO: remove / fix this
  this.initializeWithView = function (view) {
    this._view = view;
  };

  this.reset = function () {
    // TODO: reset backend first, then reset lvl API
    throw new Error("TODO");
  };

  this.addActor = function (resource, opts) {
    var type = resource.getType();
    if (type === 'sprite' || type === 'image') {
      return new Actor(resource, opts);
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
