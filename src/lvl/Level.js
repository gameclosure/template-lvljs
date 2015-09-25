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
  var lvl;

  this.init = function () {
    lvl = this;

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
    this.bounds = {};
    this.bounds.screenTop = shapes.getRect({ fixed: true });
    this.bounds.screenRight = shapes.getRect({ fixed: true });
    this.bounds.screenBottom = shapes.getRect({ fixed: true });
    this.bounds.screenLeft = shapes.getRect({ fixed: true });
    updateScreenBounds();
    backend.onTick(updateScreenBounds);
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

  function updateScreenBounds () {
    var x = lvl.camera.getViewportX();
    var y = lvl.camera.getViewportY();
    var w = lvl.camera.getViewportWidth();
    var h = lvl.camera.getViewportHeight();

    lvl.bounds.screenTop.x = x - w;
    lvl.bounds.screenTop.y = y - h;
    lvl.bounds.screenTop.width = 3 * w;
    lvl.bounds.screenTop.height = h;

    lvl.bounds.screenRight.x = x + w;
    lvl.bounds.screenRight.y = y - h;
    lvl.bounds.screenRight.width = w;
    lvl.bounds.screenRight.height = 3 * h;

    lvl.bounds.screenBottom.x = x - w;
    lvl.bounds.screenBottom.y = y + h;
    lvl.bounds.screenBottom.width = 3 * w;
    lvl.bounds.screenBottom.height = h;

    lvl.bounds.screenLeft.x = x - w;
    lvl.bounds.screenLeft.y = y - h;
    lvl.bounds.screenLeft.width = w;
    lvl.bounds.screenLeft.height = 3 * h;
  };
});

// singleton Level API
exports = new Level();
