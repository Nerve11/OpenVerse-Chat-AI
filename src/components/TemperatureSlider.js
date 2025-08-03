import React from 'react';

const TemperatureSlider = ({ temperature, onTemperatureChange }) => {
  return (
    <div className="temperature-slider-container">
      <label htmlFor="temperature" className="temperature-label">
        Temp: <span>{temperature.toFixed(1)}</span>
      </label>
      <input
        type="range"
        id="temperature"
        name="temperature"
        min="0"
        max="2"
        step="0.1"
        value={temperature}
        onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
        className="temperature-slider"
        title={`Set temperature to ${temperature.toFixed(1)}`}
      />
    </div>
  );
};

export default TemperatureSlider;
