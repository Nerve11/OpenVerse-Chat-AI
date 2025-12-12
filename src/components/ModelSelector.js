import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CLAUDE_MODELS } from '../utils/puterApi';
import ErrorBoundary from './ErrorBoundary';

// Функция для форматирования имени модели
const formatModelName = (modelId) => {
  // Удаляем префиксы провайдеров
  let name = modelId.replace(/^(openai\/|anthropic\/|google\/|meta-llama\/|x-ai\/|openrouter:)/i, '');
  
  // Заменяем дефисы и подчеркивания на пробелы
  name = name.replace(/[-_]/g, ' ');
  
  // Капитализируем первую букву каждого слова
  name = name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return name;
};

// Component just for the dropdown to isolate rendering issues
const ModelDropdown = ({ models, selectedModel, handleModelSelect, position }) => {
  // Группируем модели по провайдерам
  const groupedModels = useMemo(() => {
    const groups = {};
    
    models.forEach(model => {
      const provider = model.provider || 'Other';
      if (!groups[provider]) {
        groups[provider] = [];
      }
      groups[provider].push(model);
    });
    
    return groups;
  }, [models]);
  
  return (
    <div 
      className="model-dropdown" 
      style={{ 
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      {Object.entries(groupedModels).map(([provider, providerModels]) => (
        <div key={provider}>
          <div className="model-provider-header">{provider}</div>
          {providerModels.map((model) => (
            <div 
              key={model.id} 
              className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
              onClick={(e) => handleModelSelect(e, model.id)}
              title={model.description || model.display}
            >
              {model.display}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Use a single document-level portal for all dropdown instances
let globalPortalNode = null;

const getPortalNode = () => {
  if (!globalPortalNode && typeof document !== 'undefined') {
    globalPortalNode = document.createElement('div');
    globalPortalNode.className = 'model-dropdown-portal';
    globalPortalNode.setAttribute('data-testid', 'model-dropdown-portal');
    document.body.appendChild(globalPortalNode);
  }
  return globalPortalNode;
};

const ModelSelector = ({ selectedModel, onSelectModel, isOpen, toggleDropdown, availableModels = [] }) => {
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const selectorRef = useRef(null);
  const portalNode = getPortalNode();
  
  // Статический список моделей (используется как fallback)
  const staticModels = useMemo(() => [
    { id: CLAUDE_MODELS.CLAUDE_3_7_SONNET, display: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
    { id: CLAUDE_MODELS.CLAUDE_3_5_SONNET, display: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: CLAUDE_MODELS.O1, display: 'o1', provider: 'OpenAI' },
    { id: CLAUDE_MODELS.O1_PRO, display: 'o1-pro', provider: 'OpenAI' },
    { id: CLAUDE_MODELS.O3, display: 'o3', provider: 'OpenAI' },
    { id: CLAUDE_MODELS.O3_MINI, display: 'o3-mini', provider: 'OpenAI' },
    { id: CLAUDE_MODELS.O4_MINI, display: 'o4-mini', provider: 'OpenAI' },
    { id: CLAUDE_MODELS.GPT_4O, display: 'GPT-4o', provider: 'OpenAI' },
    { id: CLAUDE_MODELS.GPT_4_1, display: 'GPT-4.1', provider: 'OpenAI' },
    { id: CLAUDE_MODELS.META_LLAMA_3_1_8B, display: 'Meta Llama 3.1 8B', provider: 'Meta' },
    { id: CLAUDE_MODELS.META_LLAMA_3_1_70B, display: 'Meta Llama 3.1 70B', provider: 'Meta' },
    { id: CLAUDE_MODELS.META_LLAMA_3_1_405B, display: 'Meta Llama 3.1 405B', provider: 'Meta' },
    { id: CLAUDE_MODELS.GEMINI_2_0_FLASH, display: 'Gemini 2.0 Flash', provider: 'Google' },
    { id: CLAUDE_MODELS.DEEPSEEK_CHAT, display: 'DeepSeek Chat', provider: 'DeepSeek' },
    { id: CLAUDE_MODELS.DEEPSEEK_REASONER, display: 'DeepSeek Reasoner', provider: 'DeepSeek' },
    { id: CLAUDE_MODELS.PIXTRAL_LARGE_LATEST, display: 'Pixtral Large', provider: 'Mistral' },
    { id: CLAUDE_MODELS.GEMMA_2_27B_IT, display: 'Gemma 2 27B', provider: 'Google' },
    { id: CLAUDE_MODELS.GROK_BETA, display: 'Grok Beta', provider: 'xAI' },
    { id: CLAUDE_MODELS.GROK4, display: 'Grok-4', provider: 'xAI' },
    { id: CLAUDE_MODELS.GPT5, display: 'GPT-5', provider: 'OpenAI' }
  ], []);
  
  // Используем динамический список если доступен, иначе статический
  const models = useMemo(() => {
    if (availableModels && availableModels.length > 0) {
      // Форматируем динамические модели
      return availableModels.map(model => ({
        id: model.id,
        display: model.name || formatModelName(model.id),
        provider: model.provider || 'Unknown',
        description: model.description
      }));
    }
    // Fallback на статический список
    return staticModels;
  }, [availableModels, staticModels]);

  // Safely find the display name for the currently selected model
  const getSelectedModelName = () => {
    try {
      if (!selectedModel) return 'Select model';
      
      const model = models.find(m => m.id === selectedModel);
      return model ? model.display : formatModelName(selectedModel);
    } catch (error) {
      console.error('Error getting model name:', error);
      return 'Select model';
    }
  };
  
  const selectedModelName = getSelectedModelName();
    
  // Calculate dropdown position based on the selector's position
  useEffect(() => {
    if (isOpen && selectorRef.current) {
      try {
        const rect = selectorRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
      } catch (error) {
        console.error('Error calculating dropdown position:', error);
      }
    }
  }, [isOpen]);

  // Handle model selection with error checking
  const handleModelSelect = (e, modelId) => {
    try {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      
      if (typeof onSelectModel === 'function' && modelId) {
        // Close dropdown before notifying parent to avoid DOM inconsistencies
        setTimeout(() => {
          onSelectModel(modelId);
        }, 0);
      }
    } catch (error) {
      console.error('Error selecting model:', error);
    }
  };

  // Create the dropdown portal safely
  const renderDropdown = () => {
    if (!isOpen || !portalNode) return null;
    
    try {
      return createPortal(
        <ErrorBoundary>
          <ModelDropdown 
            models={models}
            selectedModel={selectedModel}
            handleModelSelect={handleModelSelect}
            position={dropdownPosition}
          />
        </ErrorBoundary>,
        portalNode
      );
    } catch (error) {
      console.error('Error rendering dropdown:', error);
      return null;
    }
  };

  return (
    <div className="model-selector-container">
      <div 
        className="select-model" 
        onClick={toggleDropdown}
        ref={selectorRef}
        title={selectedModelName}
      >
        <div className="group-5" />
        <span className="select-model-4">
          <span>{selectedModelName}</span>
        </span>
      </div>
      
      {renderDropdown()}
    </div>
  );
};

export default ModelSelector; 
