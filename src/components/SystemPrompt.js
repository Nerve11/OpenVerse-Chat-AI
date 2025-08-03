import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ErrorBoundary from './ErrorBoundary';

// Predefined templates
const PROMPT_TEMPLATES = [
  {
    name: "Эксперт по программированию",
    text: "Ты опытный программист и эксперт в области разработки программного обеспечения. Давай подробные технические объяснения, примеры кода и учебные материалы, когда это уместно."
  },
  {
    name: "Code Vibe Ассистент",
    text: "Ты — дружелюбный и опытный ИИ-ассистент по программированию по имени Code Vibe. Твоя задача — помогать пользователям писать, отлаживать и улучшать код. Предоставляй четкие и эффективные решения. Всегда оборачивай код в блоки markdown с указанием языка. Будь готов к обсуждению и совместной работе над кодом."
  },
  {
    name: "Креативный писатель",
    text: "Ты креативный писатель с богатым воображением. Помогай в создании увлекательных историй, персонажей и сюжетов. Предлагай оригинальные идеи и развивай существующие концепции."
  },
  {
    name: "Научный консультант",
    text: "Ты научный консультант с глубокими знаниями в области физики, химии, биологии и других естественных наук. Предоставляй точную научную информацию и объясняй сложные концепции простым языком."
  }
];

// Maximum character limit for system prompt
const MAX_CHAR_LIMIT = 4000;

// Component to preview the system prompt
const PromptPreview = ({ prompt }) => {
  // Защита от null/undefined
  const safePrompt = prompt !== null && prompt !== undefined ? prompt : '';
  
  if (!safePrompt.trim()) return null;
  
  return (
    <div className="system-prompt-preview">
      <div className="preview-title">Предпросмотр эффекта:</div>
      <div className="preview-content">
        Модель будет вести себя согласно инструкции: 
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

  return (
    <div className="system-prompt-container">
      <h3>System prompt</h3>
      <p className="system-prompt-description">
        Системный промпт определяет поведение и настройки AI модели. 
        Используйте его чтобы задать контекст, указать роль или стиль ответов.
      </p>
      
      <div className="prompt-templates">
        <h4>Шаблоны:</h4>
        <div className="template-buttons">
          {PROMPT_TEMPLATES.map((template, index) => (
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
        placeholder="Например: Ты опытный программист, специализирующийся на JavaScript и React..."
      />
      
      <div className="char-counter">
        <span className={charCount > MAX_CHAR_LIMIT * 0.9 ? "char-warning" : ""}>
          {charCount} / {MAX_CHAR_LIMIT}
        </span>
      </div>
      
      <PromptPreview prompt={promptText} />
      
      <div className="system-prompt-tips">
        <h4>Советы:</h4>
        <ul>
          <li>Будьте конкретны в своих инструкциях</li>
          <li>Укажите роль, которую должен выполнять AI</li>
          <li>Определите формат ответов, который хотите получить</li>
        </ul>
      </div>
      
      <div className="system-prompt-actions">
        <button className="system-prompt-cancel-btn" onClick={onCancel}>
          Отмена
        </button>
        <button 
          className="system-prompt-save-btn" 
          onClick={handleSave}
          disabled={promptText === safePrompt}
        >
          Сохранить
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
  
  return (
    <ErrorBoundary>
      <div className="group-system">
        <div 
          className={`system-prompt ${safeSystemPrompt ? 'active' : ''}`} 
          onClick={onToggleVisibility}
          title="Configure system prompt"
        >
          <div className="system-prompt-icon"></div>
          <div className="system-prompt-text">
            {safeSystemPrompt ? 'System prompt active' : 'Системный промпт'}
          </div>
        </div>
        
        {safeSystemPrompt && (
          <div 
            className="system-prompt-clear-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onClearPrompt();
            }} 
            title="Clear system prompt"
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