import React from 'react';
import { useTranslation } from 'react-i18next';

// ── helpers ──────────────────────────────────────────────────────────────────

const formatModelName = (model) => {
  if (!model) return 'Unknown Model';
  if (typeof model === 'object' && model.name) return model.name;
  if (typeof model === 'string') {
    const name = model.replace('anthropic.', '').replace(/-/g, ' ');
    return name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return 'Unknown Model';
};

const getModelDescription = (model) => {
  if (!model) return 'AI Model';
  if (typeof model === 'object' && model.description) return model.description;
  const s = typeof model === 'object' ? (model.id || model.name || '') : String(model);
  const l = s.toLowerCase();
  if (l.includes('3-5-sonnet') || l.includes('3.5-sonnet')) return 'Balanced · best for most tasks';
  if (l.includes('3-7-sonnet') || l.includes('3.7-sonnet')) return 'Advanced · latest model';
  if (l.includes('opus')) return 'Powerful · complex reasoning';
  if (l.includes('haiku')) return 'Fast · quick responses';
  if (l.includes('gpt-4')) return 'OpenAI GPT-4';
  if (l.includes('gpt-5')) return 'OpenAI GPT-5';
  if (l.includes('o1')) return 'OpenAI reasoning model';
  if (l.includes('gemini')) return 'Google Gemini';
  if (l.includes('llama')) return 'Meta Llama';
  if (l.includes('deepseek')) return 'DeepSeek AI';
  if (l.includes('grok')) return 'xAI Grok';
  if (typeof model === 'object' && model.provider) return `${model.provider} Model`;
  return 'AI Model';
};

const getModelId = (model) => {
  if (!model) return null;
  if (typeof model === 'object') return model.id || model.model_id || model.name;
  return model;
};

// ── icon shortcuts ───────────────────────────────────────────────────────────

const ModelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const PromptIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// ── component ────────────────────────────────────────────────────────────────

const Sidebar = ({
  selectedModel,
  onSelectModel,
  availableModels,
  onClearChat,
  systemPrompt,
  onToggleSystemPromptVisibility,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">OV</div>
          <div className="sidebar__logo-text">
            <div className="sidebar__logo-title">OpenVerse</div>
            <div className="sidebar__logo-subtitle">Chat AI</div>
          </div>
        </div>
      </div>

      {/* Models */}
      <div className="sidebar__body">
        <p className="sidebar__section-label">{t('sidebar.models')}</p>
        <div className="sidebar__model-list">
          {availableModels && availableModels.length > 0 ? (
            availableModels.map((model, idx) => {
              const id = getModelId(model);
              const selected = selectedModel === id;
              return (
                <button
                  key={id || `model-${idx}`}
                  className={`sidebar__model-item ${selected ? 'sidebar__model-item--active' : ''}`}
                  onClick={() => onSelectModel(id)}
                >
                  <span className="sidebar__model-icon"><ModelIcon /></span>
                  <span className="sidebar__model-info">
                    <span className="sidebar__model-name">{formatModelName(model)}</span>
                    <span className="sidebar__model-desc">{getModelDescription(model)}</span>
                  </span>
                  {selected && <span className="sidebar__model-dot" />}
                </button>
              );
            })
          ) : (
            <button className="sidebar__model-item" disabled>
              <span className="sidebar__model-icon"><ModelIcon /></span>
              <span className="sidebar__model-info">
                <span className="sidebar__model-name">Loading…</span>
                <span className="sidebar__model-desc">Please wait</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="sidebar__footer">
        <button
          className="sidebar__action-btn"
          onClick={onToggleSystemPromptVisibility}
        >
          <PromptIcon />
          <span>{systemPrompt ? t('controls.editPrompt') : t('controls.systemPrompt')}</span>
        </button>
        <button
          className="sidebar__action-btn sidebar__action-btn--danger"
          onClick={onClearChat}
        >
          <TrashIcon />
          <span>{t('controls.clearChat')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
