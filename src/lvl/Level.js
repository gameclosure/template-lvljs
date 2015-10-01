import animate;

// XXX: TODO: FIXME: COMPILER BUG
jsio('import .resource', { context: { backend: backend } });
jsio('import .resource');
jsio('import .sound', { context: { backend: backend } });
jsio('import .sound');
jsio('import .shape', { context: { backend: backend } });
jsio('import .shape');
jsio('import .util', { context: { backend: backend } });
jsio('import .util');
jsio('import .Actor', { context: { backend: backend } });
jsio('import .Actor');
jsio('import .Scenery', { context: { backend: backend } });
jsio('import .Scenery');
jsio('import .UI', { context: { backend: backend } });
jsio('import .UI');
jsio('import .Camera', { context: { backend: backend } });
jsio('import .Camera');
jsio('import .Input', { context: { backend: backend } });
jsio('import .Input');
jsio('import .Input', { context: { backend: backend } });
jsio('import .Input');
jsio('import .Physics', { context: { backend: backend } });
jsio('import .Physics');



var Level = Class("Level", function () {
  var lvl;

  this.init = function () {
    lvl = this;

    // attach library modules
    this.resource = resource;
    this.sound = sound;
    this.shape = shape;
    this.util = util;

    // attach special class instances and singletons
    this.bg = new Scenery('background');
    this.fg = new Scenery('foreground');
    this.ui = UI;
    this.camera = Camera;
    this.input = Input;
    this.physics = Physics;
    Actor.setPhysics(this.physics);

    // reset lvl state
    this.reset();

    // update screen bounds as camera moves
    backend.onTick(updateScreenBounds);
  };

  this.reset = function () {
    // always reset backend first
    backend.reset();

    // reset all stateful classes
    this.bg.reset();
    this.fg.reset();
    this.ui.reset();
    this.camera.reset();
    this.input.reset();
    this.physics.reset();

    // group cache
    this.groups = {};

    // collideable bounds that stick to the screen (camera viewport edges)
    this.bounds = {};
    this.bounds.screenTop = shape.createRect({ fixed: true });
    this.bounds.screenRight = shape.createRect({ fixed: true });
    this.bounds.screenBottom = shape.createRect({ fixed: true });
    this.bounds.screenLeft = shape.createRect({ fixed: true });
    updateScreenBounds();

    // add easy default shortcuts for screen bounds events
    this.physics.createEventHandlerShortcut('top', this.bounds.screenTop);
    this.physics.createEventHandlerShortcut('right', this.bounds.screenRight);
    this.physics.createEventHandlerShortcut('bottom', this.bounds.screenBottom);
    this.physics.createEventHandlerShortcut('left', this.bounds.screenLeft);
  };

  this.addActor = function (resource, opts) {
    var type = resource.getType();
    if (type === 'sprite' || type === 'image') {
      var actor = new Actor(resource, opts);
      var group = opts && opts.group;
      if (typeof group === 'string') {
        group = this.groups[group] || this.addGroup(group);
      }
      group && group.add(actor);
      return actor;
    } else {
      throw new Error("Invalid Resource Type for Actor:", type);
    }
  };

  this.addGroup = function (uid) {
    if (uid === undefined) {
      uid = "Group" + groupUID++;
    }
    if (this.groups[uid]) {
      throw new Error("A Group already exists with unique ID:", uid);
    }
    return this.groups[uid] = new Group(uid);
  };

  this.addParallax = function (resource) {
    throw new Error("TODO");
  };

  // TODO: devkit should limit global tick to ~100 ms max! BIG TICKS BREAK STUFF
  // TODO: track and clear all animations on reset?
  // TODO: Object.defineProp animatableProperties on classes like camera
  this.animate = animate;

  this.setTimeout = function (callback, duration) {
    var timer = new EventTimer(callback, duration, 'timeout');
    return timer.uid;
  };

  this.clearTimeout = function (id) {
    var timer = timers[id];
    timer && timer.unregister();
  };

  this.setInterval = function (callback, duration) {
    var timer = new EventTimer(callback, duration, 'interval');
    return timer.uid;
  };

  this.clearInterval = function (id) {
    var timer = timers[id];
    timer && timer.unregister();
  };

  // ordered by zIndex, top-most first
  this.getActorsAtScreenPosition = function (x, y) {
    throw new Error("TODO");
  };

  function updateScreenBounds () {
    var x = lvl.camera.getViewportX();
    var y = lvl.camera.getViewportY();
    var w = lvl.camera.getViewportWidth();
    var h = lvl.camera.getViewportHeight();

    lvl.bounds.screenTop.x = x - w;
    lvl.bounds.screenTop.y = y - h;
    lvl.bounds.screenTop.width = 3 * w;
    lvl.bounds.screenTop.height = h;

    lvl.bounds.screenRight.x = x + w;
    lvl.bounds.screenRight.y = y - h;
    lvl.bounds.screenRight.width = w;
    lvl.bounds.screenRight.height = 3 * h;

    lvl.bounds.screenBottom.x = x - w;
    lvl.bounds.screenBottom.y = y + h;
    lvl.bounds.screenBottom.width = 3 * w;
    lvl.bounds.screenBottom.height = h;

    lvl.bounds.screenLeft.x = x - w;
    lvl.bounds.screenLeft.y = y - h;
    lvl.bounds.screenLeft.width = w;
    lvl.bounds.screenLeft.height = 3 * h;
  };
});

// singleton Level API
exports = new Level();



// update timers each tick
var timerUID = 0;
var timers = {};
backend.onTick(function (dt) {
  for (var key in timers) {
    timers[key].tick(dt);
  }
});

// event timer class for tracking setTimeout, setInterval etc.
var EventTimer = Class("EventTimer", function () {
  this.init = function (callback, duration, type) {
    this.callback = callback;
    this.duration = duration;
    this.type = type;
    this.elapsed = 0;
    this.uid = timerUID++;
    this.register();
  };

  this.register = function () {
    timers[this.uid] = this;
    return this.uid;
  };

  this.unregister = function () {
    delete timers[this.uid];
  };

  this.tick = function (dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.callback();
      if (this.type === 'interval') {
        this.elapsed -= this.duration;
      } else {
        this.unregister();
      }
    }
  };
});



// Group Class for easily managing sets of actors simultaneously
var groupUID = 0;
var Group = Class("Group", function () {
  this.init = function (uid) {
    this.uid = uid;
    this.actors = [];
  };

  this.reset = function () {
    this.actors.length = 0;
  };

  this.add = function (actor) {
    if (actor.__class__ !== "Actor") {
      throw new Error("Groups only accept instances of Actor as members!");
    }
    actor.group = this;
    this.actors.push(actor);
  };

  this.remove = function (actor) {
    var index = this.actors.indexOf(actor);
    if (index >= 0) {
      this.actors.splice(index, 1);
    }
  };

  this.collidesWith = function (target, handler) {
    lvl.physics.addCollisionHandler(this, target, handler);
  };

  this.cancelCollidesWith = function (target) {
    lvl.physics.removeCollisionHandler(this, target);
  };

  this.forEach = function (fn, ctx) {
    var actors = this.actors;
    for (var i = actors.length - 1; i >= 0; i--) {
      fn.call(ctx, actors[i], i);
    }
  };
});
