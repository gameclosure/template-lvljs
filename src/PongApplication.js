var lvl;
exports = Class(GC.Application, function () {
  this.initUI = function () { lvl = jsio('import .lvl'); };
  this.launchUI = function () { startGame(); };
});



var BG_WIDTH = 1024;
var BG_HEIGHT = 768;
var BG_URL = "resources/config/pong/background.json";
var BALL_URL = "resources/config/pong/ball.json";
var PADDLE_URL = "resources/config/pong/paddle.json";
var PADDLE_VY = 400;

function startGame () {
  // set letter-boxed viewport
  lvl.camera.setCustomViewportDimensions(BG_WIDTH, BG_HEIGHT, true);

  // listen for input move events
  lvl.input.on('touchstart', onTouchStart);
  lvl.input.on('touchmove', onTouchMove);

  // add a background
  var bgResource = lvl.resource.loadImageFromJSON(BG_URL);
  var bg = lvl.bg.add(bgResource);

  // add a ball
  var ballResource = lvl.resource.loadImageFromJSON(BALL_URL);
  var ball = lvl.addActor(ballResource);
  ball.vx = 600;
  ball.vy = 600;

  // add a paddle
  var paddleResource = lvl.resource.loadImageFromJSON(PADDLE_URL);
  var paddles = lvl.addGroup('paddles');
  var paddle1 = lvl.addActor(paddleResource, { group: paddles });
  var paddle2 = lvl.addActor(paddleResource, { group: paddles });
  paddle1.x -= BG_WIDTH / 2 - ball.width * 3;
  paddle2.x += BG_WIDTH / 2 - ball.width * 3;

  ball.collidesWith('left', onBallHitWall);
  ball.collidesWith('right', onBallHitWall);
  ball.collidesWith('top', onBallHitWall);
  ball.collidesWith('bottom', onBallHitWall);
  ball.collidesWith(paddles, onBallHitPaddle);

  lvl.setInterval(updateAI, 16);

  var touchX = 0;
  var touchY = 0;

  function updateAI () {
    var targetY = BG_HEIGHT / 2;
    if (paddle1.x + paddle1.width / 2 + ball.width / 2 < ball.x && ball.vx > 0) {
      targetY = ball.y;
    }
    setPaddleState(targetY);
  };

  function setPaddleState (targetY) {
    if (Math.abs(targetY - paddle2.y) <= PADDLE_VY * 0.016) {
      paddle2.y = targetY;
      paddle2.vy = 0;
    } else {
      if (targetY > paddle2.y) {
        paddle2.vy = PADDLE_VY;
      } else {
        paddle2.vy = -PADDLE_VY;
      }
    }
  };

  function onTouchStart (data) {
    touchX = data.x;
    touchY = data.y;
  };

  function onTouchMove (data) {
    paddle1.y += data.y - touchY;
    if (paddle1.y < paddle1.height / 2) {
      paddle1.y = paddle1.height / 2;
    }
    if (paddle1.y > BG_HEIGHT - paddle1.height / 2) {
      paddle1.y = BG_HEIGHT - paddle1.height / 2;
    }
    touchY = data.y;
  };

  function onBallHitWall (ball, wall) {
    switch (wall) {
      case lvl.bounds.screenTop:
      case lvl.bounds.screenBottom:
        ball.vy = - ball.vy;
        break;
      case lvl.bounds.screenLeft:
      case lvl.bounds.screenRight:
        ball.vx = - ball.vx;
        break;
    }
  };

  function onBallHitPaddle (ball, paddle) {
    var x = ball.x;
    var y = ball.y;
    ball = ball.entity || ball;
    paddle = paddle.entity || paddle;
    ball.resolveCollisionWith(paddle);
    if (ball.x !== x) {
      ball.vx = -ball.vx;
    }
    if (ball.y !== y) {
      ball.vy = -ball.vy;
    }
  };

  function onGameOver () {
    lvl.reset();
    startGame();
  };
};
