import .utils;
import entities.Entity as Entity;
import entities.EntityModel as EntityModel;
import entities.EntityPool as EntityPool;

var uid = 0;
var readOnlyProp = utils.addReadOnlyProperty;
var physics;

// Entity patches
Entity.prototype.viewClass = null;
EntityModel.prototype._validate = function () { return true; };
// pool physical entities and update them each tick
var entityPool = new EntityPool();
backend.onTick(function (dt) {
  // entities expects pixels per millisecond; convert to pixels per second
  entityPool.update(dt / 1000);
});

var Actor = exports = Class("Actor", function () {
  this.init = function (resource, opts) {
    opts = applyDefaultsOpts(resource, opts);
    this.uid = this.__class__ + uid++;
    this.resource = resource;
    this.entity = entityPool.obtain(opts);
    // TODO: backend supports multiple views per actor, but this API does not
    this.view = new ActorView(resource);
    backend.createViewForActor(this);
  };

  // remove the actor from gameplay
  this.destroy = function () {
    backend.removeViewsFromActor(this);
    entityPool.release(this.entity);
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
    physics.addCollisionHandler(this, target, handler);
  };

  // TODO: this is the opposite of "collidesWith", better ideas?
  // a function to remove collision handlers between actors
  this.passesThrough = function (target) {
    physics.removeCollisionHandler(this, target);
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



var ActorView = Class("ActorView", function () {
  var ALLOWED_KEYS = {};

  this.init = function () {
    this._properties = {};
    this._propertyGetter = null;
    this._propertySetter = null;
  };

  this.onPropertyGet = function (cb) {
    this._propertyGetter = cb;
  };

  this.onPropertySet = function (cb) {
    this._propertySetter = cb;
  };

  this.update = function (opts) {
    for (var name in opts) {
      _setProperty.call(this, name, opts[name]);
    }
  };

  this.getProperties = function () {
    return this._properties;
  };

  makeProxy.call(this, 'zIndex');
  makeProxy.call(this, 'r');
  makeProxy.call(this, 'anchorX');
  makeProxy.call(this, 'anchorY');
  makeProxy.call(this, 'flipX');
  makeProxy.call(this, 'flipY');
  makeProxy.call(this, 'width');
  makeProxy.call(this, 'height');
  makeProxy.call(this, 'opacity');
  makeProxy.call(this, 'scale');
  makeProxy.call(this, 'compositeOperation');

  function makeProxy (name) {
    ALLOWED_KEYS[name] = true;
    Object.defineProperty(this, name, {
      enumerable: true,
      get: function () {
        return _getProperty.call(this, name);
      },
      set: function (value) {
        _setProperty.call(this, name, value);
      }
    });
  };

  function _getProperty (name) {
    var value = this._properties[name];
    if (value === undefined) {
      value = this._propertyGetter && this._propertyGetter(name);
    }
    return value;
  };

  function _setProperty (name, value) {
    if (ALLOWED_KEYS[name]) {
      this._properties[name] = value;
      this._propertySetter && this._propertySetter(name, value);
    }
  };
});



// TODO: global lvl API? other solution?
exports.setPhysics = function (p) { physics = p; };
