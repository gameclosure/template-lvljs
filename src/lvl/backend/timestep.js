import device;
import AudioManager;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import parallax.Parallax as Parallax;

var DEFAULT_WIDTH = 576;
var DEFAULT_HEIGHT = 1024;
var DEVICE_WIDTH = device.screen.width;
var DEVICE_HEIGHT = device.screen.height;

/**
 * Timestep Backend API
 */

// set view dimensions, but guarantee scale to fit full screen
exports.setFullScreenDimensions = function (width, height) {
  exports.setCustomDimensions(
    _isLandscape ? DEVICE_WIDTH * (height / DEVICE_HEIGHT) : width,
    _isLandscape ? height : DEVICE_HEIGHT * (width / DEVICE_WIDTH),
    _isLandscape ? DEVICE_HEIGHT / height : DEVICE_WIDTH / width);
};

// set view dimensions and scale, without restriction
exports.setCustomDimensions = function (width, height, scale) {
  _viewWidth = width || DEFAULT_WIDTH;
  _viewHeight = height || DEFAULT_HEIGHT;
  _viewScale = scale || 1;

  var subviews = _rootView.getSubviews();
  for (var i = 0; i < subviews.length; i++) {
    var view = subviews[i];
    view.style.x = (_rootView.style.width - _viewWidth) / 2;
    view.style.y = (_rootView.style.height - _viewHeight) / 2;
    view.style.anchorX = _viewWidth / 2;
    view.style.anchorY = _viewHeight / 2;
    view.style.width = _viewWidth;
    view.style.height = _viewHeight;
    view.style.scale = _viewScale;
  }
};

exports.addToForeground = function (resource, opts) {
  var view = exports.createViewFromResource(resource);
  foregroundView.addLayer(view, resource, opts);
};

exports.addToBackground = function (resource, opts) {
  var view = exports.createViewFromResource(resource);
  backgroundView.addLayer(view, resource, opts);
};

exports.clearForeground = function () {
  foregroundView.clearLayers();
};

exports.clearBackground = function () {
  backgroundView.clearLayers();
};

exports.createViewFromActorView = function (actorView) {
  var view = exports.createViewFromResource(actorView.resource);
  actorView._viewBacking = view;
  actorView.update(view.style);
  actorView.onUpdated = function () {
    for (var i = 0; i < arguments.length; ++i) {
      var key = arguments[i];
      view.style[key] = actorView[key];
    }
  };
};

exports.createViewFromResource = function (resource) {
  var type = resource.getType();
  var opts = resource.getVisualOpts();

  switch (type) {
    case 'sprite':
      return new SpriteView(opts);
      break;

    case 'image':
      return new ImageView(opts);
      break;

    case 'parallax':
      return new Parallax({ parent: backgroundView });
      break;

    default:
      throw new Error("Invalid Resource Type for a View: " + type);
  }
};

// TODO: these probably aren't right
exports.scrollCameraTo = function (x, y) {
  foregroundView.scrollTo(x, y);
  backgroundView.scrollTo(x, y);
};

exports.scrollCameraBy = function (dx, dy) {
  foregroundView.scrollBy(dx, dy);
  backgroundView.scrollBy(dx, dy);
};

exports.autoScrollCameraBy = function (dx, dy) {
  foregroundView.autoScrollBy(dx, dy);
  backgroundView.autoScrollBy(dx, dy);
};






// TODO: Jimmoptimize this!
// XXX: Here there be memory and cpu dragons
//      Please come clean this up, brave soul.
var viewMap = {};
var entityMap = {};

exports.stickViewToEntity = function (actorView, entity, opts) {
  var view = actorView._viewBacking;
  if (!(entity.uid in viewMap)) {
    viewMap[entity.uid] = []
  }
  viewMap[entity.uid].push(view);
  entityMap[entity.uid] = entity;
  levelView.addSubview(view);
}

function updateAllEntityViews() {
  for (var uid in viewMap) {
    var viewArray = viewMap[uid];
    entity = entityMap[uid];
    for (var i = 0; i < viewArray.length; ++i) {
      view = viewArray[i];
      view.style.x = entity.x;
      view.style.y = entity.y;
    }
  }
}

//TODO: ???
exports.onTick = function (cb) {
  GC.app.engine.on('Tick', cb);
};



var audioManagerSingleton

exports.getAudioManager = function () {
  if (!audioManagerSingleton) {
   audioManagerSingleton = new AudioManager();
  }
  return audioManagerSingleton;
}

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

var SceneryView = Class(View, function () {
  var superProto = View.prototype;

  this.init = function (type, opts) {
    superProto.init.call(this, opts);
    this.type = type;
    this.reset();
  };

  this.reset = function () {
    this._x = 0;
    this._y = 0;
    this._scrollX = 0;
    this._scrollY = 0;
    this._parallaxes = [];
  };

  this.addLayer = function (view, resource, opts) {
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
    }
  };

  this.clearLayers = function () {
    this._parallaxes.forEach(function (parallax) {
      parallax.releaseLayers();
    }, this);
    this.removeAllSubviews();
    this.reset();
  };

  this.scrollTo = function (x, y) {
    this._x = x;
    this._y = y;
  };

  this.scrollBy = function (dx, dy) {
    this._x += dx;
    this._y += dy;
  };

  this.autoScrollBy = function (dx, dy) {
    this._scrollX = dx;
    this._scrollY = dy;
  };

  this.tick = function (dt) {
    this._x += this._scrollX * dt / 1000;
    this._y += this._scrollY * dt / 1000;
    this._parallaxes.forEach(function (parallax) {
      parallax.update(this._x, this._y);
    }, this);
  };
});

var LevelView = Class(View, function () {
  var superProto = View.prototype;

  this.render = function () {
    updateAllEntityViews();
  };
});

var UIView = Class(View, function () {
  var superProto = View.prototype;
});



/**
 * Timestep Backend View Hierarchy
 */

var _rootView = GC.app.view;
var _isLandscape = DEVICE_WIDTH > DEVICE_HEIGHT;
var _viewWidth = _isLandscape ? DEFAULT_HEIGHT : DEFAULT_WIDTH;
var _viewHeight = _isLandscape ? DEFAULT_WIDTH : DEFAULT_HEIGHT;
var _viewScale;

var backgroundView = new SceneryView('background', { superview: _rootView });
var levelView = new LevelView({ superview: _rootView });
var foregroundView = new SceneryView('foreground', { superview: _rootView });
var uiView = new UIView ({ superview: _rootView });

exports.setFullScreenDimensions(_viewWidth, _viewHeight);
