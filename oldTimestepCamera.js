jsio('import math2D.Vec2D as Vec2D');
jsio('import timestep.View');
jsio('import std.js as JS');
jsio('from util.underscore import _');
jsio('import math2D.Point as Point');
jsio('import math2D.Rect as Rect');

/**
 * @extends timestep.View
 */
var CameraView = exports = Class('timestep.CameraView', timestep.View, function(logger, supr) {
	var defaults = {
		centerX: 0,
		centerY: 0,
		maxPanSpeed: '20pt',
		maxZoomSpeed: 0.2,
		maxZoom: 20,
		minZoom: 0.05,
		initialZoom: 1.0,
		mode: 'free',
		follow: [],
		lock: false,
		lockEnforce: true,
		script: [],
		panEaseType: 'none',
		fullWidth: 0,
		fullHeight: 0,
		contentView: null
	}
	
	this.init = function(opts) {
		supr(this, 'init', [opts]);
		opts = JS.merge(opts, defaults);
		this._activeScript = null;
		this._scriptQueue = [];
		this._followTargets = [];
		this._centerX = opts.centerX;
		this._centerY = opts.centerY;
		this._targetX = opts.centerX;
		this._targetY = opts.centerY;
		this._fullWidth = opts.fullWidth || this.style.width;
		this._fullHeight = opts.fullHeight || this.style.height;
		
		this._targetScale = opts.initialZoom;
		this._scale = opts.initialZoom;
		this._minZoom = opts.minZoom;
		this._maxZoom = opts.maxZoom;
		// TODO: throw errors when user passes in non-sensical options		
		this.setMaxPanSpeed(opts.maxPanSpeed);
		this.setMaxZoomSpeed(opts.maxZoomSpeed);
		this.follow(opts.follow);
		this.pushScript(opts.script);
		if (opts.lock) {
			this.lockMode(this.getMode(), opts.lockEnforce);
		} else {
			this._lock = false;
			this._lockEnforce = false;
		}
		this.setMode(opts.mode);
		this._panEaseType = opts.panEaseType;
		
		if (opts.contentView) {
			this.setContentView(opts.contentView);
		}
		
		
	}

	this.getContentView = function() {
		return this._contentView;
	}
	
	this.setContentView = function(view) {
		this._contentView = view;
		this.addSubview(view);
		
	}

	this.getViewport = function() {
		return this._viewport;
	}
	
	this.getScale = function() {
		return this._scale;
	}

	this.render = function(ctx, dt) {
		if (this._contentView) {
			this._contentView.style.scale = this._scale;
			this._contentView.style.x = -this._viewport.x * this._scale;
			this._contentView.style.y = -this._viewport.y * this._scale;
			this._contentView.wrapRender(ctx, dt);
		}
	}

	this._doRender = function(ctx) {
		// in Pixels FIXME pixel/point difference
		var width  = (this.style.width / this._scale + 0.5)|0,
		    height = (this.style.height / this._scale + 0.5)|0;
	    
		this._viewport = new Rect({
			width: width,
			height: height,
			x: (this._centerX  - width/2)|0,
			y: (this._centerY  - height/2)|0
		});
		
		if (!this.counter) { this.counter = 1 };
		if (!(++this.counter % 30)) {
//			logger.info(this._scale);
//			logger.info('viewport', JSON.stringify(this._viewport))
		}
		this.render(ctx, this._viewport, this._scale)
	}

	

	this._renderSubviews = function(ctx, dt) {
		if (this._contentView) {return;}
		for (var i = 0, view; view = this._subviews[i]; ++i) {
			ctx.save();
			ctx.translate(-this._viewport.x, -this._viewport.y)
			view.wrapRender(ctx, dt);
			ctx.restore();
		}
	}
	
	
	this.tick = function(dt) {
		var mode = this.getMode();	
		if (mode == 'follow') {
			// TODO: zoom to fit in all followed targets, perhaps.
			// TODO: adhere to x/yLyles constraints
		
			if (this._followTargets.length) {
				if (!this._viewport) { return; }
				var x = 0;
				var y = 0;
				var maxRect = new Rect(this._viewport);
				var rect = {};
				for (var i = 0, follow; follow = this._followTargets[i]; ++i) {
					var pt = follow.getPoint();
					var lyles = follow.getLyles();
					if (rect.minX === undefined || pt.x - lyles.x < rect.minX) {
						rect.minX = pt.x - lyles.x;
					}
					if (rect.maxX === undefined || pt.x + lyles.x > rect.maxX) {
						rect.maxX = pt.x + lyles.x;
					}
					if (rect.minY === undefined || pt.y - lyles.y < rect.minY) {
						rect.minY = pt.y - lyles.y;
					}
					if (rect.maxY === undefined || pt.y + lyles.y > rect.maxY) {
						rect.maxY = pt.y + lyles.y;
					}
				}
				var y = rect.minY + (rect.maxY - rect.minY) / 2;
				var x = rect.minX + (rect.maxX - rect.minX) / 2;
				
				var targetWidth = rect.maxX - rect.minX;
				var targetHeight = rect.maxY - rect.minY;
				
				var targetScale = Math.min(this.style.width / targetWidth, this.style.height / targetHeight)
				this._targetScale = targetScale;
				
			} else {
				x = this._centerX;
				y = this._centerY;
			}
			this._targetX = x;
			this._targetY = y;
		}				
		
		if (mode == 'scripted') {
			if (!this._activeScript) {
				if (!this.nextScript()) {
					logger.info('finished scripts!');
					this.popMode();			
					return;
				}
			}
			if (this._activeScript.done(this)) {
				this.nextScript()
			}
		}
		
		
		// common code for free, scripted, and follow modes.
		
		var moveVec = new Vec2D({
			x:this._targetX - this._centerX,
			y:this._targetY - this._centerY
		});
		var maxMoveDistance = dt * this._maxPanSpeed / 1000; //FIXME take units into account
		if (moveVec.getMagnitude() > maxMoveDistance) {
			moveVec = new Vec2D({
				magnitude:maxMoveDistance,
				angle:moveVec.getAngle()
			});
		}
		this._centerX += moveVec.x;
		this._centerY += moveVec.y;
		
		var maxScale = dt * this._maxZoomSpeed / 1000;
		var targetScale = Math.min(Math.max(this._targetScale, this._minZoom), this._maxZoom);
		if (targetScale > this._scale) {
			this._scale = Math.min(targetScale, this._scale + maxScale);
		} else if (targetScale < this._scale) {
			this._scale = Math.max(targetScale, this._scale - maxScale);
		}
		
	}

	this.setMode = function(mode) {
		if (mode == this.getMode()) { return true; }
		if (this._lock) {
			if (this._lockEnforce) { return false; }
			throw new Error("mode is locked"); 
		}
		
		this._mode = mode;
		return true;
	}

	this.getMode = function() {
		return this._mode;
	}

	this._getPointArgs = function(args) {
		var x = args[0];
		var y = args[1];
		if (x && typeof x.x == 'number' && typeof x.y == 'number') {
			return x;
		}
		if (typeof x == 'object' && x.length) {
			x = x[0];
			y = x[1];
		}
		return new Point(x,y);
	}
	
	// Free mode

	this._moveTo = function(centerX, centerY) {
		var pt = this._getPointArgs(arguments);
		this._targetX = pt.x;
		this._targetY = pt.y;
	}

	this.moveTo = function(centerX, centerY) {
		if (this.setMode('free')) {
			this._moveTo(centerX, centerY);
		}
	}

	
	this._moveBy = function(xOffset, yOffset) {
		var pt = this._getPointArgs(arguments);
		this._targetX += pt.x;
		this._targetY += pt.y;
	}
	
	this.moveBy = function(xOffset, yOffset) {
//		debugger;
		if (this.setMode('free')) {
			this._moveBy(xOffset, yOffset);
		} else {
			logger.info('mode was locked?');
		}
	}
	
	this._zoomTo = function(scale) {
		this._targetScale = scale;
	}
	
	this.zoomTo = function(scale) {
		if (this.setMode('free')) {
			logger.log('zooming to ', scale);
			this._zoomTo(scale);
		}
	}
	
	this._zoomBy = function(scale) {
		this._targetScale *= scale;
	}
	
	this.zoomBy = function(scale) {
		if (this.setMode('free')) {
			this._zoomBy(scale);
		}	
	}


	// Constraints
	
	// (scaled pixels) / seconds
	// setMaxPanSpeed(20) = 20px
	// setMaxPanSpeed('20px') = 20px
	// setMaxPanSpeed('20pt') = 20pt (~ 10px at scale = 0.5)
	this.setMaxPanSpeed = function(speed) {
		var units = 'pt';
		if (typeof speed == 'string') {
			var units = speed.slice(speed.length-2);
			var speed = parseFloat(speed.slice(0, speed.length-2));
		}
		this._maxPanSpeed = speed;
		this._maxPanUnits = units;
	}

	this.setMaxZoomSpeed = function(speed) {
		this._maxZoomSpeed = speed;
	}
	
	


	this.lockMode = function(mode, enforce) {
		this.setMode(mode);
		this._lock = true;
		this._lockEnforce = !!enforce;
	}
	
	//easing stuff
	
	// easing
	// 'linear'
	// 'bouncy'
	// 'accelerateIn/Out'
	// 'easeIn/Out'
	
	this.setPanEasing = function(easeType) {
		this._panEaseType = easeType;
	}

	this.setZoomEasing = function(easeType) {
		this._zoomEaseType = easeType;
	}
	
			

	// Follow mode
	
	this.follow = function() {
		var targets = _.flatten(arguments);
		logger.info('targets are', targets);
		if (!targets.length) { return; }
		this.setMode('follow');
		var newFollows = [];
		for (var i = 0; i < targets.length; i++) {
			var target = targets[i];
			var follow = new Follow({target:target});
			this._followTargets.push(follow);
			newFollows.push(follow);
		}
		return newFollows;
	}
	
	this.removeFollow = function(follow) {
		// TODO: too verbose?
		this._followTargets = _.without(follow);
	}
	
	
	// Scripted Mode
	this.pushScript = function(script) {
		logger.log(arguments);
		logger.log(script);
		this._scriptQueue = this._scriptQueue.concat(_.flatten(arguments));	
	}
	
	this.nextScript = function() {
		if (this._scriptQueue.length > 0) {
			this._activeScript = this._scriptQueue.shift();
			this._activeScript.apply(this);
			return true;
		}
		else {
			//TODO: callback on done?
			//we should go back to free mode now, even if locked.
			//FIXME: if we give a callback for the end of a script
			// sequence, maybe we shouldn't automatically unlock
			// and go to free mode.  The callback fn should implement it.
			this._lock = false;
			this.setMode('free');
			return false;
		}
	}
	
	


});


var Follow = CameraView.Follow = Class('Follow', function(loger, supr) {
	this.init = function(opts) {
		this._viewCenter = opts.viewCenter || null;
		this._cb = opts.cb || null;
		this._pt = opts.pt || null;
		this._target = opts.target || null;
		
		this.setLyles(opts.xLyles, opts.yLyles);
	}
	
	
	this.getLyles = function() {
		return new Point(this._xLyles, this._yLyles);
	}
	this.getPoint = function() {
		if (this._target.style && this._target.style.x !== undefined && this._target.style.y !== undefined) {
			if (this._target.style.width !== undefined && this._target.style.height !== undefined) {
				return new Point(
					this._target.style.x + this._target.style.width/2,
					this._target.style.y + this._target.style.height/2
				);
			}
			return new Point(this._target.style);
		}
		if (this._target.x !== undefined && this._target.y !== undefined) {
			if (this._target.width  !== undefined&& this._target.height !== undefined) {
				return new Point(
					this._target.x + this._target.width/2,
					this._target.y + this._target.height/2
				);
			}
			return new Point(this._target);
		}
		if (typeof this._target == 'function') {
			var obj = this._target();
			return this.getPoint.call({_target: obj});
		}
	}
	
	this.getX = function() {
		if (this._target.style && this._target.style.x) {
			return this._target.style.x;
		}
		if (this._target.x) {
			return this._target.x;
		}
		if (typeof this._target == 'function') {
			var pt = this._target();
			return pt.x;
		}
	}
	this.getY = function() {
		if (this._target.style && this._target.style.y) {
			return this._target.style.y;
		}
		if (this._target.y) {
			return this._target.y;
		}
		if (typeof this._target == 'function') {
			var pt = this._target();
			return pt.y;
		}
	}
	
	this.setLyles = function(xLyles, yLyles) {
		var units = 'pt';
		if (typeof(xLyles) == 'string') {
			var units = xLyles.slice(yLyles.length-2);
			xLyles = parseFloat(xLyles.slice(0, xLyles.length-2));
			yLyles = parseFloat(yLyles.slice(0, yLyles.length-2));
		}
		this._xLyles = xLyles;
		this._yLyles = yLyles;
		this._units = units;
	}
});

var ZoomTo = CameraView.ZoomTo = Class('ZoomTo', function(logger, supr) {
	
	this.init = function(opts) {
		this._scale = opts.scale;
		this._maxSpeed = opts.maxSpeed;
		this._easeType = opts.easeType;
	}
	
	this.apply = function(camera) {
		camera.setMaxZoomSpeed(this._maxSpeed);
		camera.setZoomEasing(this._easeType);
		camera._zoomTo(this._scale);
	}
	
	this.done = function(camera) {
		return camera._scale === this._scale;
	}
	
});

var ZoomBy = CameraView.ZoomBy = Class('ZoomBy', function(logger, supr) {
	
	this.init = function(opts) {
		this._scale = opts.scale;
		this._maxSpeed = opts.maxSpeed;
		this._easeType = opts.easeType;
	}
	
	this.apply = function(camera) {
		camera.setMaxZoomSpeed(this._maxSpeed);
		camera.setZoomEasing(this._easeType);
		camera._zoomBy(this._scale);
		this._endScale = camera._scale * this._scale;
	}
	
	this.done = function(camera) {
		return camera._scale === this._endScale;
	}
	
});

var PanTo = CameraView.PanTo = Class('PanTo', function(logger, supr) {
	
	this.init = function(opts) {
		//opts.target can be a view, a point, or a function
		this._target = opts.target;
		this._maxSpeed = opts.maxSpeed;
		this._easeType = opts.easeType;
	}
	
	this.apply = function(camera) {
		camera.setMaxPanSpeed(this._maxSpeed);
		camera.setPanEasing(this._easeType);
		camera._moveTo(this._target);
	}

	this.done = function(camera) {
		return camera._centerX === this._target.x
		&& camera._centerY === this._target.y;
	}
	
});

var PanBy = CameraView.PanBy = Class('PanBy', function(logger, supr) {
	
	this.init = function(opts) {
		this._something = opts.something; //FIXME what is this called? offset? distance?
		this._maxSpeed = opts.maxSpeed;
		this._easeType = opts.easeType;
	}
	
	this.apply = function(camera) {
		camera.setMaxPanSpeed(this._maxSpeed);
		camera.setPanEasing(this._easeType);
		camera._moveBy(this._something);
		this._endX = camera._centerX + this._something.x;
		this._endY = camera._centerY + this._something.y;
	}
	
	this.done = function(camera) {
		return camera._centerX === this._endX
		&& camera._centerY === this._endY;
	}
	
});

var Group = CameraView.Group = Class('Group', function(logger, supr) {
	
	this.init = function(opts) {
		//TODO: make sure the group of scripts make sense
		this._scripts = opts.scripts;
	}
	
	this.apply = function(camera) {
		for (var i = 0, script; script = this._scripts[i]; i++) {
			script.apply(camera);
		}
	}
	
	this.done = function() {
		return _.all(this._scripts, function(script) { return script.done()});
	}
});

