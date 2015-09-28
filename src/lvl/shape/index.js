import .Shape;
import .Rect;
import .Circle;
import .Line;

exports.getRect = function (opts) {
  return new Rect(opts);
};

exports.getCircle = function (opts) {
  return new Circle(opts);
};

exports.getLine = function (opts) {
  return new Line(opts);
};
