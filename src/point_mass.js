const DAMP  = 1;

class PointMass {
  constructor(x, y, mass) {
    this.mass   = mass;
    this.x      = x;
    this.y      = y;
    this.lastX  = x;
    this.lastY  = y;
    this.velX   = 0;
    this.velY   = 0;
    this.accX   = 0;
    this.accY   = 0;
  }

  update(timestep) {
    this.velX = this.x - this.lastX;
    this.velY = this.y - this.lastY;

    this.velX *= DAMP;
    this.velY *= DAMP;

    const timestepSq = timestep * timestep;
    const nextX = this.x + this.velX + 0.5*this.accX*timestepSq;
    const nextY = this.y + this.velY + 0.5*this.accY*timestepSq;

    this.lastX = this.x;
    this.lastY = this.y;

    this.x = nextX;
    this.y = nextY;

    this.accX = 0;
    this.accY = 0;
  }

  applyForce(Fx, Fy) {
    this.accX += Fx / this.mass;
    this.accY += Fy / this.mass;
  }

  applyGravity() {
    this.applyForce(0, this.mass*G);
  }

  applyDrag() {
    const Fx = -1 * MU_WATER * this.velX;
    const Fy = -1 * MU_WATER * this.velY;
    this.applyForce(Fx, Fy);
  }

  angleTo(point) {
    let theta;

    if (this.x == point.x) {
      if (this.y < point.y) {
        theta = Math.PI / 2;
      } else {
        theta = -Math.PI/2;
      }
    } else {
      theta = Math.atan((this.y - point.y) / (point.x - this.x));
    }
    return theta;
  }
}

