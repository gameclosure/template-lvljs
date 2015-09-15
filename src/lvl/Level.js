import .Background
import .Actor

// Level.js
var Level = exports = Class(function() {
  this.init = function(opts) {
    this._backend = opts.backend;
    this.background = new Background({
      backend: this._backend
    })
  };

  this.initializeWithView = function(view) {
    this._view = view;
  };

  this.addActor = function (resource, geometryOverrides) {
    var actor = new Actor({
      backend: this._backend,
      resource: resource,
      geometryOverrides: geometryOverrides
    });
    return actor;
  };
});