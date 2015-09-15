import AudioManager;
import ui.View;
import ui.SpriteView;
var app = GC.app;

// setup code
var rootView = GC.app.view;

var backgroundView = new ui.View({
  superview: GC.app.view,
  zIndex: 1,
  width: rootView.style.width,
  height: rootView.style.height
});

var LevelView = Class(ui.View, function (supr) {
  this.render = function () {
    // update our views which are stuck to entities
    updateAllEntityViews();
  }
});

var levelView = new LevelView({
  superview: rootView,
  zIndex: 2,
  width: rootView.style.width,
  height: rootView.style.height
})

var foregroundView = new ui.View({
  superview: GC.app.view,
  zIndex: 3,
  width: rootView.style.width,
  height: rootView.style.height
})

exports.addBackgroundLayer = function (rsrc, opts) {
  //TODO: opts? expose zindexs? something?
  var view = exports.createViewFromResource(rsrc);
  backgroundView.addSubview(view);
}

exports.clearBackground = function () {
  backgroundView.removeAllSubviews();
}

exports.createViewFromActorView = function (actorView) {
  var view = exports.createViewFromResource(actorView.resource);
  actorView._viewBacking = view;
  actorView.update(view.style);
  actorView.onUpdated = function () {
    // one key updated
    for (var i = 0; i < arguments.length; ++i) {
      var key = arguments[i];
      view.style[key] = actorView[key]
    }
  };
//  exports.stickViewToEntity(view, 
}

exports.createViewFromResource = function (resource) {
    switch(resource.getType()) {
      case 'sprite':
        return new ui.SpriteView(resource.getVisualOpts());
        break;
      case 'image':
        break;
      case 'parallax':
        break;
    // resource is type 'sprite', 'image', or 'parallax'
    }
  throw new Error("invalid resource type for a View: " + resource.getType());
}

// TODO: Jimmoptimize this!
// XXX: Here there be memory and cpu dragons
//      Please come clean this up, brave soul.
var viewMap = {}
var entityMap = {}

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
}




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

