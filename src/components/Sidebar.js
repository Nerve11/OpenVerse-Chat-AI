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
    // Проверяем что model существует
    if (!model) {
      return 'Unknown Model';
    }
    
    // Если это объект с полем name, используем его
    if (typeof model === 'object' && model.name) {
      return model.name;
    }
    
    // Если это строка
    if (typeof model === 'string') {
      try {
        const name = model.replace('anthropic.', '').replace(/-/g, ' ');
        return name.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      } catch (error) {
        console.error('Error formatting model name:', error);
        return String(model);
      }
    }
    
    return 'Unknown Model';
  };

  // Получаем краткое описание модели
  const getModelDescription = (model) => {
    if (!model) return 'AI Model';
    
    // Если у модели есть description из API
    if (typeof model === 'object' && model.description) {
      return model.description;
    }
    
    // Определяем по ID/name
    const modelStr = typeof model === 'object' ? (model.id || model.name || '') : String(model);
    const lowerModel = modelStr.toLowerCase();
    
    if (lowerModel.includes('3-5-sonnet') || lowerModel.includes('3.5-sonnet')) return 'Balanced - Best for most tasks';
    if (lowerModel.includes('3-7-sonnet') || lowerModel.includes('3.7-sonnet')) return 'Advanced - Latest model';
    if (lowerModel.includes('opus')) return 'Powerful - Complex reasoning';
    if (lowerModel.includes('haiku')) return 'Fast - Quick responses';
    if (lowerModel.includes('gpt-4')) return 'OpenAI GPT-4';
    if (lowerModel.includes('gpt-5')) return 'OpenAI GPT-5';
    if (lowerModel.includes('o1')) return 'Reasoning model';
    if (lowerModel.includes('gemini')) return 'Google Gemini';
    if (lowerModel.includes('llama')) return 'Meta Llama';
    if (lowerModel.includes('deepseek')) return 'DeepSeek AI';
    if (lowerModel.includes('grok')) return 'xAI Grok';
    
    // Если есть provider, показываем его
    if (typeof model === 'object' && model.provider) {
      return `${model.provider} Model`;
    }
    
    return 'AI Model';
  };

  // Получаем ID модели для сравнения
  const getModelId = (model) => {
    if (!model) return null;
    if (typeof model === 'object') return model.id || model.model_id || model.name;
    return model;
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
            {t('sidebar.models')}
          </div>
          <div className="model-list">
            {availableModels && availableModels.length > 0 ? (
              availableModels.map((model, index) => {
                const modelId = getModelId(model);
                const modelKey = modelId || `model-${index}`;
                const isSelected = selectedModel === modelId;
                
                return (
                  <div
                    key={modelKey}
                    className={`model-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectModel(modelId)}
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
                );
              })
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
            title={t('controls.systemPrompt')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>{systemPrompt ? t('controls.editPrompt') : t('controls.systemPrompt')}</span>
          </button>
          
          <button 
            className="sidebar-button"
            onClick={onClearChat}
            title={t('controls.clearChat')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>{t('controls.clearChat')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;