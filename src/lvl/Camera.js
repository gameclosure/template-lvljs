
exports = Class("Camera", function () {
  // private state
  var _properties = {};

  this.init = function () {
    this.x = 0;
    this.y = 0;
    this.width = backend.getDeviceWidth();
    this.height = backend.getDeviceHeight();
    this.zoom = 1;
  };

  Object.defineProperty(this, 'width', {
    enumerable: true,
    get: function () {
      return _properties.width;
    },
    set: function (value) {
      // TODO: should camera width modify backend views ...
      // camera width === device width, so changing that would essentially scale the view to fit?
      // alternatively, we don't allow this to change at all
      _properties.width = value;
    }
  });

  Object.defineProperty(this, 'height', {
    enumerable: true,
    get: function () {
      return _properties.height;
    },
    set: function (value) {
      // TODO: see width above
      _properties.height = value;
    }
  });

  this.autoScrollBy = function (dx, dy) {
    // TODO: camera should have its own state
    backend.autoScrollCameraBy(dx, dy);
  };

  // process changes to camera state by applying them to the backend?
  this.tick = function () {

  };
});
