
exports = Class("Camera", function () {
  var _backend;

  this.init = function (backend) {
    _backend = backend;
  };

  this.autoScrollBy = function (dx, dy) {
  	// TODO: camera should have its own state
  	_backend.autoScrollCameraBy(dx, dy);
  };
});
