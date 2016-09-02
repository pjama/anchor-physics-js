class Link {
  constructor(pointMass1, pointMass2, restingLength) {
    this.p1 = pointMass1;
    this.p2 = pointMass2;

    this.restingDistance = restingLength;

    this.stiffness = 1;
    this.strain    = 0;
  }

  get angle() {
    return this.p1.angleTo(this.p2);
  }

  solve() {
    const dX = this.p1.x - this.p2.x;
    const dY = this.p1.y - this.p2.y;
    const d = Math.sqrt(dX*dX + dY*dY);
    const difference = (this.restingDistance - d) / d;
    this.strain = (d - this.restingDistance) / this.restingDistance;

    const im1 = 1 / this.p1.mass;
    const im2 = 1 / this.p2.mass;

    const scalar1 = (im1 / (im1 + im2)) * this.stiffness;
    const scalar2 = this.stiffness - scalar1;

    this.p1.x += dX * difference * scalar1;
    this.p1.y += dY * difference * scalar1;

    this.p2.x -= dX * difference * scalar2;
    this.p2.y -= dY * difference * scalar2;
  } // solve
}
