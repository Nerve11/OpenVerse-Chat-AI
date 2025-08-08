import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ModelSelector from './ModelSelector';
import SystemPrompt from './SystemPrompt';
import TestModeToggle from './TestModeToggle';
import TemperatureSlider from './TemperatureSlider';
import FileUploader from './FileUploader';
import { useTranslation } from 'react-i18next';

const Controls = ({
  systemPrompt,
  onSystemPromptChange,
  isSystemPromptVisible,
  onToggleSystemPromptVisibility,
  onClearSystemPrompt,
  selectedModel,
  onSelectModel,
  isModelDropdownOpen,
  onToggleModelDropdown,
  onClearChat,
  onSearch,
  debugActive,
  onToggleDebug,
  testMode,
  onToggleTestMode,
  temperature,
  onTemperatureChange,
  onFilesAdded,
  attachmentsCount,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex-row">
      <ErrorBoundary>
        <SystemPrompt 
          systemPrompt={systemPrompt} 
          onSystemPromptChange={onSystemPromptChange}
          isVisible={isSystemPromptVisible}
          onToggleVisibility={onToggleSystemPromptVisibility}
          onClearPrompt={onClearSystemPrompt}
        />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <FileUploader onFilesAdded={onFilesAdded} filesCount={attachmentsCount} />
      </ErrorBoundary>

      <div className="choose-model">
        <ErrorBoundary>
          <ModelSelector 
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
            isOpen={isModelDropdownOpen}
            toggleDropdown={onToggleModelDropdown}
          />
        </ErrorBoundary>
      </div>
      <ErrorBoundary>
        <TemperatureSlider
          temperature={temperature}
          onTemperatureChange={onTemperatureChange}
        />
      </ErrorBoundary>
      <div className="clear-chat" onClick={onClearChat}>
        <div className="group-6">
          <span className="clear-chat-7"><span>{t('controls.clear')}</span></span>
          <div className="vector-8" />
        </div>
      </div>
      <div className="search" onClick={onSearch}>
        <div className="group-9">
          <span className="search-a"><span>{t('controls.search')}</span></span>
        </div>
        <div className="vector-b" />
      </div>
      <div className={`debug-button ${debugActive ? 'active' : ''}`} onClick={onToggleDebug}>
        <div className="group-debug">
          <span className="debug-text"><span>{t('controls.debug')}</span></span>
        </div>
      </div>
      <TestModeToggle testMode={testMode} onToggle={onToggleTestMode} />
    </div>
  );
};

export default Controls;
