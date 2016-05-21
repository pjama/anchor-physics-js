var G 				 		= 98.1,
		MU_WATER 	    = 200; // viscosity of water

var MASS 					= 1.2;
var X0 						= 200,
		Y0 						= 500,
		DEPTH					= 200,
		WAVE_PERIOD 	= 12,
		WAVE_HEIGHT 	= 50,
		FORCE_WIND  	= 18000,
		FORCE_CURRENT = 0;

var LINK_LENGTH = 2;


function Physics(canvas) {
	var mCanvas 			= canvas;
	var mPointMasses 	= [];
	var mLinks 				= [];
	var mAnchor;
	var mWave;

	var mCurrTime,
			mPrevTime 				= Date.now(),
			mTime 						= 0,
			mLeftOverDeltaT 	= 0,
			mFixedDeltaT 			= 16,
			mFixedDeltaTimeMS = mFixedDeltaT / 1000,
			mDeltaT;

	this.initialize = function(numLinks) {
		var currPointMass  = new PointMass(X0,Y0 - DEPTH, MASS);
		var nextPointMass;

		for (var i = 0; i < numLinks; i++) {
			 var pX = X0;//X0+(i+1)*LINK_LENGTH;
			 var pY = Y0 - DEPTH;
			 nextPointMass = new PointMass(pX, pY, MASS); // x, y, mass
			 mPointMasses.push(nextPointMass);

			 link = new Link(currPointMass, nextPointMass, LINK_LENGTH);
			 mLinks.push(link);

			 currPointMass = nextPointMass;
		}

		// anchor at the end of the chain
		mAnchor = new Anchor(X0,Y0 - DEPTH, MASS*20); // 
		mPointMasses.push(mAnchor);

		link = new Link(nextPointMass, mAnchor, LINK_LENGTH);
		mLinks.push(link);

	}; // initialize

	this.render = function() {

		mCurrTime = Date.now();
		mDeltaT 	= mCurrTime - mPrevTime;
		mPrevTime = mCurrTime;

		var numTimesteps = (mDeltaT + mLeftOverDeltaT) / mFixedDeltaT;
		numTimesteps = Math.min(numTimesteps, 5);

		mLeftOverDeltaT = mDeltaT - (numTimesteps * mFixedDeltaT);
		var tension;

		for (var i = 0; i < numTimesteps; i++) {
			solveConstraints(mFixedDeltaTimeMS);
			updatePoints(mFixedDeltaTimeMS);
			tension = calculateTension();

			solveLinks();
			solveLinks();
			solveLinks();

			clearCanvas();
			drawPoints();

			mTime += mFixedDeltaTimeMS;
			// drawLinks();
		}
	}; // render

	function solveConstraints(elapsedTime) {
		GroundConstraint.solve(mPointMasses, Y0);
		AnchorConstraint.solve(mAnchor, Y0);
		mWave = waveGenerator(mTime);
		SurfaceConstraint.solve(mPointMasses[0], mWave, Y0 - DEPTH);
	}

	function solveLinks() {
		for (var i = 0; i < mLinks.length; i++) {
			mLinks[i].solve();
		}
	}

	function updatePoints(timestep) {

		var firstPoint = mPointMasses[0];
		firstPoint.applyForce(FORCE_WIND, 0); 		// wind

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
		// if (t < 20) { return 0; }
		var k = Math.PI / WAVE_PERIOD;
		return {
			posX: 0,
			posY: Math.sin(k*t) * WAVE_HEIGHT,
			velX: 0,
			velY: k*Math.cos(k*t) * WAVE_HEIGHT,
			accX: 0,
			accY: -k*k*Math.sin(k*t) * WAVE_HEIGHT
		};
	}

	function calculateTension() {
		// Tension at boat (Sum of forces about origin)
		var theta; // angle between wind force (0 deg) and anchor tension

		var link = mLinks[0];
		var pointA = mPointMasses[0],
				pointB = mPointMasses[1];

		var theta = pointA.angleTo( pointB ); // -π ≤ theta ≤ π
		var tension;
		// if (theta == Math.PI/2 || theta == -Math.PI/2) {
		// 	tension = 0;
		// } else {
			// var tensionX = (pointA.mass*pointA.accX - FORCE_WIND) / Math.sin(theta);
			// var tensionY = (pointA.mass*pointA.accY) / Math.sin(theta);
			// tension = Math.sqrt(tensionX*tensionX + tensionY*tensionY);
		var accY = mWave.accY;
		var totalMass = mPointMasses.length * pointA.mass;
			tension = totalMass*(mWave.accY - G) / Math.sin(theta);
		// }
		return tension;
	}
}

