import AudioManager;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import parallax.Parallax as Parallax;

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



/**
 * Timestep Backend View Hierarchy Singletons
 */

var rootView = GC.app.view;

var backgroundView = new SceneryView('background', {
  superview: rootView,
  width: rootView.style.width,
  height: rootView.style.height
});

var levelView = new LevelView({
  superview: rootView,
  width: rootView.style.width,
  height: rootView.style.height
});

var foregroundView = new SceneryView('foreground', {
  superview: rootView,
  width: rootView.style.width,
  height: rootView.style.height
});



/**
 * Timestep Backend API
 */

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

