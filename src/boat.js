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
