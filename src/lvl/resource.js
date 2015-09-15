var backend;
exports.setBackend = function(be) {
  backend = be;
}

exports.loadSpriteFromJSON = function(url) {
  var rsrc = new Resource(url, 'sprite');
  rsrc.loadOptsFromJSONFullPath();
  return rsrc;
};

exports.loadMusic = function(fullPath, opts) {
  return new Resource(fullPath, 'music', opts);
}


exports.loadSound = function(fullPath, opts) {
  return new Resource(fullPath, 'sound', opts);
}
exports.loadAudioSetFromJSON = function(fullPath) {
  throw new Error("TODO");
};

exports.loadImage = function(fullPath, opts) {
  throw new Error("TODO");
}
exports.loadImageFromJSON = function(url) {
  throw new Error("TODO");
};

exports.loadParallax = function(fullPath, opts) {
  throw new Error("TODO");
}

exports.loadParallaxFromJSON = function(url) {
  throw new Error("TODO");
};

//var EmptyResource = Class...

var Resource = Class(function() {
  
  this.init = function(fullPath, type, opts) {
    var opts = opts || {};
    this._fullPath = fullPath;
    this._opts = opts;
    this._type = type || 'unknown';
  }
  
  this.getOpts = function() { 
    return this._opts;
  }
  
  this.getVisualOpts = function() {
    return this._opts.visual;
  }
  
  this.loadOptsFromJSONFullPath = function() {
    var newOpts = backend.readJSON(this._fullPath);
    merge(this._opts, newOpts);
  }
  
  this.getFullPath = function() {
    return this._fullPath;  
  }

  this.getType = function () {
    return this._type;
  }
  
});

