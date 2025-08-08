import React, { useRef, useEffect, useMemo } from 'react';
import Message from './Message';
import { isPuterAvailable } from '../utils/puterApi';
import { useTranslation } from 'react-i18next';

/* eslint-disable no-undef */
// Указываем ESLint, что puter - это глобальная переменная, определенная извне
/* eslint-enable no-undef */

const ChatInterface = ({ messages, streamingMessage, puterLoaded, onDiscussCode }) => {
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();

  // Memoize the message components to prevent unnecessary re-rendering
  const messageElements = useMemo(() => {
    return messages.map(message => (
      <Message key={`message-${message.id}`} message={message} onDiscussCode={onDiscussCode} />
    ));
  }, [messages, onDiscussCode]);

  // Memoize the streaming message component
  const streamingElement = useMemo(() => {
    return streamingMessage ? (
      <Message 
        key={`streaming-${streamingMessage.id || 'current'}`} 
        message={streamingMessage} 
        streaming={true} 
        onDiscussCode={onDiscussCode}
      />
    ) : null;
  }, [streamingMessage, onDiscussCode]);

  // Show Puter.js API error message if not loaded and no messages
  const apiErrorElement = useMemo(() => {
    if (!puterLoaded && messages.length === 0 && !isPuterAvailable()) {
      return (
        <div className="api-error-message">
          <p>{t('chat.apiError1')}</p>
          <p>{t('chat.apiError2', { url: 'https://js.puter.com/v2/' })}</p>
        </div>
      );
    }
    return null;
  }, [puterLoaded, messages.length, t]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);

  return (
    <div className="messages-container">
      {messages.length === 0 && !streamingMessage && !apiErrorElement && (
        <div className="welcome-message">
          <h2>{t('app.welcome')}</h2>
        </div>
      )}
      {apiErrorElement}
      {messageElements}
      {streamingElement}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatInterface; 