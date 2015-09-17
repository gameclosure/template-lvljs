
exports = Class("Camera", function () {
  this.init = function () {
    this.x = 0;
    this.y = 0;
    this.width = backend.getDeviceWidth();
    this.height = backend.getDeviceHeight();
    this.zoom = 1;
  };

  // Object.defineProperty(this, 'width', {
  //   enumerable: true,
  //   get: function () {
  //     return this.model.width || 2 * this.model.radius || 0;
  //   },
  //   set: function (value) {
  //     if (this.model.radius !== undefined) {
  //       this.model.radius = value / 2;
  //     } else {
  //       this.model.width = value;
  //     }
  //   }
  // });


  this.autoScrollBy = function (dx, dy) {
    // TODO: camera should have its own state
    backend.autoScrollCameraBy(dx, dy);
  };

  // process changes to camera state by applying them to the backend
  this.tick = function () {

  };
});
