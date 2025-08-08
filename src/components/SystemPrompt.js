import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ErrorBoundary from './ErrorBoundary';
import { useTranslation } from 'react-i18next';

// Predefined templates
// Templates will be sourced from i18n

// Maximum character limit for system prompt
const MAX_CHAR_LIMIT = 4000;

// Component to preview the system prompt
const PromptPreview = ({ prompt }) => {
  // Защита от null/undefined
  const safePrompt = prompt !== null && prompt !== undefined ? prompt : '';
  const { t } = useTranslation();
  
  if (!safePrompt.trim()) return null;
  
  return (
    <div className="system-prompt-preview">
      <div className="preview-title">{t('systemPrompt.editor.previewTitle')}</div>
      <div className="preview-content">
        {t('systemPrompt.editor.previewLead')}
        <span className="preview-text">{safePrompt.length > 100 ? `${safePrompt.substring(0, 100)}...` : safePrompt}</span>
      </div>
    </div>
  );
};

// Editor component for system prompt
const SystemPromptEditor = ({ 
  systemPrompt, 
  onSave, 
  onCancel, 
  onApplyTemplate 
}) => {
  // Защитимся от null и undefined
  const safePrompt = systemPrompt !== null && systemPrompt !== undefined ? systemPrompt : '';
  const [promptText, setPromptText] = useState(safePrompt);
  const textareaRef = useRef(null);
  const [charCount, setCharCount] = useState(safePrompt.length);

  useEffect(() => {
    // Focus the textarea when editor is opened
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHAR_LIMIT) {
      setPromptText(text);
      setCharCount(text.length);
    }
  };

  const handleSave = () => {
    console.log("Saving system prompt:", promptText);
    onSave(promptText);
  };

  const handleTemplateClick = (template) => {
    setPromptText(template.text);
    setCharCount(template.text.length);
  };

  const { t } = useTranslation();
  return (
    <div className="system-prompt-container">
      <h3>{t('systemPrompt.editor.title')}</h3>
      <p className="system-prompt-description">
        {t('systemPrompt.editor.description')}
      </p>
      
      <div className="prompt-templates">
        <h4>{t('systemPrompt.editor.templatesTitle')}</h4>
        <div className="template-buttons">
          {t('systemPrompt.editor.templates', { returnObjects: true }).map((template, index) => (
            <button 
              key={index} 
              className="template-button"
              onClick={() => handleTemplateClick(template)}
              title={template.text}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        className="system-prompt-textarea"
        value={promptText}
        onChange={handleTextChange}
        placeholder={t('systemPrompt.editor.placeholder')}
      />
      
      <div className="char-counter">
        <span className={charCount > MAX_CHAR_LIMIT * 0.9 ? "char-warning" : ""}>
          {charCount} / {MAX_CHAR_LIMIT}
        </span>
      </div>
      
      <PromptPreview prompt={promptText} />
      
      <div className="system-prompt-tips">
        <h4>{t('systemPrompt.editor.tipsTitle')}</h4>
        <ul>
          {t('systemPrompt.editor.tips', { returnObjects: true }).map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
      
      <div className="system-prompt-actions">
        <button className="system-prompt-cancel-btn" onClick={onCancel}>
          {t('systemPrompt.editor.cancel')}
        </button>
        <button 
          className="system-prompt-save-btn" 
          onClick={handleSave}
          disabled={promptText === safePrompt}
        >
          {t('systemPrompt.editor.save')}
        </button>
      </div>
    </div>
  );
};

// Main SystemPrompt component
const SystemPrompt = ({ 
  systemPrompt, 
  onSystemPromptChange, 
  isVisible, 
  onToggleVisibility,
  onClearPrompt
}) => {
  const [mountEditor, setMountEditor] = useState(false);
  // Убедимся, что systemPrompt всегда строка
  const safeSystemPrompt = systemPrompt !== null && systemPrompt !== undefined ? systemPrompt : '';
  
  useEffect(() => {
    // Mount/unmount editor to handle animation
    if (isVisible) {
      setMountEditor(true);
    } else {
      const timer = setTimeout(() => {
        setMountEditor(false);
      }, 300); // Match CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  const handleSave = (newPrompt) => {
    // Убедимся, что передаем строку, даже если newPrompt null или undefined
    onSystemPromptChange(newPrompt !== null && newPrompt !== undefined ? newPrompt : '');
  };
  
  const handleCancel = () => {
    onToggleVisibility();
  };
  
  const { t } = useTranslation();
  return (
    <ErrorBoundary>
      <div className="group-system">
        <div 
          className={`system-prompt ${safeSystemPrompt ? 'active' : ''}`} 
          onClick={onToggleVisibility}
          title={t('controls.systemPromptTitle')}
        >
          <div className="system-prompt-icon"></div>
          <div className="system-prompt-text">
            {safeSystemPrompt ? t('controls.systemPromptActive') : t('controls.systemPrompt')}
          </div>
        </div>
        
        {safeSystemPrompt && (
          <div 
            className="system-prompt-clear-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onClearPrompt();
            }} 
            title={t('controls.systemPromptClear')}
          >
            <div className="system-prompt-clear-icon" />
          </div>
        )}
        
        {mountEditor && createPortal(
          <div 
            className={`system-prompt-overlay ${isVisible ? 'visible' : 'hidden'}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancel();
              }
            }}
          >
            <SystemPromptEditor
              systemPrompt={safeSystemPrompt}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>,
          document.body
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SystemPrompt; 