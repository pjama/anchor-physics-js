var AnchorConstraint = {
	/* 
	* 	Root point anchored to sea bed (where it lands)
	*/
	solve: function(points, Y0, anchor) {
		var rootPoint = points[0];
		if (rootPoint.y >= Y0) {
			if (!anchor.isSet) {
				anchor.positionX = rootPoint.x;
				anchor.isSet = true;
			}
			rootPoint.x = anchor.positionX;
			rootPoint.y = Y0;
		} else {
			anchor.isSet = false;
		}
	}
}
