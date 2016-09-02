STRAIN_THRESHOLD = 1.50;

var AnchorConstraint = {
  /*
  *   Anchor point anchored to sea bed (where it lands)
  *   Drag when force (strain) exceeds threshold
  */
  solve: function(anchor, Y0) {
    const anchorAngle = anchor.link.angle;
    const anchorHold = anchor.strain / Math.sinh(5.5*anchorAngle); // Anchor hold is approx 50% @ 15 degrees
    if (anchor.y >= Y0 && anchorHold < STRAIN_THRESHOLD) {
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
