import React, { useState } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import { useTranslation } from 'react-i18next';

const MessageContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 20px;
  
  &:hover .copy-button {
    opacity: 1;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 8px;
`;

const MessageSender = styled.span`
  color: #7657fe;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 15px;
  font-weight: 600;
  margin-right: 10px;
`;

const MessageTime = styled.span`
  color: #9a9a9a;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 14px;
  margin-right: 10px;
`;

const UserAvatar = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: url(https://static.codia.ai/image/2025-03-25/52c080cb-8d7b-4155-9115-a69aa7a4e4c3.svg)
    no-repeat center;
  background-size: cover;
`;

const AssistantAvatar = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: url(https://static.codia.ai/image/2025-03-25/bccc87ce-f5b5-4ca4-88ad-33e33ba78fb3.svg)
    no-repeat center;
  background-size: cover;
`;

const MessageBox = styled.div`
  position: relative;
  width: 100%;
  padding: 15px;
  background: ${props => props.isUser ? '#252527' : '#1e1e20'};
  border: 1px solid #333335;
  border-radius: 12px;
  color: #f5f1ff;
  font-family: 'SF Pro Display', sans-serif;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: ${props => props.isUser ? '#7657fe' : '#333335'};
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => props.$copied ? '#10b981' : '#2d2d30'};
  border: 1px solid ${props => props.$copied ? '#10b981' : '#3e3e42'};
  color: ${props => props.$copied ? '#ffffff' : '#f5f1ff'};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 10;
  
  &:hover {
    background: ${props => props.$copied ? '#059669' : '#3e3e42'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const MessageContent = styled.div`
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.6;
  
  p {
    margin-bottom: 1rem;
  }
  
  p:last-child {
    margin-bottom: 0;
  }
  
  a {
    color: #7657fe;
    text-decoration: underline;
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
  
  pre {
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;
    background: #252527;
  }
  
  code {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    padding: 0.2em 0.4em;
    background: #252527;
    border-radius: 4px;
  }
  
  blockquote {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid #7657fe;
    background: #252527;
    border-radius: 0 8px 8px 0;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
  }
  
  th, td {
    border: 1px solid #333335;
    padding: 0.5rem;
    text-align: left;
  }
  
  th {
    background: #252527;
  }
`;

const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background: #7657fe;
  animation: pulse 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

// Wrapper to ensure text content is always in a span
const TextWrapper = ({ children }) => <span>{children}</span>;

// Copy icon SVG
const CopyIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

// Check icon SVG
const CheckIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Message = ({ message, streaming, onDiscussCode }) => {
  const [formattedTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const [copied, setCopied] = useState(false);
  
  const isUser = message.role === 'user';
  const { t } = useTranslation();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };
  
  return (
    <MessageContainer>
      <MessageHeader>
        <MessageSender>{isUser ? <span>{t('chat.you')}</span> : <span>{t('chat.assistant')}</span>}</MessageSender>
        <MessageTime><span>{formattedTime}</span></MessageTime>
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </MessageHeader>
      
      <MessageBox $isUser={isUser}>
        <CopyButton 
          className="copy-button"
          onClick={handleCopy}
          $copied={copied}
          title={copied ? 'Скопировано!' : 'Копировать'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Скопировано' : 'Копировать'}</span>
        </CopyButton>
        
        <MessageContent>
          <ReactMarkdown components={{
            p: ({ node, children, ...props }) => <p {...props}><span>{children}</span></p>,
            li: ({ node, children, ...props }) => <li {...props}><span>{children}</span></li>,
            h1: ({ node, children, ...props }) => <h1 {...props}><span>{children}</span></h1>,
            h2: ({ node, children, ...props }) => <h2 {...props}><span>{children}</span></h2>,
            h3: ({ node, children, ...props }) => <h3 {...props}><span>{children}</span></h3>,
            h4: ({ node, children, ...props }) => <h4 {...props}><span>{children}</span></h4>,
            h5: ({ node, children, ...props }) => <h5 {...props}><span>{children}</span></h5>,
            h6: ({ node, children, ...props }) => <h6 {...props}><span>{children}</span></h6>,
            a: ({ node, children, ...props }) => <a {...props}><span>{children}</span></a>,
            blockquote: ({ node, children, ...props }) => <blockquote {...props}><span>{children}</span></blockquote>,
            text: ({ children }) => <TextWrapper>{children}</TextWrapper>,
            code: ({ node, inline, className, children, ...props }) => {
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
              
              return (
                <code className={className} {...props}>
                  <span>{children}</span>
                </code>
              );
            }
          }}>
            {message.content}
          </ReactMarkdown>
          
          {streaming && message.role === 'assistant' && (
            <LoadingDots>
              <Dot $delay={0} />
              <Dot $delay={0.15} />
              <Dot $delay={0.3} />
            </LoadingDots>
          )}
        </MessageContent>
      </MessageBox>
    </MessageContainer>
  );
};

export default Message;