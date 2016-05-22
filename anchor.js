
Anchor.prototype = Object.create(PointMass.prototype);

function Anchor(x, y, mass) {
  PointMass.call(this, x, y, mass);
  this.isSet       = false;
  this.positionX   = null
};
