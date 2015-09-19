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

exports.getViewportWidth = function () {
  return _viewWidth;
};

exports.getViewportHeight = function () {
  return _viewHeight;
};

exports.moveViewportTo = function (x, y) {
  forEachWorldView(function (view, i) {
    view.scrollTo(x, y);
  });
};

exports.moveViewportBy = function (dx, dy) {
  forEachWorldView(function (view, i) {
    view.scrollBy(dx, dy);
  });
};

// TODO: the camera should probably control this
// set view dimensions, but guarantee scale to fit full screen
exports.setFullScreenDimensions = function (width, height) {
  exports.setCustomDimensions(
    _isLandscape ? DEVICE_WIDTH * (height / DEVICE_HEIGHT) : width,
    _isLandscape ? height : DEVICE_HEIGHT * (width / DEVICE_WIDTH),
    _isLandscape ? DEVICE_HEIGHT / height : DEVICE_WIDTH / width);
};

// TODO: the camera should probably control this
// set view dimensions and scale, without restriction
exports.setCustomDimensions = function (width, height, scale) {
  _viewWidth = width || DEFAULT_WIDTH;
  _viewHeight = height || DEFAULT_HEIGHT;
  _viewScale = scale || 1;

  forEachView(function (view, i) {
    view.style.x = (_rootView.style.width - _viewWidth) / 2;
    view.style.y = (_rootView.style.height - _viewHeight) / 2;
    view.style.anchorX = _viewWidth / 2;
    view.style.anchorY = _viewHeight / 2;
    view.style.width = _viewWidth;
    view.style.height = _viewHeight;
    view.style.scale = _viewScale;
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

exports.createViewFromResource = function (resource, parent) {
  var type = resource.getType();
  var opts = resource.getVisualOpts();

  switch (type) {
    case 'sprite':
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
  var view = exports.createViewFromResource(actor.view.resource, levelView);
  actor.view._viewBacking = view;
  actor.view.update(view.style);
  actor.view.onPropertyGet(function (name) { return view.style[name]; });
  actor.view.onPropertySet(function (name, value) { view.style[name] = value; });
  exports.attachViewToActor(view, actor);
};

exports.attachViewToActor = function (view, actor) {
  var entity = actor.entity;
  var viewList = getViewListByEntityID(entity.uid);
  viewList.push(view);
  levelView.add(view, actor.view.resource);
  setEntityByViewID(view.uid, entity);
};

exports.removeViewsFromActor = function (actor) {
  var entity = actor.entity;
  var viewList = getViewListByEntityID(entity.uid);
  viewList.forEach(function (view) {
    var superview = view.getSuperview();
    superview.remove(view);
  }, this);
  setViewListByEntityID(entity.uid, []);
};

// TODO: move these to LayerView Class ?
var _viewMap = {};
var _entityMap = {};

function getViewListByEntityID (id) {
  var mapping = _viewMap[id];
  if (!mapping) {
    mapping = setViewListByEntityID(id, []);
  }
  return mapping;
};

function setViewListByEntityID (id, list) {
  return _viewMap[id] = list;
};

function getEntityByViewID (id) {
  return _entityMap[id];
};

function setEntityByViewID (id, entity) {
  return _entityMap[id] = entity;
};

// TODO: track and remove subscriptions?
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
  };

  this._reset = function () {
    this._x = 0;
    this._y = 0;
    this._parallaxes = [];
    this._otherViews = [];
  };

  this.add = function (view, resource, opts) {
    var type = resource.getType();
    if (type === 'parallax') {
      var config = resource.getVisualOpts();
      var section = (opts && opts.section) || this.type || 'background';
      var layers = config[section];
      if (layers) {
        view.reset(layers);
        this._parallaxes.push(view);
      } else {
        throw new Error("Invalid Parallax Layers:", section, config);
      }
    } else {
      this.addSubview(view);
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

  // update subview positions
  this.tick = function (dt) {
    // parallax update independently since layers have different relative motion
    this._parallaxes.forEach(function (parallax) {
      parallax.update(-this._x, -this._y);
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
  };
});

/**
 * UIView
 * - a class for static UI rendered on top of all game elements
 * - subviews are unafffected by camera movement
 */
var UIView = Class(View, function () {
  var superProto = View.prototype;

  // TODO: write UIView
});



/**
 * Timestep Backend View Hierarchy
 */

var _rootView = GC.app.view;
var _isLandscape = DEVICE_WIDTH > DEVICE_HEIGHT;
var _viewWidth = _isLandscape ? DEFAULT_HEIGHT : DEFAULT_WIDTH;
var _viewHeight = _isLandscape ? DEFAULT_WIDTH : DEFAULT_HEIGHT;
var _viewScale;

var backgroundView = new LayerView('background', { superview: _rootView });
var levelView = new LayerView('level', { superview: _rootView });
var foregroundView = new LayerView('foreground', { superview: _rootView });
var uiView = new UIView ({ superview: _rootView });

exports.setFullScreenDimensions(_viewWidth, _viewHeight);

// update the scenery and level views
function forEachWorldView (fn, ctx) {
  var subviews = _rootView.getSubviews();
  for (var i = 0; i < subviews.length; i++) {
    var view = subviews[i];
    if (view !== uiView) {
      fn.call(this, view, i);
    }
  }
};

// update all views including the ui
function forEachView (fn, ctx) {
  var subviews = _rootView.getSubviews();
  for (var i = 0; i < subviews.length; i++) {
    var view = subviews[i];
    fn.call(this, view, i);
  }
};
