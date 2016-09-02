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
    return this.link.strain * Math.cos(linkAngle);
  }
}

class Boat {
  constructor() {
    this.width = 50;
    this.coords = [
      { type:"path", points:[{x:0, y:0}, {x:this.width, y:0}] }
    ];
  }

  render(ctx, position, rotation) {
    // https://en.wikipedia.org/wiki/Rotation_matrix
    const sinTheta = Math.sin(rotation);
    const cosTheta = Math.cos(rotation);

    for (let coord of this.coords) {
      let pointA = {
        x: position.x + coord.points[0].x*cosTheta - coord.points[0].y*sinTheta,
        y: position.y + coord.points[0].x*sinTheta + coord.points[0].y*cosTheta
      };
      let pointB = {
        x: position.x + coord.points[1].x*cosTheta - coord.points[1].y*sinTheta,
        y: position.y + coord.points[1].x*sinTheta + coord.points[1].y*cosTheta
      };
      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.stroke();
    }
  }
}
class CanvasRenderer {
  constructor(canvas) {
    this._canvas = canvas;
  }

  drawAll(time) {
    const ctx = this._canvas.getContext("2d");
    this.clearCanvas(ctx);
    this.drawPoints(ctx);
    this.drawBoat(ctx, time);
    this.drawWater(ctx, time);
    this.drawGround(ctx);
  }

  clearCanvas(ctx) {
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  drawPoints(ctx) {
    ctx.fillStyle="#222";
    for(var i=0; i<this._pointMasses.length; i++) {
      let p = mPointMasses[i];
      ctx.fillRect(p.x, p.y, CHAIN_SIZE, CHAIN_SIZE);
    }
  }

  drawBoat(ctx, time) {
    const offset = { y: Y0-DEPTH };
    const x = this._pointMasses[0].x;
    const wave = waveGenerator(x, time, offset);
    mBoat.render(ctx, this._pointMasses[0], wave.velY/20);
  }

  drawWater(ctx, t) {
    const STEP = 5;
    const X_MAX = X0 + 800;
    let y = 0;
    ctx.fillStyle="#0000FF";

    for (let x=X0; x<X_MAX; x+=STEP) {
      const offset = { y: Y0 - DEPTH };
      const wave = waveGenerator(x, t, offset);
      ctx.fillRect(x+wave.x, wave.y, 2, 2);
    }
  }

  drawGround(ctx) {
    ctx.fillStyle="#666600";
    const X_MAX = X0 + 850;
    ctx.beginPath();
    ctx.moveTo(X0-50, Y0+5);
    ctx.lineTo(X_MAX, Y0+5);
    ctx.stroke();
  }
}

const G           = 98.1;
const MU_WATER    = 200; // viscosity of water
const CHAIN_MASS  = 1.5;
const CHAIN_SIZE  = 3;
const X0          = 200;
const Y0          = 500;
const LINK_LENGTH = 2;

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
let DEPTH         = 200;
let WAVE_HEIGHT   = 15;
let WAVE_LENGTH   = 25;
let WAVE_SPEED    = 5;
let FORCE_WIND    = 15000; // N/m
let FORCE_CURRENT = -10;   // N/m

class Physics {
  constructor(canvas) {
    this._canvas       = canvas;
    this._renderer     = new CanvasRenderer(this._canvas);
    this._pointMasses  = [];
    this._links        = [];
    this._boat         = new Boat(); // I wish it were this easy.
    this._anchor       = null;
    this._wave         = null;

    this._currTime         = Date.now();
    this._prevTime         = Date.now();
    this._time             = 0;
    this._leftOverDeltaT   = 0;
    this._fixedDeltaT      = 16;
    this._fixedDeltaTimeMS = this._fixedDeltaT / 1000;
    this._deltaT           = null;
  }

  initialize(numLinks) {
    let currPointMass = new PointMass(X0, Y0-DEPTH, CHAIN_MASS);
    let nextPointMass;
    let link;

    for (let i=0; i<numLinks; i++) {
       let pX = X0;
       let pY = Y0 - DEPTH;
       nextPointMass = new PointMass(pX, pY, CHAIN_MASS); // x, y, mass
       this._pointMasses.push(nextPointMass);

       link = new Link(currPointMass, nextPointMass, LINK_LENGTH);
       this._links.push(link);

       currPointMass = nextPointMass;
    }

    // anchor at the end of the chain
    this._anchor = new Anchor(X0, Y0-DEPTH, CHAIN_MASS*20);
    this._anchor.link = this._links[this._links.length - 1];
    this._pointMasses.push(this._anchor);

    link = new Link(nextPointMass, this._anchor, LINK_LENGTH);
    this._links.push(link);

  }; // initialize

  render() {
    this._currTime = Date.now();
    this._deltaT   = this._currTime - this._prevTime;
    this._prevTime = this._currTime;

    let numTimesteps = (this._deltaT + this._leftOverDeltaT) / this._fixedDeltaT;
    numTimesteps = Math.min(numTimesteps, 5);
    this._leftOverDeltaT = this._deltaT - (numTimesteps * this._fixedDeltaT);

    for (var i = 0; i < numTimesteps; i++) {
      this.solveConstraints(this._fixedDeltaTimeMS);
      this.updatePoints(this._fixedDeltaTimeMS);

      this.solveLinks();
      this.drawAll(this._time);
      
      this._time += this._fixedDeltaTimeMS;
    }
  } // render

  solveConstraints() {
    GroundConstraint.solve(this._pointMasses, Y0);
    AnchorConstraint.solve(this._anchor, Y0);

    const offset = { y: Y0 - DEPTH };
    const wave = waveGenerator(this._pointMasses[0].x, this._time, offset);
    SurfaceConstraint.solve(this._pointMasses[0], wave);
  }

  solveLinks() {
    for (let i = 0; i < this._links.length; i++) {
      this._links[i].solve();
    }
  }

  updatePoints(timestep) {
    const firstPoint = mPointMasses[0];
    firstPoint.applyForce(FORCE_WIND, 0);     // wind

    for(let i=0; i<this._pointMasses.length; i++) {
      var p = this._pointMasses[i];
      p.applyGravity();
      p.applyForce(FORCE_CURRENT, 0);  // water current
      p.applyDrag();
      p.update(timestep);
    }
  }
}

const DAMP  = 0.99;

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
        theta -Math.PI/2;
      }
    } else {
      theta = Math.atan((point.y - this.y) / (point.x - this.x));
    }
    return theta;
  }
}

class WaveGenerator {
/*
 *  https://en.wikipedia.org/wiki/Wave_power#Physical_concepts
 */
  getWaveAt(x, t, offset) {
    const ELLIPSE = 1.25;
    const k = Math.PI * WAVE_SPEED / WAVE_LENGTH;
    const translate = x / WAVE_LENGTH;
    const psi = -k*t+translate;
    const wave = {
      x: -Math.cos(psi) * WAVE_HEIGHT / ELLIPSE,
      y: Math.sin(psi) * WAVE_HEIGHT,
      phase: psi,
      velX: k*Math.sin(psi) * WAVE_HEIGHT / ELLIPSE,
      velY: k*Math.cos(psi) * WAVE_HEIGHT,
      accX: k*k*Math.cos(psi) * WAVE_HEIGHT,
      accY: -k*k*Math.sin(psi) * WAVE_HEIGHT
    };

    if (offset) {
      wave.x += offset.x || 0;
      wave.y += offset.y || 0;
    }
    return wave;
  }
}

