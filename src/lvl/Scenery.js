
var VALID_SCENERY_TYPES = {
  'background': true,
  'foreground': true
};

exports = Class("Scenery", function () {
  var _backend;

  this.init = function (backend, type) {
    _backend = backend;

    this.type = type;
    if (!VALID_SCENERY_TYPES[this.type]) {
      throw new Error("Invalid Scenery Type: " + this.type);
    }
  };

  this.add = function (resource, opts) {
    if (this.type === 'foreground') {
      _backend.addToForeground(resource, opts);
    } else {
      _backend.addToBackground(resource, opts);
    }
  };

  this.clear = function () {
    if (this.type === 'foreground') {
      _backend.clearForeground();
    } else {
      _backend.clearBackground();
    }
  };
});
