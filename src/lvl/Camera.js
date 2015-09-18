
exports = Class("Camera", function () {
  // private state
  var _lastX;
  var _lastY;
  var _width;
  var _height;
  var _following;

  this.init = function () {
    this.reset();
  };

  this.reset = function () {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.zoom = 1;

    _lastX = this.x;
    _lastY = this.y;
    _width = backend.getDeviceWidth();
    _height = backend.getDeviceHeight();
    _following = [];
  };

  Object.defineProperty(this, 'width', {
    enumerable: true,
    get: function () {
      return _width;
    },
    set: function (value) {
      // TODO: should camera width modify backend views ...
      // camera width === device width, so changing that would essentially scale the view to fit?
      // alternatively, we don't allow this to change at all

      throw new Error("Cannot set camera width, it's defined by your device");
      // _width = value;
    }
  });

  Object.defineProperty(this, 'height', {
    enumerable: true,
    get: function () {
      return _height;
    },
    set: function (value) {
      // TODO: see width above

      throw new Error("Cannot set camera height, it's defined by your device");
      // _height = value;
    }
  });

  this.moveTo = function (x, y) {

  };

  this.moveBy = function (dx, dy) {

  };

  this.zoomTo = function (z) {

  };

  this.zoomBy = function (dz) {

  };

  this.follow = function (target) {
    _following.push(target);
  };

  this.stopFollowing = function (target) {
    var i = _following.indexOf(target);
    if (i >= 0) {
      _following.splice(i, 1);
    }
  };

  this.stopFollowingAll = function () {
    _following = [];
  };

  // process changes to camera state by applying them to the backend?
  this.tick = function (dt) {
    this.x += this.vx * dt / 1000;
    this.y += this.vy * dt / 1000;

    var dx = this.x - _lastX;
    var dy = this.y - _lastY;
    backend.moveViewportBy(dx, dy);

    _lastX = this.x;
    _lastY = this.y;
  };
});
