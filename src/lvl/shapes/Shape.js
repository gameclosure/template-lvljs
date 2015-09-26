var uid = 0;

// this base class represenets a general interface for any shape
exports = Class("Shape", function () {
  this.init = function (opts) {
    opts = opts || {};
    this.uid = this.__class__ + uid++;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    // whether or not the shape can be moved during collision resolution
    this.fixed = opts.fixed || false;
  };

  // is the point x, y contained in the shape?
  this.contains = function (x, y) {
    return this.x === x && this.y === y;
  };

  // get a random point from within the shape
  this.getRandomPoint = function () {
    return { x: this.x, y: this.y };
  };
});
