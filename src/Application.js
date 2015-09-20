// TODO: lvl.animate
import animate;

var ANIM_TIME = 2500;

exports = Class(GC.Application, function () {
  this.initUI = function () {
    // TODO: move to lvl
    import .lvl;
    lvl.initializeWithView(this.view);

    // Sound API Tests
    // var sfx = lvl.resource.loadSound('resources/sounds/v_fever_a.mp3');
    // var music = lvl.resource.loadMusic('resources/sounds/game.mp3');
    // lvl.sound.playSound(sfx, { volume: 0.5 + 0.5 * Math.random() });
    // lvl.sound.playMusic(music);

    // Parallax API Tests
    var parallax = lvl.resource.loadParallaxFromJSON('resources/config/spaceParallax.json');
    lvl.bg.add(parallax);

    // lvl.addParallax(forest);
    // lvl.bg.add(forest); // by default get section name 'background'
    // lvl.fg.add(forest); /// by default get section name 'foreground'
    // lvl.fg.add(mist, {sectionName: 'scaryMist'})
    // lvl.bg.autoScrollBy(0, 250); // MAYBE ?

    // Actor API Tests
    var dragonSprite = lvl.resource.loadSpriteFromJSON('resources/sprites/serpent/config.json');
    var dragon = lvl.addActor(dragonSprite);
    dragon.x = lvl.camera.viewport.centerX;
    dragon.y = lvl.camera.viewport.centerY;
    setInterval(bind(this, function () {
      var roll = Math.random();
      if (roll < 0.25) {
        animate(dragon).now({
          vx: -100 - 900 * Math.random(),
          vy: 0
        }, ANIM_TIME, animate.easeInOut);
        animate(dragon.view).now({
          r: 0
        }, ANIM_TIME, animate.easeInOut);
      } else if (roll < 0.5) {
        animate(dragon).now({
          vx: 100 + 900 * Math.random(),
          vy: 0
        }, ANIM_TIME, animate.easeInOut);
        animate(dragon.view).now({
          r: Math.PI
        }, ANIM_TIME, animate.easeInOut);
      } else if (roll < 0.75) {
        animate(dragon).now({
          vx: 0,
          vy: -100 - 900 * Math.random()
        }, ANIM_TIME, animate.easeInOut);
        animate(dragon.view).now({
          r: Math.PI / 2
        }, ANIM_TIME, animate.easeInOut);
      } else {
        animate(dragon).now({
          vx: 0,
          vy: 100 + 900 * Math.random()
        }, ANIM_TIME, animate.easeInOut);
        animate(dragon.view).now({
          r: 3 * Math.PI / 2
        }, ANIM_TIME, animate.easeInOut);
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
