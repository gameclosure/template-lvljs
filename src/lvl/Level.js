// XXX: TODO: FIXME: COMPILER BUG
jsio('import .Actor', { context: { backend: backend } });
jsio('import .Actor');
jsio('import .Scenery', { context: { backend: backend } });
jsio('import .Scenery');
jsio('import .UI'), { context: { backend: backend } };
jsio('import .UI');
jsio('import .Camera', { context: { backend: backend } });
jsio('import .Camera');

exports = Class("Level", function () {
  this.init = function () {
    this.bg = new Scenery('background');
    this.fg = new Scenery('foreground');
    this.ui = new UI();
    this.camera = new Camera();
    GC.app.engine.subscribe('Tick', bind(this, 'tick'));
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

  // TODO: move this concept / API to camera viewport
  this.setFullScreenDimensions = function (width, height) {
    backend.setFullScreenDimensions(width, height);
  };

  // TODO: move this concept / API to camera viewport
  this.setCustomDimensions = function (width, height, scale) {
    backend.setCustomDimensions(width, height, scale);
  };

  // TODO: devkit should limit global tick to ~100 ms max!!!
  // BIG TICKS BREAK THINGS.
  this.tick = function (dt) {
    this.camera.tick(dt);
  };
});
