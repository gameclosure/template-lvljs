import entities.shapes.Rect as Rect;

var min = Math.min;
var max = Math.max;
var MIN_NUM = -Number.MAX_VALUE;
var MAX_NUM = Number.MAX_VALUE;

/**
 * Camera Class
 * - extends Rect
 * - defines the public lvl.camera API
 */
exports = Class("Camera", Rect, function () {
  var superProto = Rect.prototype;

  // private state
  var _lastX;
  var _lastY;
  var _width;
  var _height;
  var _followTargets;
  var _followRect;

  this.init = function () {
    superProto.init.call(this, {
      width: backend.getViewportWidth(),
      height: backend.getViewportHeight()
    });

    _width = this.width;
    _height = this.height;

    Object.defineProperty(this, 'width', {
      enumerable: true,
      get: function () { return _width; },
      set: function (value) {
        // TODO: should camera width modify backend views ...
        // camera width === device width, so changing that would essentially scale the view to fit?
        // alternatively, we don't allow this to change at all
        throw new Error("Cannot set camera width, it's defined by your device");
      }
    });

    Object.defineProperty(this, 'height', {
      enumerable: true,
      get: function () { return _height; },
      set: function (value) {
        // TODO: see width above
        throw new Error("Cannot set camera height, it's defined by your device");
      }
    });

    this.reset();
    backend.onTick(bind(this, onTick));
  };

  this.reset = function () {
    this.vx = 0;
    this.vy = 0;
    this.zoom = 1;
    this.lagDistanceX = 0;
    this.lagDistanceY = 0;

    _lastX = this.x;
    _lastY = this.y;
    _followTargets = [];
    _followRect = new Rect(this);
  };

  this.moveTo = function (x, y) {
    // the camera can't be manually controlled and following simultaneously
    this.stopFollowingAll();

    this.x = x;
    this.y = y;
  };

  this.moveBy = function (dx, dy) {
    // the camera can't be manually controlled and following simultaneously
    this.stopFollowingAll();

    this.x += dx;
    this.y += dy;
  };

  this.zoomTo = function (z) {
    // the camera can't be manually controlled and following simultaneously
    this.stopFollowingAll();

    this.zoom = z;
  };

  this.zoomBy = function (dz) {
    // the camera can't be manually controlled and following simultaneously
    this.stopFollowingAll();

    // delta zoom is multiplicative
    this.zoom *= dz;
  };

  this.follow = function (target, opts) {
    if (target.__class__ !== "Actor") {
      throw new Error("Camera can only follow instances of Actor!");
    }

    _followTargets.push(target);

    if (opts.lagDistanceX !== undefined) {
      this.lagDistanceX = opts.lagDistanceX;
    }

    if (opts.lagDistanceY !== undefined) {
      this.lagDistanceY = opts.lagDistanceY;
    }
  };

  this.stopFollowing = function (target) {
    var i = _followTargets.indexOf(target);
    if (i >= 0) {
      _followTargets.splice(i, 1);
    }
  };

  this.stopFollowingAll = function () {
    _followTargets = [];
  };

  // TODO: devkit should limit global tick to ~100 ms max! BIG TICKS BREAK STUFF
  // process changes to camera state by applying them to the backend
  function onTick (dt) {
    this.x += this.vx * dt / 1000;
    this.y += this.vy * dt / 1000;

    // update viewport if necessary
    if (_followTargets.length) {
      followTargets.call(this, dt);
    }

    var dx = this.x - _lastX;
    var dy = this.y - _lastY;
    backend.moveViewportBy(dx, dy);

    _lastX = this.x;
    _lastY = this.y;
  };

  function followTargets () {
    var minX = MAX_NUM;
    var minY = MAX_NUM;
    var maxX = MIN_NUM;
    var maxY = MIN_NUM;
    _followTargets.forEach(function (target) {
      minX = min(target.entity.minX, minX);
      minY = min(target.entity.minY, minY);
      maxX = max(target.entity.maxX, maxX);
      maxY = max(target.entity.maxY, maxY);
    });

    _followRect.x = minX;
    _followRect.y = minY;
    _followRect.width = maxX - minX;
    _followRect.height = maxY - minY;

    // TODO: camera velocity, animations?
    // TODO: different easing functions?

    var dx = _followRect.centerX - this.centerX;
    if (dx < 0) {
      if (dx < -this.lagDistanceX) {
        this.x += dx;
      } else {
        var pct = dx / -this.lagDistanceX;
        this.x += pct * pct * dx;
      }
    } else if (dx > 0) {
      if (dx > this.lagDistanceX) {
        this.x += dx;
      } else {
        var pct = dx / this.lagDistanceX;
        this.x += pct * pct * dx;
      }
    }

    var dy = _followRect.centerY - this.centerY;
    if (dy < 0) {
      if (dy < -this.lagDistanceY) {
        this.y += dy;
      } else {
        var pct = dy / -this.lagDistanceY;
        this.y += pct * pct * dy;
      }
    } else if (dy > 0) {
      if (dy > this.lagDistanceY) {
        this.y += dy;
      } else {
        var pct = dy / this.lagDistanceY;
        this.y += pct * pct * dy;
      }
    }
  };
});
