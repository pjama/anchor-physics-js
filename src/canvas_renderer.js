class CanvasRenderer {
  constructor(canvas) {
    this._canvas = canvas;
  }

  drawAll(time, boat, points) {
    this._waveGenerator = new WaveGenerator();
    const ctx = this._canvas.getContext("2d");
    this.clearCanvas(ctx);
    this.drawPoints(ctx, points);
    this.drawBoat(ctx, boat, time, points[0]);
    this.drawWater(ctx, time);
    this.drawGround(ctx);
  }

  clearCanvas(ctx) {
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  drawPoints(ctx, points) {
    ctx.fillStyle="#222";
    for(let i=0; i<points.length; i++) {
      let p = points[i];
      ctx.fillRect(p.x, p.y, CHAIN_SIZE, CHAIN_SIZE);
    }
  }

  drawBoat(ctx, boat, time, point) {
    const offset = { y: Y0-DEPTH };
    const x = point.x;
    const wave = this._waveGenerator.run(x, time, offset);
    boat.render(ctx, point, wave.velY*WAVE_HEIGHT/300);
  }

  drawWater(ctx, t) {
    const STEP = 5;
    const X_MAX = X0 + 800;
    let y = 0;
    ctx.fillStyle="#0000FF";

    for (let x=X0; x<X_MAX; x+=STEP) {
      const offset = { y: Y0 - DEPTH };
      const wave = this._waveGenerator.run(x, t, offset);
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

