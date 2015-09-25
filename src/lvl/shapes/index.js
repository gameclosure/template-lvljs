import .Shape;
import .Rect;
import .Circle;
import .Line;

exports.getRect = function (x, y, width, height) {
  return new Rect({
    x: x,
    y: y,
    width: width,
    height: height
  });
};

exports.getCircle = function (x, y, radius) {
  return new Circle({
    x: x,
    y: y,
    radius: radius
  });
};

exports.getLine = function (x, y, x2, y2) {
  return new Line({
    x: x,
    y: y,
    x2: x2,
    y2: y2
  });
};
