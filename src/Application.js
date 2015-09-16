
exports = Class(GC.Application, function () {
  this.initUI = function () {
    // TODO: move to lvl
    import .lvl;
    lvl.initializeWithView(this.view);

    var parallax = lvl.resource.loadParallaxFromJSON('resources/config/parallax.json');
    lvl.bg.add(parallax);
    lvl.camera.autoScrollBy(0, 250);

    // lvl.addParallax(forest);
    // lvl.bg.add(forest); // by default get section name 'background'
    // lvl.fg.add(forest); /// by default get section name 'foreground'

    // lvl.fg.add(mist, {sectionName: 'scaryMist'})
    // lvl.bg.autoScrollBy(0, 250); // MAYBE ?

    // lvl.ui ...

    var dragonSprite = lvl.resource.loadSpriteFromJSON('resources/sprites/serpent/config.json');
    var dragon = lvl.addActor(dragonSprite);
    dragon.x = 250;
    dragon.y = 250;

    var sfx = lvl.resource.loadSound('resources/sounds/v_fever_a.mp3');

    // dragon moves back and forth
    dragon.vx = -0.25;
    // TODO: lvl.setInterval
    setInterval(bind(this, function () {
      dragon.vx = -dragon.vx;
      dragon.view.flipX = !dragon.view.flipX;
      dragon.view.opacity = 0.2 + 0.8 * Math.random();
      dragon.view.scale = dragon.view.opacity;
      lvl.sound.playSound(sfx, { volume: Math.pow(dragon.view.opacity, 2) });
    }), 1600);
  };

  this.launchUI = function () {
    var music = lvl.resource.loadMusic('resources/sounds/game.mp3');
    lvl.sound.playMusic(music);
  };

});
