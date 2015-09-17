
exports = Class("Camera", function () {
  // private state
  var _width = backend.getDeviceWidth();
  var _height = backend.getDeviceHeight();
  var _following = [];

  this.init = function () {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
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
      _width = value;
    }
  });

  Object.defineProperty(this, 'height', {
    enumerable: true,
    get: function () {
      return _height;
    },
    set: function (value) {
      // TODO: see width above
      _height = value;
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

  // TODO: camera should have its own state
  this.autoScrollBy = function (dx, dy) {
    backend.autoScrollCameraBy(dx, dy);
  };

  // process changes to camera state by applying them to the backend?
  this.tick = function () {};
});
