class Anchor extends PointMass {
  constructor(x, y, mass) {
    super(x, y, mass);
    this.isSet = false;
  }

  update(timestamp) {
    super.update(timestamp);
  }

  get strain() {
    const linkAngle = this.link.angle;
    return this.link.strain;
  }
}

