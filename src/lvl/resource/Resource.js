
var Resource = exports = Class("Resource", function () {
  this.init = function (fullPath, type, opts) {
    this._fullPath = fullPath || '';
    this._type = type || '';
    this._opts = opts || {};
    applyBackendDefaults.call(this);
  };

  this.getOpts = function () {
    return JSON.parse(JSON.stringify(this._opts));
  };

  this.getShapeConfig = function () {
    var opts = this._opts.shape || this._opts;
    return JSON.parse(JSON.stringify(opts));
  };

  this.getViewConfig = function () {
    var opts = this._opts.view || this._opts;
    return JSON.parse(JSON.stringify(opts));
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
