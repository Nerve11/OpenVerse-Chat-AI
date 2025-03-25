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

const ModelSelector = ({ selectedModel, onSelectModel, isOpen, toggleDropdown }) => {
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const selectorRef = useRef(null);
  const portalNodeRef = useRef(null);
  
  // Create an array of model objects with display names and values
  const models = [
    { id: CLAUDE_MODELS.CLAUDE_3_7_SONNET, display: 'Claude 3.7 Sonnet' },
    { id: CLAUDE_MODELS.CLAUDE_3_5_SONNET, display: 'Claude 3.5 Sonnet' },
    { id: CLAUDE_MODELS.GPT_4O, display: 'GPT-4o' },
    { id: CLAUDE_MODELS.O3_MINI, display: 'o3-mini' },
    { id: CLAUDE_MODELS.O1_MINI, display: 'o1-mini' },
    { id: CLAUDE_MODELS.META_LLAMA_3_1_405B, display: 'Meta Llama 3.1 405B' },
    { id: CLAUDE_MODELS.GEMINI_2_0_FLASH, display: 'Gemini 2.0 Flash' },
    { id: CLAUDE_MODELS.DEEPSEEK_REASONER, display: 'DeepSeek Reasoner' }
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

  // Initialize portal node
  useEffect(() => {
    // Create portal container if it doesn't exist
    if (isOpen && !portalNodeRef.current) {
      try {
        portalNodeRef.current = document.createElement('div');
        portalNodeRef.current.className = 'model-dropdown-portal';
        document.body.appendChild(portalNodeRef.current);
      } catch (error) {
        console.error('Error creating portal node:', error);
      }
    }
    
    // Clean up function to remove portal element
    return () => {
      try {
        if (portalNodeRef.current && document.body.contains(portalNodeRef.current)) {
          document.body.removeChild(portalNodeRef.current);
          portalNodeRef.current = null;
        }
      } catch (error) {
        console.error('Error removing portal node:', error);
        // Force reset the ref to avoid future errors
        portalNodeRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle model selection with error checking
  const handleModelSelect = (e, modelId) => {
    try {
      e.stopPropagation();
      if (typeof onSelectModel === 'function' && modelId) {
        onSelectModel(modelId);
      }
    } catch (error) {
      console.error('Error selecting model:', error);
    }
  };

  // Create the dropdown portal
  const renderDropdown = () => {
    if (!isOpen || !portalNodeRef.current) return null;
    
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
        portalNodeRef.current
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