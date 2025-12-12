import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import TemperatureSlider from './TemperatureSlider';
import FileUploader from './FileUploader';
import SystemPrompt from './SystemPrompt';

const Controls = ({
  systemPrompt,
  onSystemPromptChange,
  isSystemPromptVisible,
  onToggleSystemPromptVisibility,
  onClearSystemPrompt,
  debugActive,
  testMode,
  temperature,
  onTemperatureChange,
  onFilesAdded,
  attachmentsCount,
}) => {
  return (
    <>
      {/* SystemPrompt overlay - показывается при isSystemPromptVisible */}
      <ErrorBoundary>
        <SystemPrompt 
          systemPrompt={systemPrompt} 
          onSystemPromptChange={onSystemPromptChange}
          isVisible={isSystemPromptVisible}
          onToggleVisibility={onToggleSystemPromptVisibility}
          onClearPrompt={onClearSystemPrompt}
        />
      </ErrorBoundary>
      
      {/* Нижняя панель с контролами */}
      <div className="flex-row">
        <ErrorBoundary>
          <FileUploader onFilesAdded={onFilesAdded} filesCount={attachmentsCount} />
        </ErrorBoundary>

        <ErrorBoundary>
          <TemperatureSlider
            temperature={temperature}
            onTemperatureChange={onTemperatureChange}
          />
        </ErrorBoundary>
        
        {debugActive && (
          <div className="debug-indicator">
            <span>🐛 Debug Mode</span>
          </div>
        )}
        
        {testMode && (
          <div className="test-mode-indicator">
            <span>🧪 Test Mode</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Controls;