class CanvasRenderer {
  constructor(canvas) {
    this._canvas = canvas;
  }

  drawAll(time, boat, points) {
    this._waveGenerator = new WaveGenerator();
    const ctx = this._canvas.getContext("2d");
    this.clearCanvas(ctx);
    this.drawGround(ctx);
    this.drawWater(ctx, time);
    this.drawBoat(ctx, boat, time, points[0]);
    this.drawChain(ctx, points);
  }

  clearCanvas(ctx) {
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  drawChain(ctx, points) {
    ctx.fillStyle="#444";
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
    const ANGLE = 0.25;
    const X_MAX = X0 + 800;
    let y = 0;
    ctx.fillStyle="#3333FF";

    for (let x=X0; x<X_MAX; x+=STEP) {
      const offset = { y: Y0 - DEPTH };
      const wave = this._waveGenerator.run(x, t, offset);
      ctx.beginPath();
      ctx.arc(x+wave.x, wave.y, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x+wave.x+wave.y * ANGLE, wave.y-50);
      ctx.lineTo(x+wave.x-wave.y * ANGLE, wave.y+50);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#AAAAFF";
      ctx.stroke();
    }
  }

  drawGround(ctx) {
    const STEP = 5;
    const ANGLE = 0.25;
    ctx.strokeStyle="#A0522D";
    const X_MAX = X0 + 850;
    ctx.lineWidth = 1;
    for (let x=X0; x<X_MAX; x+=STEP) {
      ctx.beginPath();
      ctx.moveTo(x+50, Y0-50);
      ctx.lineTo(x-50, Y0+50);
      ctx.stroke();
    }
  }
}
