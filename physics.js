var MASS 					= 1.2;
var X0 						= 200,
		Y0 						= 500,
		DEPTH					= 200,
		WAVE_PERIOD 	= 998,
		WAVE_HEIGHT 	= 25,
		FORCE_WIND  	= 4000,
		FORCE_CURRENT = 10;

var LINK_LENGTH = 2;


function Physics(canvas) {
	var mCanvas 			= canvas;
	var mPointMasses 	= [];
	var mLinks 				= [];
	var mAnchor 			= new Anchor();

	var mCurrTime,
			mPrevTime 				= Date.now(),
			mLeftOverDeltaT 	= 0,
			mFixedDeltaT 			= 16,
			mFixedDeltaTimeMS = mFixedDeltaT / 1000,
			mDeltaT;

	this.initialize = function(numLinks) {
		var currPointMass = new PointMass(X0,Y0 - DEPTH, MASS*20);
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
			// drawLinks();
		}
	}; // render

	function solveConstraints() {
		GroundConstraint.solve(mPointMasses, Y0);
		AnchorConstraint.solve(mPointMasses, Y0, mAnchor);
		SurfaceConstraint.solve(mPointMasses, waveGenerator, Y0 - DEPTH)
	}

	function solveLinks() {
		for (var i = 0; i < mLinks.length; i++) {
			mLinks[i].solve();
		}
	}

	function updatePoints(timestep) {

		var lastPoint	= mPointMasses[mPointMasses.length - 1];
		lastPoint.applyForce(FORCE_WIND, 0); 		// wind

		for(var i = 0; i < mPointMasses.length; i++) {
			var p = mPointMasses[i];
			p.applyGravity();
			p.applyForce(FORCE_CURRENT, 0);  // water current
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
			ctx.fillRect(p.x, p.y, 3, 3);
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

	function waveGenerator(t) {
		return Math.sin(t / WAVE_PERIOD) * WAVE_HEIGHT
	}
}

