import device;
import AudioManager;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ViewPool as ViewPool;
import parallax.Parallax as Parallax;

var imageViewPool = new ViewPool({ ctor: ImageView });
var spriteViewPool = new ViewPool({ ctor: SpriteView });

var DEFAULT_WIDTH = 576;
var DEFAULT_HEIGHT = 1024;
var DEVICE_WIDTH = device.screen.width;
var DEVICE_HEIGHT = device.screen.height;

/**
 * Timestep Backend API
 */

exports.reset = function () {
  throw new Error("TODO");
};

// unscaled world-view x
exports.getViewportX = function () {
  return viewX;
};

// unscaled world-view y
exports.getViewportY = function () {
  return viewY;
};

// unscaled world-view width
exports.getViewportWidth = function () {
  return viewWidth;
};

// unscaled world-view height
exports.getViewportHeight = function () {
  return viewHeight;
};

exports.moveViewportTo = function (x, y) {
  viewX = x;
  viewY = y;

  forEachWorldView(function (view, i) {
    view.scrollTo(x, y);
  });
};

exports.moveViewportBy = function (dx, dy) {
  viewX += dx;
  viewY += dy;

  forEachWorldView(function (view, i) {
    view.scrollBy(dx, dy);
  });
};

exports.scaleViewportTo = function (s) {
  forEachWorldView(function (view, i) {
    view.scaleTo(s);
  });
};

exports.scaleViewportBy = function (ds) {
  forEachWorldView(function (view, i) {
    view.scaleBy(ds);
  });
};

exports.registerInputHandler = function (eventName, callback) {
  uiView.registerInputHandler(eventName, callback);
};

// set view dimensions, but guarantee scale to fit full screen
exports.setFullScreenViewportDimensions = function (width, height) {
  exports.setCustomViewportDimensions(
    isLandscape ? DEVICE_WIDTH * (height / DEVICE_HEIGHT) : width,
    isLandscape ? height : DEVICE_HEIGHT * (width / DEVICE_WIDTH),
    isLandscape ? DEVICE_HEIGHT / height : DEVICE_WIDTH / width,
    false);
};

// set view dimensions, contained and letter-boxed within the device
exports.setLetterBoxedViewportDimensions = function (width, height) {
  var scale = Math.min(DEVICE_WIDTH / width, DEVICE_HEIGHT / height);
  exports.setCustomViewportDimensions(width, height, scale, true);
};

// set view dimensions and scale, without restriction
exports.setCustomViewportDimensions = function (width, height, scale, clip) {
  viewWidth = width || DEFAULT_WIDTH;
  viewHeight = height || DEFAULT_HEIGHT;
  viewScale = scale || 1;

  forEachView(function (view, i) {
    view.style.x = (rootView.style.width - viewWidth) / 2;
    view.style.y = (rootView.style.height - viewHeight) / 2;
    view.style.anchorX = viewWidth / 2;
    view.style.anchorY = viewHeight / 2;
    view.style.width = viewWidth;
    view.style.height = viewHeight;
    view.style.scale = viewScale;
    view.style.clip = clip || false;
  }, this);
};

exports.addToForeground = function (resource, opts) {
  var view = exports.createViewFromResource(resource, foregroundView);
  foregroundView.add(view, resource, opts);
};

exports.addToBackground = function (resource, opts) {
  var view = exports.createViewFromResource(resource, backgroundView);
  backgroundView.add(view, resource, opts);
};

exports.clearForeground = function () {
  foregroundView.clear();
};

exports.clearBackground = function () {
  backgroundView.clear();
};

exports.startSpriteAnimation = function (actor, animation, opts) {
  var id = actor.view.__uid;
  var view = getViewByID(id);

  animation = animation || view._opts.defaultAnimation;
  opts = opts || {};

  // we use a callback to keep the sprite visible and pause on the final frame
  var callback = opts.callback;
  opts.callback = function () {
    view.pause();
    var currentAnimation = view._animations[animation];
    if (currentAnimation) {
      var frames = currentAnimation.frames;
      view.setImage(frames[frames.length - 1]);
    }
    // call the user provided callback if one exists
    callback && callback();
  };

  view.startAnimation(animation, opts);
  view.resume();
};

exports.stopSpriteAnimation = function (actor) {
  var id = actor.view.__uid;
  var view = getViewByID(id);
  view.pause();
};

exports.createViewFromResource = function (resource, parent) {
  var type = resource.getType();
  var opts = resource.getViewConfig();

  switch (type) {
    case 'sprite':
      if (opts.loop === undefined) { opts.loop = true; }
      if (opts.autoStart === undefined) { opts.autoStart = true; }
      if (opts.frameRate === undefined) { opts.frameRate = 24; }
      var sprite = spriteViewPool.obtainView(opts);
      sprite.resetAllAnimations(opts);
      sprite.__pool = spriteViewPool;
      return sprite;
      break;

    case 'image':
      var image = imageViewPool.obtainView(opts);
      image.__pool = imageViewPool;
      return image;
      break;

    case 'parallax':
      return new Parallax({ parent: parent });
      break;

    default:
      throw new Error("Invalid Resource Type for a View: " + type);
  }
};

exports.createViewForActor = function (actor) {
  var view = exports.createViewFromResource(actor.resource, levelView);
  setViewByID(view.uid, view);
  actor.view.__uid = view.uid;
  actor.view.update(view.style);
  actor.view.onPropertyGet(function (name) { return view.style[name]; });
  actor.view.onPropertySet(function (name, value) { view.style[name] = value; });
  exports.attachViewToActor(view, actor);
};

exports.attachViewToActor = function (view, actor) {
  var entity = actor.entity;
  var viewList = getViewListByEntityID(entity.uid);
  viewList.push(view);
  levelView.add(view, actor.resource);
  setEntityByViewID(view.uid, entity);
};

exports.removeViewsFromActor = function (actor) {
  var entity = actor.entity;
  var viewList = getViewListByEntityID(entity.uid);
  viewList.forEach(function (view) {
    // TODO: fix this double superview lookup, it could easily break
    var _nonParallaxRoot = view.getSuperview();
    var layer = _nonParallaxRoot.getSuperview();
    layer.remove(view);
  }, this);
  setViewListByEntityID(entity.uid, []);
};

// TODO: move these to LayerView Class ?
var viewsByID = {};
var viewListsByEntityID = {};
var entitiesByViewID = {};

function getViewByID (id) {
  return viewsByID[id];
};

function setViewByID (id, view) {
  viewsByID[id] = view;
};

function getViewListByEntityID (id) {
  var mapping = viewListsByEntityID[id];
  if (!mapping) {
    mapping = setViewListByEntityID(id, []);
  }
  return mapping;
};

function setViewListByEntityID (id, list) {
  return viewListsByEntityID[id] = list;
};

function getEntityByViewID (id) {
  return entitiesByViewID[id];
};

function setEntityByViewID (id, entity) {
  return entitiesByViewID[id] = entity;
};

// call a function each tick, drives lvl engine
exports.onTick = function (cb) {
  GC.app.engine.on('Tick', cb);
};

var audioManagerSingleton;
exports.getAudioManager = function () {
  if (!audioManagerSingleton) {
    audioManagerSingleton = new AudioManager();
  }
  return audioManagerSingleton;
};

exports.readJSON = function (url) {
  try {
    if (typeof window.CACHE[url] === 'string') {
      window.CACHE[url] = JSON.parse(window.CACHE[url]);
    }
    if (window.CACHE[url] === void 0) {
      console.error('readJSON: Unable to read file:', url);
      throw new Error('readJSON: Fail!');
    }
    return window.CACHE[url];
  } catch (e) {
    console.error('readJSON: Invalid JSON!');
    throw e;
  }
};



/**
 * Timestep Backend View Classes
 */

/**
 * LayerView
 * - a class for views that are part of the world
 * - subviews are moved to simulate camera movement
 */
var LayerView = Class(View, function () {
  var superProto = View.prototype;

  this.init = function (type, opts) {
    superProto.init.call(this, opts);
    this.type = type;
    this._reset();
    this._nonParallaxRoot = new View({
      parent: this,
      anchorX: this.style.width / 2,
      anchorY: this.style.height / 2,
      width: this.style.width,
      height: this.style.height
    });
  };

  this._reset = function () {
    this._x = 0;
    this._y = 0;
    this._scale = 1;
    this._parallaxes = [];
    this._otherViews = [];
  };

  this.add = function (view, resource, opts) {
    var type = resource.getType();
    if (type === 'parallax') {
      var config = resource.getViewConfig();
      var section = (opts && opts.section) || this.type || 'background';
      var layers = config[section];
      if (layers) {
        view.reset(layers);
        this._parallaxes.push(view);
      } else {
        throw new Error("Invalid Parallax Layers:", section, config);
      }
    } else {
      this._nonParallaxRoot.addSubview(view);
      this._otherViews.push(view);
    }
  };

  this.remove = function (view) {
    var parallaxIndex = this._parallaxes.indexOf(view);
    var otherIndex = this._otherViews.indexOf(view);
    if (parallaxIndex >= 0) {
      view.releaseLayers();
      this._parallaxes.splice(parallaxIndex, 1);
    } else if (otherIndex >= 0) {
      var entity = getEntityByViewID(view.uid);
      setEntityByViewID(view.uid, null);
      var viewList = getViewListByEntityID(entity.uid);
      var viewListIndex = viewList.indexOf(view);
      if (viewListIndex >= 0) {
        viewList.splice(viewListIndex, 1);
      }
      view.removeFromSuperview();
      view.__pool.releaseView(view);
      this._otherViews.splice(otherIndex, 1);
    }
  };

  this.clear = function () {
    for (var i = this._parallaxes.length - 1; i >= 0; i--) {
      this.remove(this._parallaxes[i]);
    }

    for (var i = this._otherViews.length - 1; i >= 0; i--) {
      this.remove(this._otherViews[i]);
    }

    this._reset();
  };

  this.scrollTo = function (x, y) {
    this._x = x;
    this._y = y;
  };

  this.scrollBy = function (dx, dy) {
    this._x += dx;
    this._y += dy;
  };

  this.scaleTo = function (s) {
    this._scale = s;
  };

  this.scaleBy = function (ds) {
    this._scale *= ds;
  };

  // update subview positions
  this.tick = function (dt) {
    // parallax update independently since layers have different relative motion
    this._parallaxes.forEach(function (parallax) {
      // TODO: should applying the scale to the position be handled by parallax?
      parallax.update(-this._x * this._scale, -this._y * this._scale, dt);
      parallax.setScale(this._scale);
    }, this);

    // non-parallax views move 1-to-1 with the world
    this._otherViews.forEach(function (view) {
      var entity = getEntityByViewID(view.uid);
      if (entity) {
        view.style.x = entity.x - this._x;
        view.style.y = entity.y - this._y;
      } else {
        view.style.x = -this._x;
        view.style.y = -this._y;
      }
    }, this);

    this._nonParallaxRoot.style.anchorX = this.style.width / 2;
    this._nonParallaxRoot.style.anchorY = this.style.height / 2;
    this._nonParallaxRoot.style.width = this.style.width;
    this._nonParallaxRoot.style.height = this.style.height;
    this._nonParallaxRoot.style.scale = this._scale;
  };
});

/**
 * UIView
 * - a class for static UI rendered on top of all game elements
 * - subviews are unafffected by camera movement
 */
var UIView = Class(View, function () {
  var superProto = View.prototype;

  this.init = function (opts) {
    superProto.init.call(this, opts);
    this._reset();
  };

  this._reset = function () {
    // TODO: support mouse over and other events?
    this.inputStartHandlers = [];
    this.inputMoveHandlers = [];
    this.inputStopHandlers = [];
  };

  this.clear = function () {
    // TODO: this.removeAllSubviews() ... recycle into pools
    this._reset();
  };

  this.onInputStart = function (startEvent, startPoint) {
    for (var i = 0; i < this.inputStartHandlers.length; i++) {
      var handler = this.inputStartHandlers[i];
      var pt = startEvent.pt[this.uid] || startPoint;
      handler('touchstart', {
        x: pt.x,
        y: pt.y,
        id: startEvent.id
      });
    }
    this.startDrag();
  };

  this.onDragStart = function (dragEvent) {};

  // used instead of onInputMove, which fires on mouse over
  this.onDrag = function (dragEvent, moveEvent, delta) {
    for (var i = 0; i < this.inputMoveHandlers.length; i++) {
      var handler = this.inputMoveHandlers[i];
      var pt = moveEvent.pt[this.uid] || dragEvent.localPt;
      handler('touchmove', {
        x: pt.x,
        y: pt.y,
        id: moveEvent.id
      });
    }
  };

  // fires instead of onInputSelect when dragging
  this.onDragStop = function (dragEvent, stopEvent) {
    for (var i = 0; i < this.inputStopHandlers.length; i++) {
      var handler = this.inputStopHandlers[i];
      var pt = stopEvent.pt[this.uid] || dragEvent.localPt;
      handler('touchend', {
        x: pt.x,
        y: pt.y,
        id: stopEvent.id
      });
    }
  };

  // fires on mouse over and on drag, ignore for now
  this.onInputMove = function () {};

  // fires instead of onDragStop when tapping
  this.onInputSelect = function (stopEvent, stopPoint) {
    for (var i = 0; i < this.inputStopHandlers.length; i++) {
      var handler = this.inputStopHandlers[i];
      var pt = stopEvent.pt[this.uid] || stopPoint;
      handler('touchend', {
        x: pt.x,
        y: pt.y,
        id: stopEvent.id
      });
    }
  };

  this.registerInputHandler = function (eventName, callback) {
    switch (eventName) {
      case 'touchstart':
        this.inputStartHandlers.push(callback);
        break;

      case 'touchend':
        this.inputStopHandlers.push(callback);
        break;

      case 'touchmove':
        this.inputMoveHandlers.push(callback);
        break;

      default:
        throw new Error("Timestep backend, unhandled input event:", eventName);
    }
  };
});



/**
 * Timestep Backend View Hierarchy
 */

var rootView = GC.app.view;
var isLandscape = DEVICE_WIDTH > DEVICE_HEIGHT;
var viewX = 0;
var viewY = 0;
var viewWidth = isLandscape ? DEFAULT_HEIGHT : DEFAULT_WIDTH;
var viewHeight = isLandscape ? DEFAULT_WIDTH : DEFAULT_HEIGHT;
var viewScale;

var backgroundView = new LayerView('background', { superview: rootView });
var levelView = new LayerView('level', { superview: rootView });
var foregroundView = new LayerView('foreground', { superview: rootView });
var uiView = new UIView ({ superview: rootView });

exports.setFullScreenViewportDimensions(viewWidth, viewHeight);

// update the scenery and level views
function forEachWorldView (fn, ctx) {
  var subviews = rootView.getSubviews();
  for (var i = 0; i < subviews.length; i++) {
    var view = subviews[i];
    if (view !== uiView) {
      fn.call(this, view, i);
    }
  }
};

// update all views including the ui
function forEachView (fn, ctx) {
  var subviews = rootView.getSubviews();
  for (var i = 0; i < subviews.length; i++) {
    var view = subviews[i];
    fn.call(this, view, i);
  }
};
