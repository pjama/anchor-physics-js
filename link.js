var Link = function(pointMass1, pointMass2, restingLength) {

  this.p1 = pointMass1;
  this.p2 = pointMass2;

  var restingDistance = restingLength;
  var tearDistance     = 5;
  var stiffness       = 1;

  var self = this;

  this.solve = function() {
    var dX = self.p1.x - self.p2.x;
    var dY = self.p1.y - self.p2.y;
    d = Math.sqrt(dX*dX + dY*dY);
    difference = (restingDistance - d) / d;

    var im1 = 1 / self.p1.mass;
    var im2 = 1 / self.p2.mass;

    var scalar1 = (im1 / (im1 + im2)) * stiffness;
    var scalar2 = stiffness - scalar1;

    self.p1.x += dX * difference * scalar1;
    self.p1.y += dY * difference * scalar1;

    self.p2.x -= dX * difference * scalar2;
    self.p2.y -= dY * difference * scalar2;
  }; // solve

}
