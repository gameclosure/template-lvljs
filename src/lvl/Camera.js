import entities.shapes.Rect as Rect;

var min = Math.min;
var max = Math.max;
var MIN_NUM = -Number.MAX_VALUE;
var MAX_NUM = Number.MAX_VALUE;

/**
 * Camera Class
 */
exports = Class("Camera", function () {
  // private state
  var _lastX;
  var _lastY;
  var _following;
  var _followRect;

  this.init = function () {
    this.reset();
    backend.onTick(bind(this, onTick));
  };

  this.reset = function () {
    this.vx = 0;
    this.vy = 0;
    this.zoom = 1;
    this.lagDistanceX = 0;
    this.lagDistanceY = 0;
    this.viewport = new Viewport();

    _lastX = this.viewport.x;
    _lastY = this.viewport.y;
    _following = [];
    _followRect = new Rect({
      x: this.viewport.x,
      y: this.viewport.y,
      width: this.viewport.width,
      height: this.viewport.height
    });
  };

  this.moveTo = function (x, y) {

  };

  this.moveBy = function (dx, dy) {

  };

  this.zoomTo = function (z) {

  };

  this.zoomBy = function (dz) {

  };

  this.follow = function (target, opts) {
    if (target.__class__ !== "Actor") {
      throw new Error("Camera can only follow instances of Actor!");
    }

    _following.push(target);

    if (opts.lagDistanceX !== undefined) {
      this.lagDistanceX = opts.lagDistanceX;
    }

    if (opts.lagDistanceY !== undefined) {
      this.lagDistanceY = opts.lagDistanceY;
    }
  };

  this.stopFollowing = function (target) {
    var i = _following.indexOf(target);
    if (i >= 0) {
      _following.splice(i, 1);
    }
  };

  this.stopFollowingAll = function () {
    _following = [];
  };

  // TODO: devkit should limit global tick to ~100 ms max! BIG TICKS BREAK STUFF
  // process changes to camera state by applying them to the backend
  function onTick (dt) {
    this.viewport.x += this.vx * dt / 1000;
    this.viewport.y += this.vy * dt / 1000;

    // update viewport if necessary
    if (_following.length) {
      doViewportFollow.call(this, dt);
    }

    var dx = this.viewport.x - _lastX;
    var dy = this.viewport.y - _lastY;
    backend.moveViewportBy(dx, dy);

    _lastX = this.viewport.x;
    _lastY = this.viewport.y;
  };

  function doViewportFollow () {
    var minX = MAX_NUM;
    var minY = MAX_NUM;
    var maxX = MIN_NUM;
    var maxY = MIN_NUM;
    _following.forEach(function (target) {
      minX = min(target.entity.minX, minX);
      minY = min(target.entity.minY, minY);
      maxX = max(target.entity.maxX, maxX);
      maxY = max(target.entity.maxY, maxY);
    });

    _followRect.x = minX;
    _followRect.y = minY;
    _followRect.width = maxX - minX;
    _followRect.height = maxY - minY;

    // TODO: camera easing, velocity, animations?

    var dx = _followRect.centerX - (this.viewport.centerX - this.lagDistanceX);
    if (dx < 0) {
      this.viewport.x += dx;
    }

    dx = _followRect.centerX - (this.viewport.centerX + this.lagDistanceX);
    if (dx > 0) {
      this.viewport.x += dx;
    }

    var dy = _followRect.centerY - (this.viewport.centerY - this.lagDistanceY);
    if (dy < 0) {
      this.viewport.y += dy;
    }

    dy = _followRect.centerY - (this.viewport.centerY + this.lagDistanceY);
    if (dy > 0) {
      this.viewport.y += dy;
    }
  };
});



/**
 * Viewport Class
 * - extends Rect
 * - defines the public lvl.camera.viewport API
 */
var Viewport = Class("Viewport", Rect, function () {
  var superProto = Rect.prototype;

  this.init = function () {
    superProto.init.call(this, {
      width: backend.getViewportWidth(),
      height: backend.getViewportHeight()
    });

    var _width = this.width;
    var _height = this.height;

    Object.defineProperty(this, 'width', {
      enumerable: true,
      get: function () { return _width; },
      set: function (value) {
        // TODO: should camera width modify backend views ...
        // camera width === device width, so changing that would essentially scale the view to fit?
        // alternatively, we don't allow this to change at all
        throw new Error("Cannot set camera viewport width, it's defined by your device");
      }
    });

    Object.defineProperty(this, 'height', {
      enumerable: true,
      get: function () { return _height; },
      set: function (value) {
        // TODO: see width above
        throw new Error("Cannot set camera viewport height, it's defined by your device");
      }
    });
  };
});
