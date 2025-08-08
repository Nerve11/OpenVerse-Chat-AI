import React from 'react';
import { useTranslation } from 'react-i18next';

const TemperatureSlider = ({ temperature, onTemperatureChange }) => {
  const { t } = useTranslation();
  return (
    <div className="temperature-slider-container">
      <label htmlFor="temperature" className="temperature-label">
        {t('controls.temp')}: <span>{temperature.toFixed(1)}</span>
      </label>
      <input
        type="range"
        id="temperature"
        name="temperature"
        name="temperature"
        min="0"
        max="2"
        step="0.1"
        value={temperature}
        onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
        className="temperature-slider"
        title={`${t('controls.temp')}: ${temperature.toFixed(1)}`}
      />
    </div>
  );
};

export default TemperatureSlider;
