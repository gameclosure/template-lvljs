import .Shape;
import .Rect;
import .Circle;
import .Line;

exports.createRect = function (opts) {
  return new Rect(opts);
};

exports.createCircle = function (opts) {
  return new Circle(opts);
};

exports.createLine = function (opts) {
  return new Line(opts);
};

// TODO: expose shape classes?
