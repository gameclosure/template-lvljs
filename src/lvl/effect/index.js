import animate;

var PI = Math.PI;
var TAU = 2 * PI;
var sin = Math.sin;
var cos = Math.cos;
var random = Math.random;

// TODO: singleton class to manage state?
var animations = [];
exports.reset = function () {
  animations.forEach(function (anim) {
    anim.clear();
  });
  animations.length = 0;
};



// lvl.effect.emit
exports.emit = function (resource, x, y, opts) {
  var lvl = window.getLvlAPI();
  opts = merge(opts, resource.getOpts());

  if (resource.getType() !== 'particleEffect') {
    throw new Error("lvl.effect.emit requires resource of type particleEffect");
  }

  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error("lvl.effect.emit requires valid x and y coordinates");
  }

  var layer = opts.layer;
  if (layer) {
    if (typeof layer === 'string') {
      // if layer is a string, match it to a View layer
      switch (layer) {
        case 'bg':
        case 'background':
          opts.layer = lvl.bg;
          break;
        case 'lvl':
        case 'level':
          opts.layer = lvl.view;
          break;
        case 'fg':
        case 'foreground':
          opts.layer = lvl.fg;
          break;
        case 'ui':
          opts.layer = lvl.ui;
          break;
        default:
          throw new Error("lvl.effect.emit layer can be bg, lvl, fg, or ui");
      }
    } else if (layer === lvl) {
      // if lvl itself was passed in, use its View
      opts.layer = lvl.view;
    } else if (layer.__class__ !== "View") {
      throw new Error("lvl.effect.emit layer can be lvl, lvl.bg, lvl.fg, or lvl.ui");
    }
  } else {
    // default to the primary layer
    opts.layer = lvl.view;
  }

  backend.emitParticleEffect(resource, x, y, opts);
};



// lvl.animate
exports.animate = function (subject, groupID) {
  // TODO: should refs to timestep animate exist only in the backend?
  // TODO: devkit should limit global tick to ~100 ms max! BIG TICKS BREAK STUFF
  // TODO: Object.defineProp animatableProperties on classes like camera
  var anim = animate(subject, groupID);
  if (animations.indexOf(anim) === -1) {
    animations.push(anim);
  }
  return anim;
};

// grab transitions and helpful functions from timestep animate
var keys = Object.keys(animate);
for (var index in keys) {
  var key = keys[index];
  if (key.indexOf('Animator') === -1) {
    exports.animate[key] = animate[key];
  }
}



// hover up and down
registerAnimationEffect('hover', function (subject, opts, anim) {
  var ttl = opts.duration;
  var dt = ttl / 4;
  var dy = 6 * opts.magnitude;
  var ss = subject.style || subject;

  anim.then({ offsetY: ss.offsetY - dy }, dt, this.animate.easeOut)
    .then({ offsetY: ss.offsetY }, dt, this.animate.easeIn)
    .then({ offsetY: ss.offsetY + dy }, dt, this.animate.easeOut)
    .then({ offsetY: ss.offsetY }, dt, this.animate.easeIn);
});



// shake rapidly, great for screen shaking like earthquakes
registerAnimationEffect('shake', function (subject, opts, anim) {
  var ttl = opts.duration;
  var dt = ttl / 16;
  var m = 1.75 * opts.magnitude;
  var ss = subject.style || subject;
  var x = ss.offsetX;
  var y = ss.offsetY;
  var s = ss.scale;
  var ax = ss.anchorX;
  var ay = ss.anchorY;
  ss.anchorX = ss.width / 2;
  ss.anchorY = ss.height / 2;
  var r1 = TAU * random();
  var r2 = TAU * random();
  var r3 = TAU * random();
  var r4 = TAU * random();
  var r5 = TAU * random();
  var r6 = TAU * random();
  var r7 = TAU * random();
  var r8 = TAU * random();
  var r9 = TAU * random();
  var r10 = TAU * random();
  var r11 = TAU * random();
  var r12 = TAU * random();
  var r13 = TAU * random();
  var r14 = TAU * random();

  anim.then({ scale: s * (1 + 0.05 * m) }, dt, this.animate.easeIn)
    .then({ offsetX: x + 14 * m * cos(r1), offsetY: y + 14 * m * sin(r1), scale: s * (1 + 0.046 * m) }, dt, this.animate.easeOut)
    .then({ offsetX: x + 13 * m * cos(r2), offsetY: y + 13 * m * sin(r2), scale: s * (1 + 0.042 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 12 * m * cos(r3), offsetY: y + 12 * m * sin(r3), scale: s * (1 + 0.038 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 11 * m * cos(r4), offsetY: y + 11 * m * sin(r4), scale: s * (1 + 0.034 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 10 * m * cos(r5), offsetY: y + 10 * m * sin(r5), scale: s * (1 + 0.030 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 9 * m * cos(r6), offsetY: y + 9 * m * sin(r6), scale: s * (1 + 0.026 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 8 * m * cos(r7), offsetY: y + 8 * m * sin(r7), scale: s * (1 + 0.022 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 7 * m * cos(r8), offsetY: y + 7 * m * sin(r8), scale: s * (1 + 0.018 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 6 * m * cos(r9), offsetY: y + 6 * m * sin(r9), scale: s * (1 + 0.014 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 5 * m * cos(r10), offsetY: y + 5 * m * sin(r10), scale: s * (1 + 0.010 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 4 * m * cos(r11), offsetY: y + 4 * m * sin(r11), scale: s * (1 + 0.008 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 3 * m * cos(r12), offsetY: y + 3 * m * sin(r12), scale: s * (1 + 0.006 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 2 * m * cos(r13), offsetY: y + 2 * m * sin(r13), scale: s * (1 + 0.004 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x + 1 * m * cos(r14), offsetY: y + 1 * m * sin(r14), scale: s * (1 + 0.002 * m) }, dt, this.animate.easeInOut)
    .then({ offsetX: x, offsetY: y, anchorX: ax, anchorY: ay, scale: s }, dt, this.animate.easeIn);
});



// rotate
registerAnimationEffect('spin', function (subject, opts, anim) {
  var ttl = opts.duration;
  var ss = subject.style || subject;
  var dr = TAU * opts.magnitude;

  anim.then({ r: ss.r + dr }, ttl, this.animate.linear);
});



// squish like jelly
registerAnimationEffect('squish', function (subject, opts, anim) {
  var ttl = opts.duration;
  var dt = ttl / 4;
  var ss = subject.style || subject;
  var dsx = ss.scaleX * ((1 + 0.1 * opts.magnitude) - 1);
  var dsy = ss.scaleY * ((1 + 0.1 * opts.magnitude) - 1);

  anim.then({ scaleX: ss.scaleX - dsx, scaleY: ss.scaleY + dsy }, dt, this.animate.easeOut)
    .then({ scaleX: ss.scaleX, scaleY: ss.scaleY }, dt, this.animate.easeIn)
    .then({ scaleX: ss.scaleX + dsx, scaleY: ss.scaleY - dsy }, dt, this.animate.easeOut)
    .then({ scaleX: ss.scaleX, scaleY: ss.scaleY }, dt, this.animate.easeIn);
});



// sway back and forth (horizontal hover)
registerAnimationEffect('sway', function (subject, opts, anim) {
  var ttl = opts.duration;
  var dt = ttl / 4;
  var dx = 6 * opts.magnitude;
  var ss = subject.style || subject;

  anim.then({ offsetX: ss.offsetX - dx }, dt, this.animate.easeOut)
    .then({ offsetX: ss.offsetX }, dt, this.animate.easeIn)
    .then({ offsetX: ss.offsetX + dx }, dt, this.animate.easeOut)
    .then({ offsetX: ss.offsetX }, dt, this.animate.easeIn);
});



// quiver, vibrate, like an arrow sticking into a wall
registerAnimationEffect('quiver', function (subject, opts, anim) {
  var ttl = opts.duration;
  var dt = ttl / 8;
  var dr = opts.magnitude * PI / 24;
  var ss = subject.style || subject;

  anim.then({ r: ss.r + dr }, dt / 2, this.animate.easeOut)
    .then({ r: ss.r - 0.60 * dr }, dt, this.animate.easeInOut)
    .then({ r: ss.r + 0.36 * dr }, dt, this.animate.easeInOut)
    .then({ r: ss.r - 0.22 * dr }, dt, this.animate.easeInOut)
    .then({ r: ss.r + 0.13 * dr }, dt, this.animate.easeInOut)
    .then({ r: ss.r - 0.08 * dr }, dt, this.animate.easeInOut)
    .then({ r: ss.r + 0.05 * dr }, dt, this.animate.easeInOut)
    .then({ r: ss.r - 0.03 * dr }, dt, this.animate.easeInOut)
    .then({ r: ss.r }, dt / 2, this.animate.easeIn);
});



// register special animation functions for common effects
function registerAnimationEffect (name, fn) {
  exports[name] = bind(exports, function (target, opts) {
    // default opts
    opts = opts || {};
    opts.magnitude = opts.magnitude !== undefined ? opts.magnitude : 1;
    opts.duration = opts.duration !== undefined ? opts.duration : 1000;
    opts.loop = opts.loop !== undefined ? opts.loop : false;
    // prefer view over the target if it exists
    var subject = target.view || target;
    // prep animations and ensure safe completion if already active
    var anim = this.animate(subject, name);
    anim.interrupting = true;
    anim.commit();
    anim.interrupting = false;
    fn.call(this, subject, opts, anim);
    // clean up callback at the end of the animation function
    anim.then(bind(this, function () {
      // loop the animation function?
      if (opts.loop && !anim.interrupting) {
        anim.clear();
        this[name](subject, opts);
      }
    }));
    return anim;
  });
};
