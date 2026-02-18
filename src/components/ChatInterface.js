import React, { useRef, useEffect, useMemo, useState } from 'react';
import Message from './Message';
import { isPuterAvailable } from '../utils/puterApi';
import { useTranslation } from 'react-i18next';

const ChatInterface = ({ messages, streamingMessage, puterLoaded, onDiscussCode }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastScrollTop = useRef(0);
  const lastMessageCount = useRef(messages.length);
  const { t } = useTranslation();

  const messageElements = useMemo(
    () => messages.map((m) => <Message key={`msg-${m.id}`} message={m} onDiscussCode={onDiscussCode} />),
    [messages, onDiscussCode],
  );

  const streamingElement = useMemo(
    () =>
      streamingMessage ? (
        <Message
          key={`streaming-${streamingMessage.id || 'current'}`}
          message={streamingMessage}
          streaming
          onDiscussCode={onDiscussCode}
        />
      ) : null,
    [streamingMessage, onDiscussCode],
  );

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

  const isNearBottom = () => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - (scrollTop + clientHeight) < 150;
  };

  useEffect(() => {
    if (isUserScrolling && messages.length > lastMessageCount.current) {
      setUnreadCount((p) => p + (messages.length - lastMessageCount.current));
    }
    lastMessageCount.current = messages.length;
  }, [messages.length, isUserScrolling]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - (scrollTop + clientHeight) < 10;
    if (scrollTop < lastScrollTop.current || !atBottom) {
      setIsUserScrolling(true);
    } else if (atBottom) {
      setIsUserScrolling(false);
      setUnreadCount(0);
    }
    lastScrollTop.current = scrollTop;
  };

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    setIsUserScrolling(false);
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!isUserScrolling && isNearBottom()) {
      requestAnimationFrame(() => scrollToBottom('smooth'));
    }
  }, [messages, isUserScrolling]);

  useEffect(() => {
    if (!streamingMessage || isUserScrolling) return;
    const id = setInterval(() => {
      if (isNearBottom() && !isUserScrolling) scrollToBottom('auto');
    }, 100);
    return () => clearInterval(id);
  }, [streamingMessage, isUserScrolling]);

  useEffect(() => { scrollToBottom('auto'); }, []);

  return (
    <div className="chat-viewport" ref={containerRef} onScroll={handleScroll}>
      {/* Welcome */}
      {messages.length === 0 && !streamingMessage && !apiErrorElement && (
        <div className="chat-welcome">
          <div className="chat-welcome__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 className="chat-welcome__title">{t('app.welcome')}</h2>
          <p className="chat-welcome__subtitle">Start a conversation below.</p>
        </div>
      )}

      {apiErrorElement}
      {messageElements}
      {streamingElement}
      <div ref={messagesEndRef} style={{ height: '1px' }} />

      {/* Scroll-to-bottom pill */}
      {isUserScrolling && (
        <button
          className="scroll-pill"
          onClick={() => scrollToBottom('smooth')}
          aria-label="Scroll to bottom"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {unreadCount > 0 && <span className="scroll-pill__badge">{unreadCount}</span>}
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
