import device;
import AudioManager;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ScoreView as ScoreView;
import ui.ViewPool as ViewPool;
import ui.resource.loader as loader;
import ui.effectsEngine as effectsEngine;
import parallax.Parallax as Parallax;
var imageMap = loader.getMap();

var imageViewPool = new ViewPool({ ctor: ImageView });
var spriteViewPool = new ViewPool({ ctor: SpriteView });
var scoreViewPool = new ViewPool({ ctor: ScoreView });

var DEFAULT_WIDTH = 576;
var DEFAULT_HEIGHT = 1024;
var DEVICE_WIDTH = device.screen.width;
var DEVICE_HEIGHT = device.screen.height;

var rootView = GC.app.view;
var isLandscape = DEVICE_WIDTH > DEVICE_HEIGHT;

var viewX;
var viewY;
var viewWidth;
var viewHeight;
var viewScale;

/**
 * Timestep Backend API
 */

// reset the backend state, recycle views etc
exports.reset = function () {
  var lvl = window.getLvlAPI();
  rootView.style.layout = "";
  rootView.style.inLayout = false;

  viewX = 0;
  viewY = 0;
  viewWidth = isLandscape ? DEFAULT_HEIGHT : DEFAULT_WIDTH;
  viewHeight = isLandscape ? DEFAULT_WIDTH : DEFAULT_HEIGHT;
  viewScale = 1;

  backgroundView.reset();
  levelView.reset();
  foregroundView.reset();
  uiView.reset();

  attachProxyToView(lvl.root, rootView);
  attachProxyToView(lvl.bg, backgroundView);
  attachProxyToView(lvl.view, levelView);
  attachProxyToView(lvl.fg, foregroundView);
  attachProxyToView(lvl.ui, uiView);

  exports.setFullScreenViewportDimensions(viewWidth, viewHeight);
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

// move the world views (from lvl.camera.x and y)
exports.moveViewportTo = function (x, y) {
  viewX = x;
  viewY = y;

  forEachWorldView(function (view, i) {
    view.scrollTo(x, y);
  });
};

// move the world views (from lvl.camera.x and y)
exports.moveViewportBy = function (dx, dy) {
  viewX += dx;
  viewY += dy;

  forEachWorldView(function (view, i) {
    view.scrollBy(dx, dy);
  });
};

// scale the world views (from lvl.camera.zoom)
exports.scaleViewportTo = function (s) {
  forEachWorldView(function (view, i) {
    view.scaleTo(s);
  });
};

// multiplicatively scale the world views (from lvl.camera.zoom)
exports.scaleViewportBy = function (ds) {
  forEachWorldView(function (view, i) {
    view.scaleBy(ds);
  });
};

// lvl.input registers handlers in the backend
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

exports.addToUI = function (proxy, resource, opts) {
  var view = exports.createViewFromResource(resource, uiView, opts);
  uiView.add(view, resource, opts);
  attachProxyToView(proxy, view);
  return view.uid;
};

exports.addToForeground = function (resource, opts) {
  var view = exports.createViewFromResource(resource, foregroundView, opts);
  foregroundView.add(view, resource, opts);
};

exports.addToBackground = function (resource, opts) {
  var view = exports.createViewFromResource(resource, backgroundView, opts);
  backgroundView.add(view, resource, opts);
};

exports.clearUI = function () {
  uiView.reset();
};

exports.clearForeground = function () {
  foregroundView.reset();
};

exports.clearBackground = function () {
  backgroundView.reset();
};

exports.updateUI = function (proxy, method, opts) {
  var view = uiView.getViewByID(proxy.__uid);
  switch (method) {
    case 'setText':
      view.setText('' + opts.text || '');
      break;

    default:
      throw new Error("No such UI method implemented in backend", method);
  }
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

exports.emitParticleEffect = function (resource, x, y, opts) {
  var view = null;
  var proxy = opts.layer;
  switch (proxy.__uid) {
    case backgroundView.uid:
      view = backgroundView;
      break;

    case levelView.uid:
      view = levelView;
      break;

    case foregroundView.uid:
      view = foregroundView;
      break;

    case uiView.uid:
      view = uiView;
      break;

    default:
      throw new Error("TODO: attach effects to arbitrary actors via view proxy");
  }

  effectsEngine.emitEffectsFromData(resource.getOpts(), merge({
    superview: view,
    x: x,
    y: y
  }, opts));
};

exports.createViewFromResource = function (resource, parent, opts) {
  opts = merge(opts, resource.getViewConfig());
  var type = resource.getType();
  var view = null;

  // default opts help reset pooled views
  opts.x = opts.x || 0;
  opts.y = opts.y || 0;
  opts.zIndex = opts.zIndex || 0;
  opts.r = opts.r || 0;
  opts.offsetX = opts.offsetX || 0;
  opts.offsetY = opts.offsetY || 0;
  opts.anchorX = opts.anchorX || 0;
  opts.anchorY = opts.anchorY || 0;
  opts.width = opts.width || 0;
  opts.height = opts.height || 0;
  opts.scale = opts.scale !== undefined ? opts.scale : 1;
  opts.scaleX = opts.scaleX !== undefined ? opts.scaleX : 1;
  opts.scaleY = opts.scaleY !== undefined ? opts.scaleY : 1;
  opts.opacity = opts.opacity !== undefined ? opts.opacity : 1;
  opts.flipX = opts.flipX || false;
  opts.flipY = opts.flipY || false;
  opts.compositeOperation = opts.compositeOperation || '';

  switch (type) {
    case 'sprite':
      if (opts.loop === undefined) { opts.loop = true; }
      if (opts.autoStart === undefined) { opts.autoStart = true; }
      if (opts.frameRate === undefined) { opts.frameRate = 24; }
      view = spriteViewPool.obtainView(opts);
      view.resetAllAnimations(opts);
      view.__pool = spriteViewPool;
      break;

    case 'image':
      var view = imageViewPool.obtainView(opts);
      view.setImage(opts.image || opts.url);
      view.__pool = imageViewPool;
      break;

    case 'imageText':
      var view = scoreViewPool.obtainView(opts);
      view._spacing = opts.spacing || 0;
      view._horizontalAlign = opts.horizontalAlign || opts.textAlign || 'center';
      view._verticalAlign = opts.verticalAlign || 'middle';
      view.setCharacterData(opts.characterData);
      view.__pool = scoreViewPool;
      break;

    case 'parallax':
      view = new Parallax({ parent: parent });
      break;

    default:
      throw new Error("Invalid Resource Type for a View: " + type);
  }
  return view;
};

exports.createViewForActor = function (actor) {
  var view = exports.createViewFromResource(actor.resource, levelView);
  setViewByID(view.uid, view);
  attachProxyToView(actor.view, view);
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

// allow the backend to apply nice defaults
exports.applyDefaultImageOpts = function (opts) {
  var shape = opts.shape;
  var view = opts.view;
  if (view) {
    applyDefaultImageDimensions(view, view.image || view.url);
    // width and height will cause radius to be ignored so don't set for circles
    if (shape && !shape.radius) {
      applyDefaultImageDimensions(shape, view.image || view.url);
    }
  }
  return opts;
};

exports.applyDefaultImageTextOpts = function (opts) {
  var view = opts.view;
  var characters = view && view.characters;
  if (characters) {
    characters = merge({}, characters);
    for (var key in characters) {
      characters[key] = {
        image: characters[key]
      };
    }
    view.characterData = characters;
  }
  return opts;
};

// copied from devkit-entities, this fn applies image dimensions as defaults
function applyDefaultImageDimensions (opts, url) {
  if (!opts || !url) {
    return opts;
  }

  // First check if sprite animation exists
  var map;
  var spriteData = SpriteView.allAnimations[url];
  if (spriteData) {
    // Grab the first animation frame
    for (var prop in spriteData) {
      map = spriteData[prop][0];
      break;
    }
  } else {
    map = imageMap[url];
  }

  // auto-size based on provided width and/or height
  if (map) {
    var imgWidth = map.w + map.marginLeft + map.marginRight;
    var imgHeight = map.h + map.marginTop + map.marginBottom;
    if (!opts.width && !opts.height) {
      opts.width = imgWidth;
      opts.height = imgHeight;
    } else if (!opts.width) {
      var scale = opts.height / imgHeight;
      opts.width = scale * imgWidth;
    } else if (!opts.height) {
      var scale = opts.width / imgWidth;
      opts.height = scale * imgHeight;
    }
  }

  return opts;
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

    this._x = 0;
    this._y = 0;
    this._scale = 1;
    this.type = type;
    this._parallaxes = [];
    this._otherViews = [];

    this._nonParallaxRoot = new View({
      parent: this,
      anchorX: this.style.width / 2,
      anchorY: this.style.height / 2,
      width: this.style.width,
      height: this.style.height
    });
  };

  this.reset = function () {
    for (var i = this._parallaxes.length - 1; i >= 0; i--) {
      this.remove(this._parallaxes[i]);
    }

    for (var i = this._otherViews.length - 1; i >= 0; i--) {
      this.remove(this._otherViews[i]);
    }

    this._x = 0;
    this._y = 0;
    this._scale = 1;
  };

  this.add = function (view, resource, opts) {
    opts = opts || {};
    var type = resource.getType();
    if (type === 'parallax') {
      var config = resource.getViewConfig();
      var section = opts.section || this.type || 'background';
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

    this._uiViews = [];
    this.reset();
  };

  this.reset = function () {
    for (var i = this._uiViews.length - 1; i >= 0; i--) {
      this.remove(this._uiViews[i]);
    }

    // TODO: support mouse over and other events?
    this.inputStartHandlers = [];
    this.inputMoveHandlers = [];
    this.inputStopHandlers = [];
  };

  this.add = function (view, resource, opts) {
    this.addSubview(view);
    this._uiViews.push(view);

    // TODO: differentiate between TextView and ScoreView alignment props?
    switch (opts.horizontalAlign || opts.hAlign) {
      case 'left':
        view.style.x = 0;
        break;

      case 'center':
      case 'middle':
        view.style.x = (this.style.width - view.style.width) / 2;
        break;

      case 'right':
        view.style.x = this.style.width - view.style.width;
        break;
    }

    switch (opts.verticalAlign || opts.vAlign) {
      case 'top':
        view.style.y = 0;
        break;

      case 'center':
      case 'middle':
        view.style.y = (this.style.height - view.style.height) / 2;
        break;

      case 'bottom':
        view.style.y = this.style.height - view.style.height;
        break;
    }
  };

  this.remove = function (view) {
    var index = this._uiViews.indexOf(view);
    if (index >= 0) {
      view.removeFromSuperview();
      view.__pool.releaseView(view);
      this._uiViews.splice(index, 1);
    }
  };

  this.getViewByID = function (uid) {
    var view = null;
    this._uiViews.forEach(function (v) {
      if (v.uid === uid) {
        view = v;
      }
    }, this);

    if (!view) {
      throw new Error("No UI View found for uid", uid);
    }
    return view;
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



// attach a timestep backend view to the proxy view API exposed to devs
function attachProxyToView (proxy, view) {
  proxy.__uid = view.uid;
  proxy.onPropertyGet(function (name) { return view.style[name]; });
  proxy.onPropertySet(function (name, value) { view.style[name] = value; });
};

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



/**
 * Timestep Backend View Hierarchy
 */

var backgroundView = new LayerView('background', { superview: rootView });
var levelView = new LayerView('level', { superview: rootView });
var foregroundView = new LayerView('foreground', { superview: rootView });
var uiView = new UIView ({ superview: rootView });
