import .utils;
import .shapes.Rect as Rect;

var min = Math.min;
var max = Math.max;
var pow = Math.pow;
var MIN_NUM = -Number.MAX_VALUE;
var MAX_NUM = Number.MAX_VALUE;
var readOnlyProp = utils.addReadOnlyProperty;

/**
 * Camera Class
 * - defines the public lvl.camera API
 */
var Camera = Class("Camera", function () {
  // private state
  var _lastX;
  var _lastY;
  var _lastZoom;
  var _width;
  var _height;
  var _followTargets;
  var _followRect;

  this.init = function () {
    // TODO: max speeds and max zoom speed
    // TODO: follow bounds - PADDING TRBL - where can targets go within
    // TODO: world bounds - where can the camera go
    // TODO: Object.defineProp ... __animatableProperties

    this.reset();
    backend.onTick(bind(this, onTick));
  };

  readOnlyProp(this, 'width', function () { return _width; });
  readOnlyProp(this, 'height', function () { return _height; });
  readOnlyProp(this, 'centerX', function () { return this.x + _width / 2; });
  readOnlyProp(this, 'centerY', function () { return this.y + _height / 2; });
  readOnlyProp(this, 'top', function () { return this.y; });
  readOnlyProp(this, 'right', function () { return this.x + _width; });
  readOnlyProp(this, 'bottom', function () { return this.y + _height; });
  readOnlyProp(this, 'left', function () { return this.x; });

  this.reset = function () {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.minZoom = 0.2;
    this.maxZoom = 1;
    this.lagX = 0;
    this.lagY = 0;
    this.lagZoom = 0;

    _width = backend.getViewportWidth();
    _height = backend.getViewportHeight();
    _lastX = this.x;
    _lastY = this.y;
    _lastZoom = this.zoom;
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

    // TODO: constrain
    this.zoom = z;
  };

  this.zoomBy = function (dz) {
    // the camera can't be manually controlled and following simultaneously
    this.stopFollowingAll();

    // delta zoom is multiplicative
    this.zoom *= dz;
  };

  this.follow = function (target, opts) {
    opts = opts || {};
    if (target.__class__ !== "Actor") {
      throw new Error("Camera can only follow instances of Actor!");
    }

    _followTargets.push(target);

    if (opts.lagX !== undefined) {
      this.lagX = opts.lagX;
    }

    if (opts.lagY !== undefined) {
      this.lagY = opts.lagY;
    }

    if (opts.lagZoom !== undefined) {
      this.lagZoom = opts.lagZoom;
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
    // update viewport if necessary
    if (_followTargets.length) {
      followTargets.call(this, dt);
    }

    var dx = this.x - _lastX;
    var dy = this.y - _lastY;
    var dz = this.zoom / _lastZoom;
    backend.moveViewportBy(dx, dy);
    backend.scaleViewportBy(dz);

    _lastX = this.x;
    _lastY = this.y;
    _lastZoom = this.zoom;
  };

  function followTargets () {
    // _followRect position and dimensions calculated by target spread
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

    // camera center moves horizontally towards _followRect center
    var dx = _followRect.centerX - this.centerX;
    if (dx < 0) {
      var pct = dx < -this.lagX ? 1 : pow(dx / -this.lagX, 2);
      this.x += pct * dx;
    } else if (dx > 0) {
      var pct = dx > this.lagX ? 1 : pow(dx / this.lagX, 2);
      this.x += pct * dx;
    }

    // camera center moves vertically towards _followRect center
    var dy = _followRect.centerY - this.centerY;
    if (dy < 0) {
      var pct = dy < -this.lagY ? 1 : pow(dy / -this.lagY, 2);
      this.y += pct * dy;
    } else if (dy > 0) {
      var pct = dy > this.lagY ? 1 : pow(dy / this.lagY, 2);
      this.y += pct * dy;
    }

    // camera zoom to fit all targets, constrained within minZoom and maxZoom
    var zoom = min(_width / _followRect.width, _height / _followRect.height);
    zoom = min(this.maxZoom, max(this.minZoom, zoom));
    var dz = zoom - this.zoom;
    if (dz < 0) {
      var pct = dz < -this.lagZoom ? 1 : pow(dz / -this.lagZoom, 2);
      this.zoom += pct * dz;
    } else if (dz > 0) {
      var pct = dz > this.lagZoom ? 1 : pow(dz / this.lagZoom, 2);
      this.zoom += pct * dz;
    }
  };
});

// singleton class
exports = new Camera();
