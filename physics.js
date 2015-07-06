var MASS 				= 0.5;
var X0 					= 200,
		Y0 					= 500,
		DEPTH				= 200,
		WAVE_PERIOD = 998,
		WAVE_HEIGHT = 50;
var LINK_LENGTH = 3;


function Physics(canvas) {
	var mCanvas 			= canvas;
	var mPointMasses 	= [];
	var mLinks 				= [];

	var mCurrTime,
			mPrevTime 				= Date.now(),
			mLeftOverDeltaT 	= 0,
			mFixedDeltaT 			= 16,
			mFixedDeltaTimeMS = mFixedDeltaT / 1000,
			mDeltaT;

	var mAnchorSet   		= false,
			mAnchoringX			= X0;

	this.initialize = function(numLinks) {
		var currPointMass = new PointMass(X0,Y0 - DEPTH, MASS*10);
		var nextPointMass;

		mPointMasses.push(currPointMass);

		for (var i = 0; i < numLinks; i++) {
			 var pX = X0;//X0+(i+1)*LINK_LENGTH;
			 var pY = Y0 - DEPTH;
			 nextPointMass = new PointMass(pX, pY, MASS); // x, y, mass
			 mPointMasses.push(nextPointMass);

			 link = new Link(currPointMass, nextPointMass, LINK_LENGTH);
			 mLinks.push(link);

			 currPointMass = nextPointMass;
		}
	}; // initialize

	this.render = function() {

		mCurrTime = Date.now();
		mDeltaT 	= mCurrTime - mPrevTime;
		mPrevTime = mCurrTime;

		var numTimesteps = (mDeltaT + mLeftOverDeltaT) / mFixedDeltaT;
		numTimesteps = Math.min(numTimesteps, 5);

		mLeftOverDeltaT = mDeltaT - (numTimesteps * mFixedDeltaT);

		for (var i = 0; i < numTimesteps; i++) {
			solveConstraints();
			updatePoints(mFixedDeltaTimeMS);

			solveLinks();
			solveLinks();
			solveLinks();

			clearCanvas();
			drawPoints();
			drawLinks();
		}
	}; // render

	function solveConstraints() {
		// Root point anchored to sea bed (where it lands)
		var rootPoint = mPointMasses[0];
		if (rootPoint.y >= Y0) {
			if (!mAnchorSet) {
				mAnchoringX = rootPoint.x;
				mAnchorSet = true;
			}
			rootPoint.x = mAnchoringX;
			rootPoint.y = Y0;
		} else {
			mAnchorSet = false;
		}

		// resting on sea bed
		for (var i = 0; i < mPointMasses.length; i++) {
			var point = mPointMasses[i];
			if (point.y > Y0) {
				point.y = Y0;
			}
		}

		// Last Point on surface of water
		var lastPoint	= mPointMasses[mPointMasses.length - 1];
		var wave 			= Math.sin(Date.now() / WAVE_PERIOD) * WAVE_HEIGHT;
		lastPoint.y 	= Y0 - DEPTH + wave;
	}

	function solveLinks() {
		for (var i = 0; i < mLinks.length; i++) {
			mLinks[i].solve();
		}
	}

	function updatePoints(timestep) {

		var lastPoint	= mPointMasses[mPointMasses.length - 1];
		lastPoint.applyForce(2500, 0); 		// wind

		for(var i = 0; i < mPointMasses.length; i++) {
			var p = mPointMasses[i];
			p.applyGravity();
			p.applyForce(5, 0);  // water current
			p.applyDrag();
			p.update(timestep);
		}
	}

	function clearCanvas() {
		var ctx = mCanvas.getContext("2d");
		ctx.clearRect(0, 0, mCanvas.width, mCanvas.height);
	}

	function drawPoints() {
		var ctx = mCanvas.getContext("2d");

		for(var i = 0; i < mPointMasses.length; i++) {
			var p = mPointMasses[i];
			ctx.fillRect(p.x, p.y, 2, 2);
		}
	}

	function drawLinks() {
		var ctx = mCanvas.getContext("2d");

		for(var i = 0; i < mLinks.length; i++) {
			var link = mLinks[i];
			ctx.beginPath();
      ctx.moveTo(link.p1.x, link.p1.y);
      ctx.lineTo(link.p2.x, link.p2.y);
      ctx.stroke();
		}	
	}
}

