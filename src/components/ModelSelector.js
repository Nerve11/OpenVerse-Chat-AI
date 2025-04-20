import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CLAUDE_MODELS } from '../utils/puterApi';
import ErrorBoundary from './ErrorBoundary';

// Component just for the dropdown to isolate rendering issues
const ModelDropdown = ({ models, selectedModel, handleModelSelect, position }) => {
  return (
    <div 
      className="model-dropdown" 
      style={{ 
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      {models.map((model) => (
        <div 
          key={model.id} 
          className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
          onClick={(e) => handleModelSelect(e, model.id)}
        >
          {model.display}
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

const ModelSelector = ({ selectedModel, onSelectModel, isOpen, toggleDropdown }) => {
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const selectorRef = useRef(null);
  const portalNode = getPortalNode();
  
  // Create an array of model objects with display names and values
  const models = [
    { id: CLAUDE_MODELS.CLAUDE_3_7_SONNET, display: 'Claude 3.7 Sonnet' },
    { id: CLAUDE_MODELS.CLAUDE_3_5_SONNET, display: 'Claude 3.5 Sonnet' },
    { id: CLAUDE_MODELS.O1, display: 'o1' },
    { id: CLAUDE_MODELS.O1_PRO, display: 'o1-pro' },
    { id: CLAUDE_MODELS.O1_MINI, display: 'o1-mini' },
    { id: CLAUDE_MODELS.O3, display: 'o3' },
    { id: CLAUDE_MODELS.O3_MINI, display: 'o3-mini' },
    { id: CLAUDE_MODELS.O4_MINI, display: 'o4-mini' },
    { id: CLAUDE_MODELS.GPT_4O, display: 'GPT-4o' },
    { id: CLAUDE_MODELS.GPT_4O_MINI, display: 'GPT-4o Mini' },
    { id: CLAUDE_MODELS.GPT_4_1, display: 'GPT-4.1' },
    { id: CLAUDE_MODELS.GPT_4_1_MINI, display: 'GPT-4.1 Mini' },
    { id: CLAUDE_MODELS.GPT_4_1_NANO, display: 'GPT-4.1 Nano' },
    { id: CLAUDE_MODELS.GPT_4_5_PREVIEW, display: 'GPT-4.5 Preview' },
    { id: CLAUDE_MODELS.META_LLAMA_3_1_8B, display: 'Meta Llama 3.1 8B' },
    { id: CLAUDE_MODELS.META_LLAMA_3_1_70B, display: 'Meta Llama 3.1 70B' },
    { id: CLAUDE_MODELS.META_LLAMA_3_1_405B, display: 'Meta Llama 3.1 405B' },
    { id: CLAUDE_MODELS.GEMINI_2_0_FLASH, display: 'Gemini 2.0 Flash' },
    { id: CLAUDE_MODELS.GEMINI_1_5_FLASH, display: 'Gemini 1.5 Flash' },
    { id: CLAUDE_MODELS.DEEPSEEK_CHAT, display: 'DeepSeek Chat' },
    { id: CLAUDE_MODELS.DEEPSEEK_REASONER, display: 'DeepSeek Reasoner' },
    { id: CLAUDE_MODELS.MISTRAL_LARGE_LATEST, display: 'Mistral Large' },
    { id: CLAUDE_MODELS.PIXTRAL_LARGE_LATEST, display: 'Pixtral Large' },
    { id: CLAUDE_MODELS.CODESTRAL_LATEST, display: 'Codestral' },
    { id: CLAUDE_MODELS.GEMMA_2_27B_IT, display: 'Gemma 2 27B' },
    { id: CLAUDE_MODELS.GROK_BETA, display: 'Grok Beta' }
  ];

  // Safely find the display name for the currently selected model
  const getSelectedModelName = () => {
    try {
      if (!selectedModel) return 'Select model';
      
      const model = models.find(m => m.id === selectedModel);
      return model ? model.display : 'Select model';
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