
var soundManager = backend.getAudioManager();

exports.playMusic = function (resource, opts) {
  var opts = opts || {};

  if (resource.getType() !== 'music') {
    throw new Error("playMusic requires resource of type music");
  }

  // TODO: soundManager.getSound throws a warning the first time through...
  var path = resource.getFullPath();
  var music = soundManager.getSound(path);
  if (!music) {
      soundManager.addSound(path, merge({
        background: true
      }), resource.getOpts());
      music = soundManager.getSound(path);
  } else if (!music.isBackgroundMusic) {
    throw new Error("Audio file already loaded as sound; Audio files can only" +
                    "be played as either sound or music, but not both");
  }

  if (!isNaN(opts.volume)) {
    music.setVolume(opts.volume);
  }

  soundManager.play(path);
};

exports.playSound = function (resource, opts) {
  var opts = opts || {};

  if (resource.getType() !== 'sound') {
    throw new Error("playSound requires resource of type sound");
  }

  // TODO: soundManager.getSound throws a warning the first time through...
  var path = resource.getFullPath();
  var sound = soundManager.getSound(path);
  if (!sound) {
      soundManager.addSound(path, resource.getOpts());
      sound = soundManager.getSound(path);
  } else if (sound.isBackgroundMusic) {
    throw new Error("Audio file already loaded as music; Audio files can only" +
                    "be played as either sound or music, but not both");
  }

  if (!isNaN(opts.volume)) {
    sound.setVolume(opts.volume);
  }

  soundManager.play(path);
};

exports.mute = function (mute) {
  throw new Error("TODO");
};

exports.muteSound = function (mute) {
  throw new Error("TODO");
};

exports.muteMusic = function (mute) {
  throw new Error("TODO");
};
