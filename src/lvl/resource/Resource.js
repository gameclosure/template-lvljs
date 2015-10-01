
var Resource = exports = Class("Resource", function () {
  this.init = function (fullPath, type, opts) {
    this._fullPath = fullPath || '';
    this._type = type || '';
    this._opts = opts || {};
    applyBackendDefaults.call(this);
  };

  this.getOpts = function () {
    return this._opts;
  };

  this.getShapeConfig = function () {
    if (this._type === 'parallax') {
      throw new Error("Resources of type parallax cannot have a shape!");
    } else {
      return this._opts.shape;
    }
  };

  this.getViewConfig = function () {
    if (this._type === 'parallax') {
      return this._opts;
    } else {
      return this._opts.view;
    }
  };

  this.loadOptsFromJSONFullPath = function () {
    var newOpts = backend.readJSON(this._fullPath);
    merge(this._opts, newOpts);
    applyBackendDefaults.call(this);
  };

  this.getFullPath = function () {
    return this._fullPath;
  };

  this.getType = function () {
    return this._type;
  };

  function applyBackendDefaults () {
    if (this._type === 'image' || this._type === 'sprite') {
      this._opts = backend.applyDefaultImageOpts(this._opts);
    } else if (this._type === 'imageText') {
      this._opts = backend.applyDefaultImageTextOpts(this._opts);
    }
  };
});
