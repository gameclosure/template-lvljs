var soundManager = backend.getAudioManager();

var soundsCache = {};

exports.playMusic = function (resource, opts) {
  var opts = opts || {};
  if (resource.getType() !== 'music') {
    throw new Error("playMusic requires resource of type music");
  }

  var path = resource.getFullPath();
  var sound = soundsCache[path];
  if (!sound) {
      soundManager.addSound(path, merge({
        background: true
      }), resource.getOpts());
      sound = soundsCache[path] = soundManager.getSound(path);
  } else if (!sound.isBackgroundMusic) {
    throw new Error("Audio file already loaded as sound; Audio files can only" +
                    "be played as either sound or music, but not both");
  }

  if (!isNaN(opts.volume)) {
    sound.setVolume(opts.volume);
  }

  soundManager.play(path);
};

exports.playSound = function (resource, opts) {
  var opts = opts || {};
  if (resource.getType() !== 'sound') {
    throw new Error("playSound requires resource of type sound");
  }

  var path = resource.getFullPath();
  var sound = soundsCache[path];
  if (!sound) {
      soundManager.addSound(path, resource.getOpts());
      sound = soundsCache[path] = soundManager.getSound(path);
  } else if (sound.isBackgroundMusic) {
    throw new Error("Audio file already loaded as music; Audio files can only" +
                    "be played as either sound or music, but not both");
  }

  if (!isNaN(opts.volume)) {
    sound.setVolume(opts.volume);
  }

  soundManager.play(path);
};

exports.muteAll = function (mute) {
  soundManager.setMuted(mute);
};

exports.muteSound = function (mute) {
  soundManager.setEffectsMuted(mute);
};

exports.muteMusic = function (mute) {
  soundManager.setMusicMuted(mute);
};
