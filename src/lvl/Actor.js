import .utils;
import .View;
import entities.Entity as Entity;
import entities.EntityModel as EntityModel;
import entities.EntityPool as EntityPool;

var uid = 0;
var readOnlyProp = utils.addReadOnlyProperty;

// Entity patches
Entity.prototype.viewClass = null;
EntityModel.prototype._validate = function () { return true; };
// pool physical entities and update them each tick
var entityPool = new EntityPool();
backend.onTick(function (dt) {
  // entities expects pixels per millisecond; convert to pixels per second
  entityPool.update(dt / 1000);
});
// patch EntityModel update to Actor update
var entityModelUpdate = EntityModel.prototype.update;

var Actor = exports = Class("Actor", function () {
  this.init = function (resource, opts) {
    opts = applyDefaultsOpts(resource, opts);
    this.uid = this.__class__ + uid++;
    this.resource = resource;
    this.entity = entityPool.obtain(opts);
    this.entity.model.update = bind(this, updateActor);
    // TODO: backend supports multiple views per actor, but this API does not
    this.view = new ActorView(resource);
    backend.createViewForActor(this);
  };

  // remove the actor from gameplay
  this.destroy = function () {
    this.group && this.group.remove(this);
    backend.removeViewsFromActor(this);
    entityPool.release(this.entity);
    var lvl = window.getLvlAPI();
    lvl.physics.removeAllEventHandlersFromSubject(this);
  };

  // have this actor follow a target actor through the world
  this.follow = function (target, opts) {
    throw new Error("TODO");
  };

  // stop following current actor
  this.stopFollowing = function() {
    throw new Error("TODO");
  };

  // start one of the actor's sprite animations
  this.startSprite = function (animation, opts) {
    if (this.resource.getType() !== 'sprite') {
      throw new Error("This Actor was not created with a sprite resource!");
    }
    backend.startSpriteAnimation(this, animation, opts);
  };

  // stop the actor's sprite animations
  this.stopSprite = function () {
    if (this.resource.getType() !== 'sprite') {
      throw new Error("This Actor was not created with a sprite resource!");
    }
    backend.stopSpriteAnimation(this);
  };

  // this actor checks each tick to see if it collides with target
  this.collidesWith = function (target, handler) {
    var lvl = window.getLvlAPI();
    lvl.physics.addCollisionHandler(this, target, handler);
  };

  // a function to cancel collision handlers between actors
  this.cancelCollidesWith = function (target) {
    var lvl = window.getLvlAPI();
    lvl.physics.removeCollisionHandler(this, target);
  };

  // XXX: These are all just literally pasted from Entity for now.

  // expose x position
  Object.defineProperty(this, 'x', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.x; },
    set: function (value) { this.entity.x = value; }
  });

  // expose y position
  Object.defineProperty(this, 'y', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.y; },
    set: function (value) { this.entity.y = value; }
  });

  // expose read-only previous x position
  readOnlyProp(this, 'previousX', function () { return this.entity.previousX; });

  // expose read-only previous y position
  readOnlyProp(this, 'previousY', function () { return this.entity.previousY; });

  // expose x velocity
  Object.defineProperty(this, 'vx', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.vx; },
    set: function (value) { this.entity.vx = value; }
  });

  // expose y velocity
  Object.defineProperty(this, 'vy', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.vy; },
    set: function (value) { this.entity.vy = value; }
  });

  // expose x acceleration
  Object.defineProperty(this, 'ax', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.ax; },
    set: function (value) { this.entity.ax = value; }
  });

  // expose y acceleration
  Object.defineProperty(this, 'ay', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.ay; },
    set: function (value) { this.entity.ay = value; }
  });

  // expose hit bounds width
  Object.defineProperty(this, 'width', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.width; },
    set: function (value) { this.entity.width = value; }
  });

  // expose hit bounds height
  Object.defineProperty(this, 'height', {
   enumerable: true,
   configurable: true,
   get: function () { return this.entity.height; },
   set: function (value) { this.entity.height = value; }
  });

  // if fixed is true, collisions cannot move the actor
  Object.defineProperty(this, 'fixed', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.fixed; },
    set: function (value) { this.entity.fixed = value; }
  });

  function updateActor (dt) {
    entityModelUpdate.call(this.entity.model, dt);

    // TODO: Actor update outside of entities?
  };

  function applyDefaultsOpts (resource, opts) {
    opts = opts || {};

    // TODO: allow actual instance of shape to be passed in opts
    var shapeConfig = merge(opts.shape, resource.getShapeConfig());

    // default position to the center of the screen
    if (opts.x === undefined && shapeConfig.x === undefined) {
      opts.x = backend.getViewportX() + backend.getViewportWidth() / 2;
    }
    if (opts.y === undefined && shapeConfig.y === undefined) {
      opts.y = backend.getViewportY() + backend.getViewportHeight() / 2;
    }

    // EntityModel expects hitOpts
    opts.hitOpts = shapeConfig;

    return opts;
  };
});



var ActorView = Class("ActorView", View, function () {
  var superProto = View.prototype;

  this.init = function () {
    superProto.init.call(this);

    // TODO: extend View specifically for Actors if needed
  };
});
