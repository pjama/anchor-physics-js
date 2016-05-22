var GroundConstraint = {
  solve: function(points, Y0) {
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      if (point.y > Y0) {
        point.y = Y0;
      }
    }
  }
};
