// TODO: lvl.animate
import animate;

var ANIM_TIME = 2500;
var PI = Math.PI;
// TODO: lvl.random API, random seeds etc.
var random = Math.random;

exports = Class(GC.Application, function () {
  this.initUI = function () {
    // TODO: move to lvl
    import .lvl;
    lvl.initializeWithView(this.view);

    // Sound API Tests
    // var sfx = lvl.resources.loadSound('resources/sounds/v_fever_a.mp3');
    // var music = lvl.resources.loadMusic('resources/sounds/game.mp3');
    // lvl.sound.playSound(sfx, { volume: 0.5 + 0.5 * Math.random() });
    // lvl.sound.playMusic(music);

    // Parallax API Tests
    var parallax = lvl.resources.loadParallaxFromJSON('resources/config/spaceParallax.json');
    lvl.bg.add(parallax);

    // lvl.addParallax(forest);
    // lvl.bg.add(forest); // by default get section name 'background'
    // lvl.fg.add(forest); /// by default get section name 'foreground'
    // lvl.fg.add(mist, {sectionName: 'scaryMist'})
    // lvl.bg.autoScrollBy(0, 250); // MAYBE ?

    // Actor API Tests
    var dragonSprite = lvl.resources.loadSpriteFromJSON('resources/sprites/serpent/config.json');
    var dragon = lvl.addActor(dragonSprite);
    dragon.x = lvl.camera.centerX;
    dragon.y = lvl.camera.centerY;
    lvl.setInterval(bind(this, function () {
      var roll = random();
      if (roll < 0.25) {
        lvl.animate(dragon).now({ vx: -100 - 900 * random(), vy: 0 }, ANIM_TIME, lvl.animate.easeInOut);
        lvl.animate(dragon.view).now({ r: 0 }, ANIM_TIME, lvl.animate.easeInOut);
      } else if (roll < 0.5) {
        lvl.animate(dragon).now({ vx: 100 + 900 * random(), vy: 0 }, ANIM_TIME, lvl.animate.easeInOut);
        lvl.animate(dragon.view).now({ r: PI }, ANIM_TIME, lvl.animate.easeInOut);
      } else if (roll < 0.75) {
        lvl.animate(dragon).now({ vx: 0, vy: -100 - 900 * random() }, ANIM_TIME, lvl.animate.easeInOut);
        lvl.animate(dragon.view).now({ r: PI / 2 }, ANIM_TIME, lvl.animate.easeInOut);
      } else {
        lvl.animate(dragon).now({ vx: 0, vy: 100 + 900 * random() }, ANIM_TIME, lvl.animate.easeInOut);
        lvl.animate(dragon.view).now({ r: 3 * PI / 2 }, ANIM_TIME, lvl.animate.easeInOut);
      }
    }), ANIM_TIME);

    // Camera API Tests
    // TODO: these numbers don't feel exactly right with what you'd expect
    lvl.camera.follow(dragon, {
      lagDistanceX: 640,
      lagDistanceY: 360
    });
  };

  this.launchUI = function () {};

});
