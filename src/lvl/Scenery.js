
exports = Class("Scenery", function () {
  this.init = function (type) {
    this.type = type;
  };

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
