
exports = Class("Scenery", function () {
  this.init = function (type) {
    this.type = type;
  };

  // TODO: remove this if we don't need it
  this.reset = function () {};

  this.add = function (resource, opts) {
    if (this.type === 'foreground') {
      backend.addToForeground(resource, opts);
    } else {
      backend.addToBackground(resource, opts);
    }
  };

  this.clear = function () {
    if (this.type === 'foreground') {
      backend.clearForeground();
    } else {
      backend.clearBackground();
    }
  };
});
