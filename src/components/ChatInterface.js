import React, { useRef, useEffect, useMemo, useState } from 'react';
import Message from './Message';
import { isPuterAvailable } from '../utils/puterApi';
import { useTranslation } from 'react-i18next';

/* eslint-disable no-undef */
// Указываем ESLint, что puter - это глобальная переменная, определенная извне
/* eslint-enable no-undef */

const ChatInterface = ({ messages, streamingMessage, puterLoaded, onDiscussCode }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollTop = useRef(0);
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

  // Check if user is near bottom of container
  const isNearBottom = () => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    return distanceFromBottom < 150; // Порог в пикселях
  };

  // Handle scroll events to detect user scrolling
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 10;
    
    // Если пользователь прокручивает вверх или не внизу
    if (scrollTop < lastScrollTop.current || !isAtBottom) {
      setIsUserScrolling(true);
    } else if (isAtBottom) {
      // Если пользователь прокрутил в самый низ
      setIsUserScrolling(false);
    }
    
    lastScrollTop.current = scrollTop;
  };

  // Smooth scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: behavior,
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (!isUserScrolling && isNearBottom()) {
      // Небольшая задержка для того, чтобы DOM успел обновиться
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
  }, [messages, isUserScrolling]);

  // Always auto-scroll during streaming if user is not manually scrolling
  useEffect(() => {
    if (streamingMessage && !isUserScrolling) {
      // При стриминге прокручиваем более агрессивно
      const scrollInterval = setInterval(() => {
        if (isNearBottom() && !isUserScrolling) {
          scrollToBottom('auto'); // Используем 'auto' для более плавного опыта во время стриминга
        }
      }, 100);
      
      return () => clearInterval(scrollInterval);
    }
  }, [streamingMessage, isUserScrolling]);

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  return (
    <div 
      className="messages-container" 
      ref={containerRef}
      onScroll={handleScroll}
    >
      {messages.length === 0 && !streamingMessage && !apiErrorElement && (
        <div className="welcome-message">
          <h2>{t('app.welcome')}</h2>
        </div>
      )}
      {apiErrorElement}
      {messageElements}
      {streamingElement}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </div>
  );
};

export default ChatInterface;