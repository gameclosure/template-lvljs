import .View;

exports = Class("Scenery", View, function () {
  var superProto = View.prototype;

  this.init = function (type) {
    superProto.init.call(this);
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
