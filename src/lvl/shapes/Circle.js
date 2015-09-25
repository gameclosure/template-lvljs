import ..utils;
import .Shape;

var PI = Math.PI;
var TAU = 2 * PI;
var sin = Math.sin;
var cos = Math.cos;
var sqrt = Math.sqrt;
var random = Math.random;
var readOnlyProp = utils.addReadOnlyProperty;

// this class represenets a circle
exports = Class("Circle", Shape, function () {
  var superProto = Shape.prototype;

  this.init = function (opts) {
    opts = opts || {};
    superProto.init.call(this, opts);
    this.radius = opts.radius || 0;
  };

  // returns whether or not the provided point lies within the circle
  this.contains = function(x, y) {
    var dx = x - this.x;
    var dy = y - this.y;
    var dist = sqrt(dx * dx + dy * dy);
    return dist <= this.radius;
  };

  // returns a random point from within the circle
  this.getRandomPoint = function () {
    var angle = random() * TAU;
    var radius = random() * this.radius;
    return {
      x: this.x + radius * cos(angle),
      y: this.y + radius * sin(angle)
    };
  };
});
