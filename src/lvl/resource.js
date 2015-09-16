
// TODO: don't expose this to game-devs ...
var backend;
exports.setBackend = function (be) {
  backend = be;
};

/**
 * Resource API
 */

exports.loadMusic = function (fullPath, opts) {
  return new Resource(fullPath, 'music', opts);
};

exports.loadSound = function (fullPath, opts) {
  return new Resource(fullPath, 'sound', opts);
};

exports.loadAudioSetFromJSON = function (fullPath) {
  throw new Error("TODO");
};

exports.loadImage = function (fullPath, opts) {
  throw new Error("TODO");
};

exports.loadImageFromJSON = function (fullPath) {
  var resource = new Resource(fullPath, 'image');
  resource.loadOptsFromJSONFullPath();
  return resource;
};

exports.loadSprite = function (fullPath, opts) {
  throw new Error("TODO");
};

exports.loadSpriteFromJSON = function (fullPath) {
  var resource = new Resource(fullPath, 'sprite');
  resource.loadOptsFromJSONFullPath();
  return resource;
};

exports.loadParallaxFromJSON = function (fullPath) {
  var resource = new Resource(fullPath, 'parallax');
  resource.loadOptsFromJSONFullPath();
  return resource;
};

exports.loadEmptyResource = function () {
  return new Resource();
};

/**
 * Resource Class
 */

var Resource = Class("Resource", function () {
  this.init = function (fullPath, type, opts) {
    this._fullPath = fullPath || '';
    this._type = type || '';
    this._opts = opts || {};
  };

  this.getOpts = function () {
    return this._opts;
  };

  this.getVisualOpts = function () {
    if (this._type === 'parallax') {
      return this._opts;
    } else {
      return this._opts.visual;
    }
  };

  this.loadOptsFromJSONFullPath = function () {
    var newOpts = backend.readJSON(this._fullPath);
    merge(this._opts, newOpts);
  };

  this.getFullPath = function () {
    return this._fullPath;
  };

  this.getType = function () {
    return this._type;
  };
});
