var AnchorConstraint = {
	/*
	* 	Anchor point anchored to sea bed (where it lands)
	*/
	solve: function(anchor, Y0) {
		if (anchor.y >= Y0) {
			if (!anchor.isSet) {
				anchor.positionX = anchor.x;
				anchor.isSet = true;
			}
			anchor.x = anchor.positionX;
			anchor.y = Y0;
		} else {
			anchor.isSet = false;
		}
	}
};
