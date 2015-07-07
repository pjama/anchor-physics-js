var SurfaceConstraint = {
	solve: function(points, waveGenerator, surfaceHeight) {
		var lastPoint		= points[points.length - 1];
		var waveHeight	= waveGenerator(Date.now());
		lastPoint.y 		= surfaceHeight + waveHeight;
	}
}
