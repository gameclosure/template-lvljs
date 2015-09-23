// XXX: TODO: FIXME: COMPILER BUG
jsio('import .Resource', { context: { backend: backend } });
jsio('import .Resource');

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
