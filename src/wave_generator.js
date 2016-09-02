class WaveGenerator {
/*
 *  https://en.wikipedia.org/wiki/Wave_power#Physical_concepts
 */
  run(x, t, offset) {
    const ELLIPSE = 1.25;
    const k = Math.PI * WAVE_SPEED / WAVE_LENGTH;
    const translate = x / WAVE_LENGTH;
    const phi = -k*t+translate;
    const wave = {
      x: -Math.cos(phi) * WAVE_HEIGHT / ELLIPSE,
      y: Math.sin(phi) * WAVE_HEIGHT,
      phase: phi,
      velX: k*Math.sin(phi) * WAVE_HEIGHT / ELLIPSE,
      velY: k*Math.cos(phi) * WAVE_HEIGHT,
      accX: k*k*Math.cos(phi) * WAVE_HEIGHT,
      accY: -k*k*Math.sin(phi) * WAVE_HEIGHT
    };

    if (offset) {
      wave.x += offset.x || 0;
      wave.y += offset.y || 0;
    }
    return wave;
  }
}

