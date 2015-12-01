
var Resource = exports = Class("Resource", function () {
  this.init = function (fullPath, type, opts) {
    // _fullPath can be a string or an array of strings
    this._fullPath = fullPath || '';
    this._type = type || '';
    this._opts = opts || {};
    applyBackendDefaults.call(this);

    if (!VALID_TYPES[this._type]) {
      throw new Error("Invalid Resource Type:", this._type, this._fullPath);
    }
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
    if (isArray(newOpts)) {
      this._opts = newOpts;
    } else {
      merge(this._opts, newOpts);
    }
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



var VALID_TYPES = exports.VALID_TYPES = {};
VALID_TYPES[''] = true; // empty resource is valid
VALID_TYPES['image'] = true;
VALID_TYPES['imageText'] = true;
VALID_TYPES['sprite'] = true;
VALID_TYPES['parallax'] = true;
VALID_TYPES['particleEffect'] = true;
VALID_TYPES['sound'] = true;
VALID_TYPES['music'] = true;
