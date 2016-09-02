function updateSlider(slider) {
  const sliderVal = parseFloat(slider.value);
  switch(slider.id) {
    case "sliderWindForce":
      FORCE_WIND = sliderVal;
      break;
    case "sliderWaterCurrent":
      FORCE_CURRENT = sliderVal;
      break;
    case "sliderWaterDepth":
      DEPTH = sliderVal;
      break;
    case "sliderWaveSize":
      WAVE_LENGTH = sliderVal + 10;
      WAVE_HEIGHT = sliderVal;
      break;
    case "sliderChainWeight":
      CHAIN_MASS = sliderVal;
      break;
  }
}

