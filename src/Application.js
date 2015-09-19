
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
    // TODO: lvl.setInterval
    setInterval(bind(this, function () {
      var roll = Math.random();
      if (roll < 0.25) {
        dragon.vx = -250;
        dragon.vy = 0;
        dragon.view.r = 0;
      } else if (roll < 0.5) {
        dragon.vx = 250;
        dragon.vy = 0;
        dragon.view.r = Math.PI;
      } else if (roll < 0.75) {
        dragon.vx = 0;
        dragon.vy = -250;
        dragon.view.r = Math.PI / 2;
      } else {
        dragon.vx = 0;
        dragon.vy = 250;
        dragon.view.r = 3 * Math.PI / 2;
      }
    }), 3000);

    // Camera API Tests
    lvl.camera.follow(dragon, {
      lagDistanceX: 160,
      lagDistanceY: 90
    });
  };

  this.launchUI = function () {};

});
