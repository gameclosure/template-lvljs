// XXX: TODO: FIXME: COMPILER BUG
jsio('import .Resource', { context: { backend: backend } });
jsio('import .Resource');

exports.loadMusic = function (fullPath, opts) {
  return new Resource(fullPath, 'music', opts);
};

exports.loadSound = function (fullPath, opts) {
  return new Resource(fullPath, 'sound', opts);
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

exports.loadImageTextFromJSON = function (fullPath) {
  var resource = new Resource(fullPath, 'imageText');
  resource.loadOptsFromJSONFullPath();
  return resource;
};

exports.loadParticleEffectFromJSON = function (fullPath) {
  var resource = new Resource(fullPath, 'particleEffect');
  resource.loadOptsFromJSONFullPath();
  return resource;
};

// empty resources can be used for invisible Actors
exports.loadEmptyResource = function () {
  return new Resource();
};

// bundles load multiple resources into an object map of resource keys
exports.loadResourceBundleFromJSON = function (fullPath) {
  var bundle = {};
  var list = backend.readJSON(fullPath);
  for (var key in list) {
    var resource = list[key];
    bundle[key] = new Resource(resource.url, resource.type, resource);
    // TODO: if path ends with '.json', call loadOptsFromJSONFullPath ?
  }
  return bundle;
};
