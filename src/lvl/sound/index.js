var soundManager = backend.getAudioManager();

var soundsCache = {};

exports.playMusic = function (resource, opts) {
  if (resource.getType() !== 'music') {
    throw new Error("lvl.sound.playMusic requires resource of type music");
  }

  opts = merge(opts, resource.getOpts());
  var path = resource.getFullPath();
  if (!path) {
    throw new Error("Music must have a valid url.");
  }

  var sound = soundsCache[path];
  if (!sound) {
    opts.background = true;
    soundManager.addSound(path, opts);
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
  if (resource.getType() !== 'sound') {
    throw new Error("lvl.sound.playSound requires resource of type sound");
  }

  opts = merge(opts, resource.getOpts());
  var path = resource.getFullPath();
  if (!path) {
    // sounds can have multiple sources (full paths)
    var sources = opts.sources;
    if (sources && sources.length) {
      path = sources[0];
    } else {
      throw new Error("Sounds must have a valid url or sources list.");
    }
  }

  var sound = soundsCache[path];
  if (!sound) {
    soundManager.addSound(path, opts);
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
