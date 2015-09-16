import entities.Entity as Entity;
import entities.EntityPool;

//monkey patch the Entity to have no view
Entity.prototype.viewClass = null;
var pool;

exports = Class("Actor", function () {
  var _backend;

  this.init = function (backend, resource, geometryOverrides) {
    _backend = backend;

    // TODO: clean this up
    if (!pool) {
      pool = new entities.EntityPool({ ctor: Entity });
      _backend.onTick(bind(pool, "update"));
    }

    var geoOpts = merge(geometryOverrides, resource.getOpts().geometry);
    this.entity = pool.obtain({ hitOpts: geoOpts });
    this.view = new ActorView(resource);
    _backend.createViewFromActorView(this.view);
    _backend.stickViewToEntity(this.view, this.entity);
  };

  // remove the actor from gameplay
  this.destroy = function () {
    backend.unregisterView(this.view);
    pool.release(this.entity);
  };

  // XXX: These are all just literally pasted from Entity for now.
  function readOnlyProp(ctx, name, getter) {
    Object.defineProperty(ctx, name, {
      enumerable: true,
      configurable: true,
      get: getter,
      set: function () {
        var ctxName = this.name ? this.name + " " : "";
        throw new Error(ctxName + name + " is read-only!");
      }
    });
  }

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

  // expose the model's fixed property
  Object.defineProperty(this, 'fixed', {
    enumerable: true,
    configurable: true,
    get: function () { return this.entity.fixed; },
    set: function (value) { this.entity.fixed = value; }
  });

  // expose the model's physical shape
  readOnlyProp(this, 'shape', function () { return this.entity.shape; });
});



var ActorView = Class("ActorView", function () {
  var ALLOWED_KEYS = [];

  this.init = function (resource) {
    this._properties = {};
    this.resource = resource;
  };

  // TODO: use some kind of pubsub / eventemiiter
  this.onUpdated = function () {};

  this.update = function (opts) {
    var updatedKeys = [];
    for (key in opts) {
      if (ALLOWED_KEYS.indexOf(key) == -1) {
        continue;
      }
      this._properties[key] = opts[key];
      updatedKeys.push(key);
    }
    this.onUpdated.apply(this, updatedKeys);
  };

  this.getAllProperties = function () {
    return this._properties;
  };

  // TODO: clean this up?
  Object.defineProperty(this, '_viewBacking', {
    enumerable: false,
    configurable: false,
    get: function () { return this.__viewBacking; },
    set: function (value) {
      if (this._viewBacking) {
        throw new Error("Can't overwrite _viewBacking");
      }
      this.__viewBacking = value;
    }
  });

  makeProxy.call(this, 'flipX');
  makeProxy.call(this, 'flipY');
  makeProxy.call(this, 'opacity');
  makeProxy.call(this, 'scale');
  makeProxy.call(this, 'compositeOperation');
  makeProxy.call(this, 'r');

  function makeProxy (name) {
    ALLOWED_KEYS.push[name];
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: true,
      get: function () { return this._properties[name]; },
      set: function (value) { this._properties[name] = value; this.onUpdated(name) }
    })
  };
});
