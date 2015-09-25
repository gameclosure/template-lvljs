import ..utils;
import .Shape;

var min = Math.min;
var max = Math.max;
var random = Math.random;
var readOnlyProp = utils.addReadOnlyProperty;

// this class represenets a line segment
exports = Class("Line", Shape, function () {
  var superProto = Shape.prototype;

  this.init = function (opts) {
    opts = opts || {};
    superProto.init.call(this, opts);
    this.x2 = opts.x2 || 0;
    this.y2 = opts.y2 || 0;
  };

  readOnlyProp(this, 'centerX', function () { return (this.x + this.x2) / 2; });
  readOnlyProp(this, 'centerY', function () { return (this.y + this.y2) / 2; });
  readOnlyProp(this, 'minX', function () { return min(this.x, this.x2); });
  readOnlyProp(this, 'maxX', function () { return max(this.x, this.x2); });
  readOnlyProp(this, 'minY', function () { return min(this.y, this.y2); });
  readOnlyProp(this, 'maxY', function () { return max(this.y, this.y2); });

  // returns whether or not the provided point lies on the line
  this.contains = function (x, y) {
    // vertical, horizontal, or otherwise?
    if (this.x === this.x2) {
      return x === this.x && y >= this.minY && y <= this.maxY;
    } else if (this.y === this.y2) {
      return y === this.y && x >= this.minX && x <= this.maxX;
    } else {
      return (this.x - x) * (this.y - y) === (x - this.x2) * (y - this.y2);
    }
  };

  // returns a random point from on the line
  this.getRandomPoint = function () {
    var dx = this.x2 - this.x;
    var dy = this.y2 - this.y;
    var pct = random();
    return {
      x: this.x + pct * dx,
      y: this.y + pct * dy
    };
  };
});
