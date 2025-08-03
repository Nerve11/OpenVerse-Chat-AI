import React from 'react';

const TestModeToggle = ({ testMode, onToggle }) => {
  return (
    <div 
      className={`test-mode-toggle ${testMode ? 'active' : ''}`} 
      onClick={onToggle}
      title={`Test Mode is ${testMode ? 'ON' : 'OFF'}`}
    >
      <div className="group-test-mode">
        <span className="test-mode-text"><span>Test Mode</span></span>
      </div>
    </div>
  );
};

export default TestModeToggle;
