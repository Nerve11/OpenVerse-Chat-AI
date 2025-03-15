import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FiUser, FiLoader, FiCopy, FiCheck, FiRefreshCw } from 'react-icons/fi';
import CodeBlock from './CodeBlock';

const MessageContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  max-width: 100%;
  margin: ${props => props.isFirst ? '1rem 0 0 0' : '0'};
  
  &:hover {
    & > div:nth-child(2) {
      box-shadow: ${props => props.theme.shadowMedium};
      transform: translateY(-2px);
    }
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.sender === 'claude' 
    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
    : 'linear-gradient(135deg, #10b981, #059669)'
  };
  color: white;
  font-weight: 600;
  box-shadow: ${props => props.theme.shadowSmall};
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

const ClaudeAvatar = () => (
  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="white"/>
    <path d="M28.6462 13.2463C30.5295 11.9245 32.6025 11.63 33.6295 13.2463C34.6565 14.8627 33.6295 17.0298 31.7462 18.3517C29.8629 19.6735 27.79 19.968 26.7629 18.3517C25.736 16.7353 26.7629 14.5682 28.6462 13.2463Z" fill="#171618"/>
    <path d="M9.76384 18.3517C7.88054 19.6735 5.80761 19.968 4.78056 18.3517C3.75351 16.7353 4.78056 14.5682 6.66386 13.2463C8.54715 11.9245 10.6201 11.63 11.6471 13.2463C12.6742 14.8627 11.6471 17.0298 9.76384 18.3517Z" fill="#171618"/>
    <path d="M23.2198 26.2945C23.2198 28.1379 21.8099 29.5478 20.0001 29.5478C18.1902 29.5478 16.7803 28.1379 16.7803 26.2945C16.7803 24.4511 18.1902 23.0413 20.0001 23.0413C21.8099 23.0413 23.2198 24.4511 23.2198 26.2945Z" fill="#171618"/>
  </svg>
);

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  background: ${props => props.sender === 'claude'
    ? props.theme.messageBgClaude
    : props.theme.messageBgUser
  };
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  position: relative;
  box-shadow: ${props => props.theme.shadowSmall};
  transition: all 0.2s ease-in-out;
  
  background: ${props => props.sender === 'claude'
    ? `linear-gradient(120deg, ${props.theme.messageBgClaude}, ${props.theme.isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'})`
    : `linear-gradient(120deg, ${props.theme.messageBgUser}, ${props.theme.isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'})`
  };
  
  ${props => props.isLoading && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        rgba(99, 102, 241, 0) 0%, 
        rgba(99, 102, 241, 0.1) 50%, 
        rgba(99, 102, 241, 0) 100%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
      border-radius: var(--radius-lg);
    }
    
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `}
  
  ${props => props.isError && `
    border: 1px solid var(--color-error);
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  justify-content: space-between;
`;

const SenderName = styled.div`
  font-weight: 600;
  color: ${props => props.sender === 'claude' 
    ? 'var(--color-claude)' 
    : 'var(--color-user)'
  };
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.textSecondary};
`;

const MessageContent = styled.div`
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  
  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  
  p:last-child {
    margin-bottom: 0;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: underline;
    
    &:hover {
      color: var(--color-primary-hover);
    }
  }
  
  ul, ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 1.5rem 0 1rem;
    font-weight: 600;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  h2 {
    font-size: 1.25rem;
  }
  
  h3 {
    font-size: 1.125rem;
  }
  
  pre {
    margin: 1rem 0;
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  
  code {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    padding: 0.2em 0.4em;
    background: ${props => props.theme.cardBackground === 'var(--color-card-light)' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'};
    border-radius: 4px;
  }
  
  pre > code {
    padding: 0;
    background: transparent;
    border-radius: 0;
  }
  
  blockquote {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid var(--color-primary);
    background: ${props => props.theme.cardBackground === 'var(--color-card-light)' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'};
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }
  
  img {
    max-width: 100%;
    border-radius: var(--radius-md);
  }
  
  hr {
    margin: 1.5rem 0;
    border: none;
    border-top: 1px solid ${props => props.theme.border};
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.875rem;
  }
  
  th, td {
    padding: 0.75rem;
    border: 1px solid ${props => props.theme.border};
  }
  
  th {
    background: ${props => props.theme.cardBackground === 'var(--color-card-light)' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'};
    font-weight: 600;
    text-align: left;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: 500;
  
  svg {
    animation: spin 1.5s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Add a new styled component for streaming cursor
const StreamingCursor = styled.span`
  display: inline-block;
  width: 10px;
  height: 20px;
  background-color: var(--color-primary);
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  
  @keyframes blink {
    from, to {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const CopyMessageButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  color: ${props => props.theme.textSecondary};
  opacity: 0;
  transition: all var(--transition-fast);
  cursor: pointer;
  z-index: 5;
  
  &:hover {
    background: ${props => props.theme.isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)'
    };
    color: ${props => props.theme.text};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  ${ContentWrapper}:hover & {
    opacity: 0.7;
  }
`;

// Добавляем новый компонент для кнопки повтора
const RetryErrorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.2);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    animation: none;
    transition: all var(--transition-fast);
  }
  
  &:hover svg {
    animation: spin-once 0.5s ease;
  }
  
  @keyframes spin-once {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Message = React.memo(({ 
  id, 
  text, 
  sender, 
  timestamp, 
  isFirst = false, 
  isLoading = false,
  isError = false,
  isStreaming = false,
  retryFunction
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [copied, setCopied] = useState(false);
  
  // Update displayText whenever text changes
  useEffect(() => {
    if (text !== undefined && text !== null) {
      // Убираем избыточное логирование для повышения производительности
      // console.log(`Message ${id}: Updating text (length: ${text.length})`);
      setDisplayText(text);
    }
  }, [text, id]);
  
  // Format the timestamp for display - мемоизируем вычисление
  const formattedTime = useMemo(() => {
    return timestamp ? new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '';
  }, [timestamp]);
  
  // Функция для копирования всего текста сообщения
  const handleCopyMessage = useCallback(() => {
    if (!navigator.clipboard || !displayText) return;
    
    navigator.clipboard.writeText(displayText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Ошибка при копировании сообщения: ', err);
    });
  }, [displayText]);
  
  // Обработчик для кнопки повтора
  const handleRetry = useCallback(() => {
    if (typeof retryFunction === 'function') {
      retryFunction();
    }
  }, [retryFunction]);
  
  return (
    <MessageContainer
      isFirst={isFirst}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="article"
      aria-labelledby={`message-${id}-sender`}
    >
      <Avatar sender={sender} aria-hidden="true">
        {sender === 'claude' ? <ClaudeAvatar /> : <FiUser />}
      </Avatar>
      
      <ContentWrapper 
        sender={sender} 
        isLoading={isLoading}
        isError={isError}
      >
        {/* Добавляем кнопку копирования только для сообщений Claude */}
        {sender === 'claude' && !isLoading && !isStreaming && (
          <CopyMessageButton 
            onClick={handleCopyMessage} 
            aria-label={copied ? "Сообщение скопировано" : "Копировать сообщение"}
            title={copied ? "Сообщение скопировано" : "Копировать сообщение"}
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </CopyMessageButton>
        )}
        
        <MessageHeader>
          <SenderName 
            sender={sender}
            id={`message-${id}-sender`}
          >
            {sender === 'claude' ? 'Claude 3.7 Sonnet' : 'You'}
          </SenderName>
          <Timestamp aria-label={`Отправлено ${formattedTime}`}>{formattedTime}</Timestamp>
        </MessageHeader>
        
        {isLoading ? (
          <LoadingIndicator role="status" aria-live="polite">
            <FiLoader size={18} />
            Thinking...
          </LoadingIndicator>
        ) : (
          <MessageContent>
            {displayText ? (
              <ReactMarkdown
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const code = String(children).replace(/\n$/, '');
                    
                    if (!inline && match) {
                      return (
                        <CodeBlock 
                          code={code} 
                          language={match[1]} 
                        />
                      );
                    }
                    
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {displayText}
              </ReactMarkdown>
            ) : (
              <p>Unable to display message content.</p>
            )}
            {isStreaming && <StreamingCursor aria-hidden="true" />}
            
            {/* Добавляем кнопку повтора, если есть ошибка и функция повтора */}
            {isError && typeof retryFunction === 'function' && (
              <RetryErrorButton onClick={handleRetry}>
                <FiRefreshCw size={16} />
                Retry this message
              </RetryErrorButton>
            )}
          </MessageContent>
        )}
      </ContentWrapper>
    </MessageContainer>
  );
}, (prevProps, nextProps) => {
  // Оптимизация перерисовок - перерисовывать только если изменились существенные свойства
  return prevProps.id === nextProps.id && 
         prevProps.text === nextProps.text &&
         prevProps.isStreaming === nextProps.isStreaming &&
         prevProps.isLoading === nextProps.isLoading;
});

export default Message; 