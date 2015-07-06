var MASS 				= 1;
var X0 					= 500,
		Y0 					= 200;
var LINK_LENGTH = 5;


function Physics(canvas) {
	var mCanvas 			= canvas;
	var mPointMasses 	= [];
	var mLinks 				= [];

	var mCurrTime,
			mPrevTime 				= Date.now(),
			mLeftOverDeltaT 	= 0,
			mFixedDeltaT 			= 16,
			mDeltaT;

	this.initialize = function(numLinks) {
		var currPointMass = new PointMass(X0,Y0, MASS);
		var nextPointMass;

		mPointMasses.push(currPointMass);

		for (var i = 0; i < numLinks; i++) {
			 
			 nextPointMass = new PointMass(X0+(i+1)*LINK_LENGTH, Y0, MASS); // x, y, mass
			 mPointMasses.push(nextPointMass);

			 link = new Link(currPointMass, nextPointMass);
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
			updatePoints(mFixedDeltaT / 1000);
			solveLinks();

			clearCanvas();
			drawPoints();
			drawLinks();
		}
	}; // render

	function solveConstraints() {
		var rootPoint = mPointMasses[0];
		rootPoint.x = X0;
		rootPoint.y = Y0;
	}

	function solveLinks() {
		for (var i = 0; i < mLinks.length; i++) {
			mLinks[i].solve();
		}
	}

	function updatePoints(timestep) {
		for(var i = 0; i < mPointMasses.length; i++) {
			var p = mPointMasses[i];
			p.applyGravity();
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

