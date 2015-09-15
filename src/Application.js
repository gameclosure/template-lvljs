
exports = Class(GC.Application, function () {
  this.initUI = function() {
    // TODO: move to lvl
    import .lvl;
    lvl.initializeWithView(this.view);
    var dragonSprite = lvl.resource.loadSpriteFromJSON('resources/sprites/serpent/config.json');
    var dragon = lvl.addActor(dragonSprite);
    dragon.x = 250;
    dragon.y = 250;

    var sfx = lvl.resource.loadSound('resources/sounds/v_fever_a.mp3');

    // dragon moves back and forth
    dragon.vx = -0.25;
    setInterval(bind(this, function () {
      dragon.vx = -dragon.vx;
      dragon.view.flipX = !dragon.view.flipX;
      dragon.view.opacity = Math.random();
      lvl.sound.playSound(sfx, { volume: Math.pow(dragon.view.opacity, 2) });
    }), 1600);
  };

  // TODO: move to lvl
  this.launchUI = function () {
    var music = lvl.resource.loadMusic('resources/sounds/game.mp3');
    lvl.sound.playMusic(music);
  };

});

/*
// resource/ninja/config.json
{
    geometry: {
      radius: 50,
      offsetX: 0,
      offsetY: 0
    },
    visual: {
      frameRate: 30,
      offsetX: -102,
      offsetY: -130,
      flipX: true,
      width: 204,
      height: 260,
      url: "resources/images/character"
    }
  }
});
*/

//    var dragon = new ui.SpriteView({
//      frameRate: 15,
//      zIndex: 20,
//      width: 320,
//      height: 150,
//      url: "resources/images/enemies/serpent",
//      defaultAnimation: 'swim',
//      autoStart: true,
//      loop: true,
//      superview: this
//    });

/*import entities.Entity as Entity;
import entities.EntityPool as EntityPool;


import ui.TextView;
import ui.SpriteView

exports = Class(GC.Application, function () {

  this.initUI = function () {

    var dragon = new ui.SpriteView({
      frameRate: 15,
      zIndex: 20,
      width: 320,
      height: 150,
      url: "resources/images/enemies/serpent",
      defaultAnimation: 'swim',
      autoStart: true,
      loop: true,
      superview: this
    });
    dragon.style.x = 600
    dragon.style.y = 400
    function an() {
      dragon.animate().now({
        x: 0,
        flipX: false
      }, 1000).then({x: 600, flipX: true}, 1000).then(an)
    }
    an();
  };
});



//var dragonConfig =  {
//  type: 'Entity',
//  opts: {
//    frameRate: 15,
//    zIndex: 20,
//    hitOpts: {
//      offsetX: 20 * ART_SCALE,
//      offsetY: 82 * ART_SCALE,
//      width: 280 * ART_SCALE,
//      height: 16 * ART_SCALE
//    },
//    viewOpts: {
//      width: 320 * ART_SCALE,
//      height: 150 * ART_SCALE,
//      url: "resources/images/enemies/serpent",
//      defaultAnimation: 'swim',
//      autoStart: true,
//      loop: true
//    }
//  }
//}

*/