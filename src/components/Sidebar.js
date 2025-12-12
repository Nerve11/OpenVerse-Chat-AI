import React from 'react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ 
  selectedModel, 
  onSelectModel, 
  availableModels,
  onClearChat,
  systemPrompt,
  onToggleSystemPromptVisibility
}) => {
  const { t } = useTranslation();

  // Форматирование названия модели
  const formatModelName = (model) => {
    if (!model) return '';
    // Убираем anthropic. и делаем читабельным
    const name = model.replace('anthropic.', '').replace(/-/g, ' ');
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Получаем краткое описание модели
  const getModelDescription = (model) => {
    if (model.includes('3-5-sonnet')) return 'Balanced - Best for most tasks';
    if (model.includes('3-7-sonnet')) return 'Advanced - Latest model';
    if (model.includes('3-opus')) return 'Powerful - Complex reasoning';
    if (model.includes('3-haiku')) return 'Fast - Quick responses';
    return 'AI Model';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">OV</div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">OpenVerse</div>
            <div className="sidebar-logo-subtitle">Chat AI</div>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            {t('sidebar.models') || 'AI MODELS'}
          </div>
          <div className="model-list">
            {availableModels && availableModels.length > 0 ? (
              availableModels.map((model) => (
                <div
                  key={model}
                  className={`model-item ${selectedModel === model ? 'selected' : ''}`}
                  onClick={() => onSelectModel(model)}
                >
                  <div className="model-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="model-info">
                    <div className="model-name">{formatModelName(model)}</div>
                    <div className="model-description">{getModelDescription(model)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="model-item">
                <div className="model-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <div className="model-info">
                  <div className="model-name">Loading...</div>
                  <div className="model-description">Please wait</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-controls">
          <button 
            className="sidebar-button"
            onClick={onToggleSystemPromptVisibility}
            title={t('controls.systemPrompt') || 'System Prompt'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>{systemPrompt ? t('controls.editPrompt') || 'Edit Prompt' : t('controls.systemPrompt') || 'System Prompt'}</span>
          </button>
          
          <button 
            className="sidebar-button"
            onClick={onClearChat}
            title={t('controls.clearChat') || 'Clear Chat'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>{t('controls.clearChat') || 'Clear Chat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;