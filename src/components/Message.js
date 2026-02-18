import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import { useTranslation } from 'react-i18next';

// ── Avatar ──────────────────────────────────────────────────────────────────

const UserAvatar = () => (
  <div className="msg-avatar msg-avatar--user">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </div>
);

const AssistantAvatar = () => (
  <div className="msg-avatar msg-avatar--assistant">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </div>
);

// ── Copy icons ───────────────────────────────────────────────────────────────

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Message component ────────────────────────────────────────────────────────

const Message = ({ message, streaming, onDiscussCode }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const isUser = message.role === 'user';

  const formattedTime = React.useMemo(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  return (
    <div className={`msg ${isUser ? 'msg--user' : 'msg--assistant'}`}>
      {/* Header row */}
      <div className="msg__header">
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
        <span className="msg__sender">
          {isUser ? t('chat.you') : t('chat.assistant')}
        </span>
        <span className="msg__time">{formattedTime}</span>
      </div>

      {/* Bubble */}
      <div className={`msg__bubble ${isUser ? 'msg__bubble--user' : 'msg__bubble--assistant'}`}>
        {/* Copy button */}
        <button
          className={`msg__copy ${copied ? 'msg__copy--done' : ''}`}
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Content */}
        <div className="msg__content">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');
                if (!inline && match) {
                  return (
                    <CodeBlock
                      code={code}
                      language={match[1]}
                      onDiscussCode={onDiscussCode}
                    />
                  );
                }
                return <code className={className} {...props}>{children}</code>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

          {streaming && !isUser && (
            <span className="msg__cursor" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
