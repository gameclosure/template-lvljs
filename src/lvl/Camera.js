import .utils;
import .shape.Rect as Rect;

var min = Math.min;
var max = Math.max;
var MIN_NUM = -Number.MAX_VALUE;
var MAX_NUM = Number.MAX_VALUE;
var readOnlyProp = utils.addReadOnlyProperty;
var validatedProp = utils.addValidatedProperty;

/**
 * Camera Class
 * - defines the public lvl.camera API
 */
var Camera = Class("Camera", function () {
  var lastX;
  var lastY;
  var lastZoom;
  var panVelocityX;
  var panVelocityY;
  var zoomVelocity;
  var width;
  var height;
  var followTargets;
  var followRect;

  this.init = function () {
    this.reset();
    backend.onTick(bind(this, onTick));
  };

  // read-only camera properties
  readOnlyProp(this, 'width', function () { return width; });
  readOnlyProp(this, 'height', function () { return height; });
  readOnlyProp(this, 'centerX', function () { return this.x + width / 2; });
  readOnlyProp(this, 'centerY', function () { return this.y + height / 2; });
  readOnlyProp(this, 'top', function () { return this.y; });
  readOnlyProp(this, 'right', function () { return this.x + width; });
  readOnlyProp(this, 'bottom', function () { return this.y + height; });
  readOnlyProp(this, 'left', function () { return this.x; });

  this.reset = function () {
    // camera viewport
    this.x = 0;
    this.y = 0;
    this.zoom = 1;

    // camera viewport bounds
    this.minX = MIN_NUM;
    this.maxX = MAX_NUM;
    this.minY = MIN_NUM;
    this.maxY = MAX_NUM;
    this.minZoom = 0.2;
    this.maxZoom = 1;

    // padding to contain follow targets within the viewport
    this.followPaddingTop = 0;
    this.followPaddingRight = 0;
    this.followPaddingBottom = 0;
    this.followPaddingLeft = 0;

    // camera movement constraints
    this.maxPanVelocityX = 500;
    this.maxPanVelocityY = 500;
    this.maxZoomVelocity = 0.5;
    this.panAccelerationX = 1000;
    this.panAccelerationY = 1000;
    this.zoomAcceleration = 1;

    // TODO: elasticity / easing when camera reaches destination

    // private camera properties
    lastX = this.x;
    lastY = this.y;
    lastZoom = this.zoom;
    width = backend.getViewportWidth();
    height = backend.getViewportHeight();
    panVelocityX = 0;
    panVelocityY = 0;
    zoomVelocity = 0;
    followTargets = [];
    followRect = new Rect(this);
  };

  validatedProp(this, 'minX', function (value) {
    if (value > this.maxX) {
      throw new Error("Camera minX cannot exceed maxX!");
    }
  });

  validatedProp(this, 'maxX', function (value) {
    if (value < this.minX) {
      throw new Error("Camera minX cannot exceed maxX!");
    }
  });

  validatedProp(this, 'minY', function (value) {
    if (value > this.maxY) {
      throw new Error("Camera minY cannot exceed maxY!");
    }
  });

  validatedProp(this, 'maxY', function (value) {
    if (value < this.minY) {
      throw new Error("Camera minY cannot exceed maxY!");
    }
  });

  validatedProp(this, 'minZoom', function (value) {
    if (value > this.maxZoom) {
      throw new Error("Camera minZoom cannot exceed maxZoom!");
    }
  });

  validatedProp(this, 'maxZoom', function (value) {
    if (value < this.minZoom) {
      throw new Error("Camera minZoom cannot exceed maxZoom!");
    }
  });

  validatedProp(this, 'followPaddingLeft', function (value) {
    if (value + this.followPaddingRight > width) {
      throw new Error("Camera padding left + right cannot exceed width!");
    }
  });

  validatedProp(this, 'followPaddingRight', function (value) {
    if (value + this.followPaddingLeft > width) {
      throw new Error("Camera padding left + right cannot exceed width!");
    }
  });

  validatedProp(this, 'followPaddingTop', function (value) {
    if (value + this.followPaddingBottom > height) {
      throw new Error("Camera padding top + bottom cannot exceed height!");
    }
  });

  validatedProp(this, 'followPaddingBottom', function (value) {
    if (value + this.followPaddingTop > height) {
      throw new Error("Camera padding top + bottom cannot exceed height!");
    }
  });

  validatedProp(this, 'maxPanVelocityX', function (value) {
    if (value < 0) {
      throw new Error("Camera pan velocity must be >= 0!");
    }
  });

  validatedProp(this, 'maxPanVelocityY', function (value) {
    if (value < 0) {
      throw new Error("Camera pan velocity must be >= 0!");
    }
  });

  validatedProp(this, 'maxZoomVelocity', function (value) {
    if (value < 0) {
      throw new Error("Camera zoom velocity must be >= 0!");
    }
  });

  validatedProp(this, 'panAccelerationX', function (value) {
    if (value < 0) {
      throw new Error("Camera pan acceleration must be >= 0!");
    }
  });

  validatedProp(this, 'panAccelerationY', function (value) {
    if (value < 0) {
      throw new Error("Camera pan acceleration must be >= 0!");
    }
  });

  validatedProp(this, 'zoomAcceleration', function (value) {
    if (value < 0) {
      throw new Error("Camera zoom acceleration must be >= 0!");
    }
  });

  this.moveTo = function (x, y) {
    this.stopFollowingAll();
    this.x = x;
    this.y = y;
  };

  this.moveBy = function (dx, dy) {
    this.stopFollowingAll();
    this.x += dx;
    this.y += dy;
  };

  this.zoomTo = function (z) {
    this.stopFollowingAll();
    this.zoom = z;
  };

  this.zoomBy = function (dz) {
    this.stopFollowingAll();
    this.zoom *= dz;
  };

  // add an Actor to the camera's list of follow targets
  this.follow = function (target, opts) {
    opts = opts || {};
    if (target.__class__ !== "Actor") {
      throw new Error("Camera can only follow Actors!");
    }
    followTargets.push(target);
  };

  // remove an Actor from the camera's list of follow targets
  this.stopFollowing = function (target) {
    var i = followTargets.indexOf(target);
    if (i >= 0) {
      followTargets.splice(i, 1);
    }
  };

  // remove all Actors from the camera's list of follow targets
  this.stopFollowingAll = function () {
    followTargets.length = 0;
  };

  // return the left-most x-value within the world that the camera can see
  this.getViewportX = function () {
    var x = backend.getViewportX();
    var w = backend.getViewportWidth();
    var zw = w / this.zoom;
    return x + w / 2 - zw / 2;
  };

  // return the top-most y-value within the world that the camera can see
  this.getViewportY = function () {
    var y = backend.getViewportY();
    var h = backend.getViewportHeight();
    var zh = h / this.zoom;
    return y + h / 2 - zh / 2;
  };

  // return the width of the camera's view into the world
  this.getViewportWidth = function () {
    var w = backend.getViewportWidth();
    return w / this.zoom;
  };

  // return the height of the camera's view into the world
  this.getViewportHeight = function () {
    var h = backend.getViewportHeight();
    return h / this.zoom;
  };

  // process changes to camera state by applying them to the backend
  function onTick (dt) {
    // follow actors around the world by panning and zooming
    if (followTargets.length) {
      followTargetActors.call(this, dt);
    }

    // constrain the camera within its physical bounds
    this.x = min(this.maxX, max(this.minX, this.x));
    this.y = min(this.maxY, max(this.minY, this.y));
    this.zoom = min(this.maxZoom, max(this.minZoom, this.zoom));

    // apply deltas to the backend
    var dx = this.x - lastX;
    var dy = this.y - lastY;
    var dz = this.zoom / lastZoom;
    backend.moveViewportBy(dx, dy);
    backend.scaleViewportBy(dz);

    // save state for this tick to apply deltas next tick
    lastX = this.x;
    lastY = this.y;
    lastZoom = this.zoom;
  };

  function followTargetActors (dt) {
    // followRect position and dimensions calculated by target spread
    var secs = dt / 1000;
    var minX = MAX_NUM;
    var minY = MAX_NUM;
    var maxX = MIN_NUM;
    var maxY = MIN_NUM;
    followTargets.forEach(function (target) {
      minX = min(target.entity.minX, minX);
      minY = min(target.entity.minY, minY);
      maxX = max(target.entity.maxX, maxX);
      maxY = max(target.entity.maxY, maxY);
    });
    followRect.x = minX;
    followRect.y = minY;
    followRect.width = maxX - minX;
    followRect.height = maxY - minY;

    // TODO: constrain camera to world before follow as well as after
    // TODO: kill velocities when camera hits physical bounds
    // TODO: calculate zoom first, and move x + y after based on scaled rect
    // TODO: test and iterate

    // camera horizontal velocity aims to move camera center towards follow center
    var dx = followRect.centerX - this.centerX;
    if (dx < 0 && followRect.left < this.left + this.followPaddingLeft) {
      panVelocityX = max(panVelocityX - secs * this.panAccelerationX, -this.maxPanVelocityX);
    } else if (dx > 0 && followRect.right > this.right - this.followPaddingRight) {
      panVelocityX = min(panVelocityX + secs * this.panAccelerationX, this.maxPanVelocityX);
    }

    // camera vertical velocity aims to move camera center towards follow center
    var dy = followRect.centerY - this.centerY;
    if (dy < 0 && followRect.top < this.top + this.followPaddingTop) {
      panVelocityY = max(panVelocityY - secs * this.panAccelerationY, -this.maxPanVelocityY);
    } else if (dy > 0 && followRect.bottom > this.bottom - this.followPaddingBottom) {
      panVelocityY = min(panVelocityY + secs * this.panAccelerationY, this.maxPanVelocityY);
    }

    // camera zoom velocity aims to move camera zoom towards ideal follow zoom
    var paddedWidth = width - this.followPaddingLeft - this.followPaddingRight;
    var paddedHeight = height - this.followPaddingTop - this.followPaddingBottom;
    var zoom = min(paddedWidth / followRect.width, paddedHeight / followRect.height);
    var dz = zoom - this.zoom;
    if (dz < 0) {
      zoomVelocity = max(zoomVelocity - secs * this.zoomAcceleration, -this.maxZoomVelocity);
    } else if (dz > 0) {
      zoomVelocity = min(zoomVelocity + secs * this.zoomAcceleration, this.maxZoomVelocity);
    }

    var x = this.x + secs * panVelocityX;
    var y = this.y + secs * panVelocityY;
    var z = this.zoom + secs * zoomVelocity * this.zoom;

    // if the camera overshoots, slow down!
    if ((panVelocityX > 0 && followRect.centerX - this.centerX <= 0)
      || (panVelocityX < 0 && followRect.centerX - this.centerX >= 0))
    {
      panVelocityX = 0;
      x = this.x + dx;
    }

    if ((panVelocityY > 0 && followRect.centerY - this.centerY <= 0)
      || (panVelocityY < 0 && followRect.centerY - this.centerY >= 0))
    {
      panVelocityY = 0;
      y = this.y + dy;
    }

    if ((zoomVelocity > 0 && zoom - this.zoom <= 0)
      || (zoomVelocity < 0 && zoom - this.zoom >= 0))
    {
      zoomVelocity = 0;
      z = this.zoom + dz;
    }

    // finally, update camera position and zoom
    this.x = x;
    this.y = y;
    this.zoom = z;
  };

  // define camera viewport dimensions and allows letter-boxing with fixedAspectRatio
  this.setCustomViewportDimensions = function (width, height, fixedAspectRatio) {
    if (fixedAspectRatio) {
      backend.setLetterBoxedViewportDimensions(width, height);
    } else {
      backend.setFullScreenViewportDimensions(width, height);
    }

    // update camera viewport
    width = backend.getViewportWidth();
    height = backend.getViewportHeight();
  };
});

// singleton class
exports = new Camera();
