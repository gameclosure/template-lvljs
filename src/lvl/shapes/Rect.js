import ..utils;
import .Shape;

var random = Math.random;
var readOnlyProp = utils.addReadOnlyProperty;

// this class represenets an axis-aligned rectangle
exports = Class("Rect", Shape, function () {
  var superProto = Shape.prototype;

  this.init = function (opts) {
    opts = opts || {};
    superProto.init.call(this, opts);
    this.width = opts.width || 0;
    this.height = opts.height || 0;
  };

  readOnlyProp(this, 'centerX', function () { return this.x + this.width / 2; });
  readOnlyProp(this, 'centerY', function () { return this.y + this.height / 2; });
  readOnlyProp(this, 'top', function () { return this.y; });
  readOnlyProp(this, 'right', function () { return this.x + this.width; });
  readOnlyProp(this, 'bottom', function () { return this.y + this.height; });
  readOnlyProp(this, 'left', function () { return this.x; });

  // returns whether or not the provided point lies within the rectangle
  this.contains = function (x, y) {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  };

  // returns a random point from within the rectangle
  this.getRandomPoint = function () {
    return {
      x: this.x + random() * this.width,
      y: this.y + random() * this.height
    };
  };
});
