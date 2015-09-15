import scene;

scene.registerConfig('bg', {
  type: 'ParallaxConfig',
  opts: [
    {
      xMultiplier: 0,
      yMultiplier: 0,
      xCanSpawn: true,
      xCanRelease: true,
      yCanSpawn: false,
      yCanRelease: false,
      pieceOptions: [{ image: "resources/images/bg.png" }]
    },
    {
      xMultiplier: 0.15,
      yMultiplier: 0,
      xCanSpawn: true,
      xCanRelease: true,
      yCanSpawn: false,
      yCanRelease: false,
      pieceOptions: [{ image: "resources/images/bgclouds.png", yAlign: "bottom", y: 1024, opacity: 0.92 }]
    },
    {
      xMultiplier: 0.5,
      yMultiplier: 0,
      xCanSpawn: true,
      xCanRelease: true,
      yCanSpawn: false,
      yCanRelease: false,
      pieceOptions: [{ image: "resources/images/cloud1.png", flipY: true }]
    },
    {
      xMultiplier: 1,
      yMultiplier: 0,
      xCanSpawn: true,
      xCanRelease: true,
      yCanSpawn: false,
      yCanRelease: false,
      pieceOptions: [{ image: "resources/images/cloud2.png", flipY: true }]
    },
    {
      xMultiplier: 0.5,
      yMultiplier: 0,
      xCanSpawn: true,
      xCanRelease: true,
      yCanSpawn: false,
      yCanRelease: false,
      pieceOptions: [{ image: "resources/images/cloud1.png", yAlign: "bottom", y: 1024 }]
    },
    {
      xMultiplier: 1,
      yMultiplier: 0,
      xCanSpawn: true,
      xCanRelease: true,
      yCanSpawn: false,
      yCanRelease: false,
      pieceOptions: [{ image: "resources/images/cloud2.png", yAlign: "bottom", y: 1024 }]
    }
  ]
});

var PLAYER_SCALE = 0.8;

scene.registerConfig('character', {
  type: 'Entity',
  opts: {
    hitOpts: { radius: PLAYER_SCALE * 50, offsetX: 0, offsetY: 0 },
    viewOpts: {
      frameRate: 30,
      offsetX: PLAYER_SCALE * -102,
      offsetY: PLAYER_SCALE * -130,
      flipX: true,
      width: PLAYER_SCALE * 204,
      height: PLAYER_SCALE * 260,
      url: "resources/images/character"
    }
  }
});

scene.registerConfig('obstacle', {
  type: 'Entity',
  opts: {
    hitOpts: { radius: 28, offsetX: 50 },
    viewOpts: {
      offsetY: -20,
      url: "resources/images/spear.png"
    }
  }
});

scene.registerConfig('bottom', {
  type: 'Entity',
  opts: {
    hitOpts: {
      width: 576,
      height: 100,
      offsetY: 50
    },
    viewOpts: {
      url: ""
    }
  }
});

scene.registerConfig('top', {
  type: 'Entity',
  opts: {
    flipY: true,
    hitOpts: {
      width: 576,
      height: 100
    },
    viewOpts: {
      url: "",
      flipY: true
    }
  }
});

// Score view!
var textPath = "resources/images/";
var scoreTextData = {};
for (var i = 0; i < 10; i++) {
  scoreTextData[i] = { image: textPath + i + ".png" };
}
scene.registerConfig('score_text', {
  type: 'ScoreView',
  opts: {
    characterData: scoreTextData,
    width: 500,
    height: 120,
    anchorX: 250,
    anchorY: 60,
    spacing: -7
  }
});

scene.registerConfig("text_gameover", {
  type: "ImageView",
  opts: {
    image: "resources/images/text_gameover.png",
    width: 326,
    height: 58,
    offsetX: -326 / 2,
    offsetY: -58 / 2,
    anchorX: 326 / 2,
    anchorY: 58 / 2
  }
});
