var SurfaceConstraint = {
  solve: function(point, wave, surfaceHeight) {
    point.y         = surfaceHeight + wave.posY;
  }
};
