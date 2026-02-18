import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './ErrorBoundary';
import TemperatureSlider from './TemperatureSlider';
import FileUploader from './FileUploader';
import SystemPrompt from './SystemPrompt';

const isOpenAIModel = (modelId) => {
  if (!modelId) return false;
  const id = modelId.toLowerCase();
  return id.includes('gpt') || id.includes('o1') || id.includes('o3') || id.includes('o4') || id.startsWith('openai/');
};

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
  maxTokens,
  onMaxTokensChange,
  reasoningEffort,
  onReasoningEffortChange,
  selectedModel,
  onFilesAdded,
  attachmentsCount,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <ErrorBoundary>
        <SystemPrompt
          systemPrompt={systemPrompt}
          onSystemPromptChange={onSystemPromptChange}
          isVisible={isSystemPromptVisible}
          onToggleVisibility={onToggleSystemPromptVisibility}
          onClearPrompt={onClearSystemPrompt}
        />
      </ErrorBoundary>

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

        {/* Max Tokens slider */}
        <div className="temperature-slider-container">
          <label htmlFor="max-tokens" className="temperature-label">
            {t('controls.maxTokens', 'Max Tokens')}: <span>{maxTokens.toLocaleString('en-US')}</span>
          </label>
          <input
            type="range"
            id="max-tokens"
            min="256"
            max="32768"
            step="256"
            value={maxTokens}
            onChange={(e) => onMaxTokensChange(parseInt(e.target.value, 10))}
            className="temperature-slider temperature-slider--wide"
            title={`Max Tokens: ${maxTokens}`}
          />
        </div>

        {/* Reasoning Effort select — OpenAI only */}
        {isOpenAIModel(selectedModel) && (
          <div className="temperature-slider-container">
            <label htmlFor="reasoning-effort" className="temperature-label">
              {t('controls.reasoningEffort', 'Reasoning')}:
            </label>
            <select
              id="reasoning-effort"
              value={reasoningEffort}
              onChange={(e) => onReasoningEffortChange(e.target.value)}
              className="reasoning-effort-select"
              title="Reasoning Effort (OpenAI only)"
            >
              <option value="">— default —</option>
              <option value="none">none</option>
              <option value="minimal">minimal</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="xhigh">xhigh</option>
            </select>
          </div>
        )}

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
