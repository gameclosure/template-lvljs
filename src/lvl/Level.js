import .Actor;
import .Scenery;
import .UI;
import .Camera;

exports = Class("Level", function () {
  var _backend;

  this.init = function (backend) {
    _backend = backend;

    this.bg = new Scenery(_backend, 'background');
    this.fg = new Scenery(_backend, 'foreground');
    this.ui = new UI(_backend);
    this.camera = new Camera(_backend);
  };

  // TODO: remove / fix this
  this.initializeWithView = function (view) {
    this._view = view;
  };

  this.addActor = function (resource, geometryOverrides) {
    var type = resource.getType();
    if (type === 'sprite' || type === 'image') {
      return new Actor(_backend, resource, geometryOverrides);
    } else {
      throw new Error("Invalid Resource Type for Actor:", type);
    }
  };

  this.addParallax = function (resource) {
    throw new Error("TODO");
  };
});
