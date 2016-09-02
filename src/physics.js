let DEPTH         = 200;
let WAVE_HEIGHT   = 20;
let WAVE_LENGTH   = 30;
let WAVE_SPEED    = 5;
let FORCE_WIND    = 30000;
let FORCE_CURRENT = 0;
let CHAIN_MASS    = 5;

class Physics {
  constructor(canvas) {
    this._canvas       = canvas;
    this._renderer     = new CanvasRenderer(this._canvas);
    this._waveGenerator= new WaveGenerator();
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
      this._renderer.drawAll(this._time, this._boat, this._pointMasses);
      this._time += this._fixedDeltaTimeMS;
    }
  } // render

  solveConstraints() {
    GroundConstraint.solve(this._pointMasses, Y0);
    AnchorConstraint.solve(this._anchor, Y0);

    const offset = { y: Y0 - DEPTH };
    const firstPoint = this._pointMasses[0];
    const wave = this._waveGenerator.run(firstPoint.x, this._time, offset);
    SurfaceConstraint.solve(firstPoint, wave);
  }

  solveLinks() {
    for (let i = 0; i < this._links.length; i++) {
      this._links[i].solve();
    }
  }

  updatePoints(timestep) {
    const firstPoint = this._pointMasses[0];
    firstPoint.applyForce(FORCE_WIND, 0);     // wind
    let p;

    for(let i=0; i<this._pointMasses.length; i++) {
      p = this._pointMasses[i];
      p.mass = CHAIN_MASS;
      p.applyGravity();
      p.applyForce(FORCE_CURRENT, 0);  // water current
      p.applyDrag();
      p.update(timestep);
    }
  }
}

