import React from 'react';
import { useTranslation } from 'react-i18next';

const TestModeToggle = ({ testMode, onToggle }) => {
  const { t } = useTranslation();
  return (
    <div 
      className={`test-mode-toggle ${testMode ? 'active' : ''}`} 
      onClick={onToggle}
      title={`${t('controls.testMode')}: ${testMode ? t('controls.testOn') : t('controls.testOff')}`}
    >
      <div className="group-test-mode">
        <span className="test-mode-text"><span>{t('controls.testMode')}</span></span>
      </div>
    </div>
  );
};

export default TestModeToggle;
