import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Message from './Message';
import { FiSend, FiTrash2, FiLoader } from 'react-icons/fi';

/* eslint-disable no-undef */
// Указываем ESLint, что puter - это глобальная переменная, определенная извне
/* eslint-enable no-undef */

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 1rem;
  position: relative;
  
  /* Добавляем небольшой отступ для лучшей центровки на больших экранах */
  @media (min-width: 1400px) {
    max-width: 80%;
  }
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 300px;
  max-height: calc(100vh - 250px);
  
  /* Добавляем более плавный скроллинг */
  scroll-behavior: smooth;
  
  /* Улучшаем стиль скроллбара */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(99, 102, 241, 0.5);
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  position: relative;
  background: ${props => props.theme.cardBackground};
  border-radius: var(--radius-lg);
  box-shadow: ${props => props.theme.shadowMedium};
  transition: all var(--transition-fast);
  border: 1px solid ${props => props.theme.border};
  overflow: hidden;
  
  &:focus-within {
    box-shadow: 0 0 0 2px var(--color-primary), 0 10px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TextareaWrapper = styled.div`
  position: relative;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 1rem 4rem 1rem 1rem;
  border: none;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  background: transparent;
  
  /* Явно устанавливаем цвет текста, чтобы гарантировать его видимость */
  color: ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
  
  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
    opacity: 0.7;
    font-style: italic;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.03)'};
  border-top: 1px solid ${props => props.theme.border};
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  color: ${props => props.theme.textSecondary};
  transition: all var(--transition-fast);
  
  &:hover {
    background: ${props => props.danger 
      ? 'rgba(239, 68, 68, 0.1)' 
      : 'rgba(99, 102, 241, 0.1)'
    };
    color: ${props => props.danger 
      ? 'var(--color-error)' 
      : 'var(--color-primary)'
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SendButton = styled(IconButton)`
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  color: var(--color-primary);
  background: ${props => props.theme.isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};

  &:hover {
    background: rgba(99, 102, 241, 0.2);
    transform: scale(1.1);
  }
`;

const StatusIndicator = styled.div`
  margin-left: auto;
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Выносим компоненты приветствия за пределы основного компонента для оптимизации LCP
// и убираем стилизацию через styled-components для критического LCP элемента
const WelcomeMessage = styled.div`
  text-align: center;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    padding: 3rem 1rem;
  }
  
  /* Используем более легкие стили без эффектов для ускорения LCP */
  position: relative;
  
  /* Предварительно отрендеренный основной текст для LCP */
  .welcome-text {
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1.1rem;
    contain: content;
    max-width: 100%;
  }
`;

const WelcomeTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 2.5rem;
  background: linear-gradient(120deg, #6366f1, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  
  /* Упрощаем градиент и анимацию для ускорения LCP */
  will-change: background-position;
  
  @media (prefers-reduced-motion: no-preference) {
    animation: gradient 8s ease infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

// Убираем использование styled-components для LCP-элемента
// WelcomeText теперь использует регулярный CSS класс для элемента p

const RetryButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  
  &:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
  }
`;

// Выносим функцию за пределы компонента для предотвращения пересоздания при рендере
const sendToClaude = async (message, setStreamingMessage, onPuterStatusChange) => {
  // Verify that puter is defined
  if (typeof puter === 'undefined') {
    console.error("Puter is undefined - library not loaded");
    onPuterStatusChange && onPuterStatusChange('error');
    throw new Error('Puter.js library is not loaded. Please reload the page and try again.');
  }

  try {
    // Set up streaming variables
    let fullResponse = '';
    
    console.log("Starting request to Claude...");
    
    // Попробуем оба возможных способа взаимодействия с Claude
    // 1. Предпочтительный вариант (согласно документации)
    try {
      if (puter.ai.chat) {
        console.log("Using puter.ai.chat with model claude-3-7-sonnet");
        
        if (setStreamingMessage) {
          // Streaming mode
          try {
            const streamResponse = await puter.ai.chat(message, {
              model: 'claude-3-7-sonnet', 
              stream: true
            });
            
            console.log("Stream response received:", typeof streamResponse);
            
            // Process the stream (поддержка разных форматов ответа)
            if (streamResponse && typeof streamResponse[Symbol.asyncIterator] === 'function') {
              for await (const part of streamResponse) {
                if (part?.text) {
                  fullResponse += part.text;
                  setStreamingMessage(fullResponse);
                }
              }
            } 
            // Обработка случая, когда стриминг технически включен, но ответ приходит целиком
            else if (typeof streamResponse === 'string') {
              fullResponse = streamResponse;
              setStreamingMessage(fullResponse);
            } else {
              console.warn("Unexpected stream response format:", streamResponse);
              throw new Error('Unexpected response format from Claude API');
            }
          } catch (streamError) {
            console.error("Error in streaming mode:", streamError);
            throw new Error(`Streaming error: ${streamError.message || 'Unknown streaming error'}`);
          }
        } else {
          // Non-streaming mode
          fullResponse = await puter.ai.chat(message, {
            model: 'claude-3-7-sonnet',
            stream: false
          });
        }
      }
      // 2. Альтернативный вариант - другой метод для Claude
      else if (puter.ai.claudeCompletion) {
        console.log("Using puter.ai.claudeCompletion");
        
        const response = await puter.ai.claudeCompletion({
          model: 'claude-3-sonnet-20240229',
          prompt: message,
          maxTokens: 4000,
          stream: setStreamingMessage ? true : false,
          onStreamData: setStreamingMessage ? (data) => {
            fullResponse += data.completion || '';
            setStreamingMessage(fullResponse);
          } : undefined
        });
        
        // Если это не стрим, то ответ должен быть в response
        if (!setStreamingMessage && response) {
          fullResponse = response;
        }
      }
      // 3. Последний вариант - общий метод завершения текста
      else if (puter.ai.completion) {
        console.log("Using puter.ai.completion as fallback");
        fullResponse = await puter.ai.completion(message);
      }
      else {
        throw new Error("No suitable Claude API method found in puter.ai");
      }
    } catch (apiError) {
      console.error("API error using primary method:", apiError);
      throw apiError; // Пробросим ошибку дальше
    }
    
    console.log('Claude response complete. Text length:', fullResponse.length);
    
    // If response is empty, add a fallback message
    if (!fullResponse || fullResponse.trim() === '') {
      console.warn("Empty response received from Claude!");
      fullResponse = "I received an empty response. Please try again or refresh the page.";
    }
    
    // Return the full response for use in message history
    return fullResponse;
    
  } catch (error) {
    console.error('Error in Claude API call:', error);
    console.error('Error details:', error.message);
    
    // Обрабатываем разные типы ошибок с более информативными сообщениями
    let errorMessage = 'Sorry, I encountered an error while processing your request.';
    
    // Проверяем тип ошибки для более точного сообщения
    if (error.message.includes('network') || 
        error.message.includes('connection') || 
        error.message.includes('offline')) {
      errorMessage = 'Network connection issue detected. Please check your internet connection and try again.';
      onPuterStatusChange && onPuterStatusChange('error');
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      errorMessage = 'The request to Claude API timed out. Please try again with a shorter message.';
    } else if (error.message.includes('streaming')) {
      errorMessage = 'Error during streaming response. Please try again with streaming disabled.';
    } else if (error.message.includes('Unexpected response format')) {
      errorMessage = 'Claude API returned an unexpected response format. Please try again.';
    }
    
    // Добавляем техническую информацию для отладки, если это не связано с Puter.js
    if (!error.message.includes('Puter.js')) {
      error.message = `${errorMessage} Technical details: ${error.message}`;
    }
    
    throw error;
  }
};

const ChatInterface = ({ onPuterStatusChange }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPuterLoaded, setIsPuterLoaded] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Мемоизация функции для предотвращения пересоздания при каждом рендере
  const scrollToBottom = useCallback(() => {
    // Используем requestAnimationFrame для оптимизации скроллинга
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  // Check if puter is loaded
  useEffect(() => {
    const checkPuter = () => {
      if (typeof puter === 'undefined') {
        console.error("Puter.js library is not loaded");
        setIsPuterLoaded(false);
        onPuterStatusChange && onPuterStatusChange('error');
        setMessages([{
          id: Date.now(),
          text: "Puter.js library failed to load. Please check your internet connection and reload the page.",
          sender: 'claude',
          isError: true,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        onPuterStatusChange && onPuterStatusChange('loaded');
      }
    };
    
    checkPuter();
    
    // Устанавливаем таймер для отложенной проверки, поскольку скрипт может загружаться с задержкой
    const timer = setTimeout(checkPuter, 2000);
    return () => clearTimeout(timer);
  }, [onPuterStatusChange]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setStreamingMessage('');
    setIsStreaming(false);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    // Check if puter is loaded before proceeding
    if (!isPuterLoaded) {
      setMessages((prev) => [
        ...prev, 
        {
          id: Date.now(),
          text: "Cannot send message: Puter.js library is not loaded. Please reload the page and try again.",
          sender: 'claude',
          isError: true,
          timestamp: new Date().toISOString(),
        }
      ]);
      return;
    }
    
    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Сохраняем текст сообщения для возможного повтора
    const userInput = input.trim();
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input and set loading state
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    
    // Generate a unique ID for this message
    const responseId = Date.now() + 1;
    
    try {
      // Add a placeholder streaming message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: 'streaming',
          text: '',
          sender: 'claude',
          isStreaming: true,
          timestamp: new Date().toISOString(),
        }
      ]);
      
      // Get response from Claude with streaming
      // Our updated sendToClaude function handles streaming internally
      const finalResponse = await sendToClaude(userInput, setStreamingMessage, onPuterStatusChange);
      
      // After streaming is complete, replace the streaming message with the final message
      setMessages(prevMessages => {
        // Filter out the streaming message
        const messages = prevMessages.filter(m => m.id !== 'streaming');
        
        // Add the final message with the complete response
        return [...messages, {
          id: responseId,
          text: finalResponse,
          sender: 'claude',
          timestamp: new Date().toISOString(),
        }];
      });
      
      // Clear streaming state
      setStreamingMessage('');
      setIsStreaming(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Создаем функцию повтора для этого конкретного сообщения
      const retryFunction = () => {
        // Восстанавливаем текст сообщения и отправляем заново
        setInput(userInput);
        setTimeout(() => {
          if (textareaRef.current) {
            // Фокусируемся на поле ввода и обновляем его высоту
            textareaRef.current.focus();
            textareaRef.current.style.height = '60px';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
          }
        }, 100);
      };
      
      // Add error message
      setMessages(prevMessages => {
        // Filter out the streaming message
        const messages = prevMessages.filter(m => m.id !== 'streaming');
        
        // Add the error message
        return [...messages, {
          id: responseId,
          text: error.message.includes("Puter.js") 
            ? error.message 
            : error.message || "Sorry, I encountered an error while processing your request. Please try again.",
          sender: 'claude',
          isError: true,
          timestamp: new Date().toISOString(),
          retryFunction // Прикрепляем функцию повтора к сообщению
        }];
      });
    } finally {
      // Make sure loading state is cleared
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [input, isLoading, isPuterLoaded, onPuterStatusChange]);

  // Обновляем зависимости для handleKeyDown после объявления handleSendMessage
  useEffect(() => {
    // Это решает проблему циклической зависимости
    const handler = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };
    
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handler);
      return () => textarea.removeEventListener('keydown', handler);
    }
  }, [handleSendMessage]);

  const retryPuterConnection = useCallback(() => {
    // Set status to loading
    onPuterStatusChange && onPuterStatusChange('loading');
    
    // Try to reload the Puter.js script
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.crossOrigin = 'anonymous'; // Добавляем для безопасности
    script.onload = () => {
      console.log('Puter.js script reloaded successfully');
      // Проверяем доступность методов API
      if (window.puter && window.puter.ai) {
        console.log('Available puter.ai methods:', Object.keys(window.puter.ai));
      }
      setIsPuterLoaded(true);
      onPuterStatusChange && onPuterStatusChange('loaded');
      setMessages([]);
    };
    script.onerror = (error) => {
      console.error('Failed to reload Puter.js script:', error);
      setIsPuterLoaded(false);
      onPuterStatusChange && onPuterStatusChange('error');
    };
    document.head.appendChild(script);
  }, [onPuterStatusChange]);

  // Мемоизация содержимого Welcome сообщения для предотвращения перерисовок
  const welcomeContent = useMemo(() => (
    <WelcomeMessage data-lcp="container">
      <WelcomeTitle className="gradient-text">Welcome to Claude 3.7</WelcomeTitle>
      <p className="welcome-text" data-lcp="true">
        {isPuterLoaded ? (
          <>
            Chat with Claude 3.7 Sonnet, Anthropic's most advanced AI assistant. 
            This interface connects directly to the Claude API through Puter.js.
            Ask a question to get started!
          </>
        ) : (
          <>
            Puter.js library failed to load. This is required to connect to Claude 3.7 Sonnet.
            Please check your internet connection and try again.
            <RetryButton onClick={retryPuterConnection}>
              Retry Connection
            </RetryButton>
          </>
        )}
      </p>
    </WelcomeMessage>
  ), [isPuterLoaded, retryPuterConnection]);

  // Оптимизированный рендеринг списка сообщений
  const renderedMessages = useMemo(() => 
    messages.map((message, index) => (
      <Message 
        key={message.id}
        id={message.id}
        text={message.text}
        sender={message.sender}
        timestamp={message.timestamp}
        isError={message.isError}
        isStreaming={message.isStreaming}
        isFirst={index === 0 || messages[index - 1].sender !== message.sender}
      />
    )), [messages]);

  return (
    <ChatContainer>
      <MessagesContainer role="log" aria-live="polite" aria-label="Диалог с Claude 3.7 Sonnet">
        {messages.length === 0 && !isStreaming ? (
          welcomeContent
        ) : (
          <>
            {renderedMessages}
          </>
        )}
        
        {/* Show streaming response in real-time */}
        {isStreaming && streamingMessage && (
          <Message
            key="streaming-message"
            id="streaming"
            text={streamingMessage}
            sender="claude"
            isStreaming={true}
            timestamp={new Date().toISOString()}
            isFirst={messages.length === 0 || messages[messages.length - 1].sender !== 'claude'}
          />
        )}
        
        {/* Show loading indicator when waiting for the first chunk */}
        {isLoading && !streamingMessage && (
          <Message
            id="loading"
            text="Claude is thinking..."
            sender="claude"
            isLoading={true}
            timestamp={new Date().toISOString()}
            isFirst={messages.length === 0 || messages[messages.length - 1].sender !== 'claude'}
          />
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer role="form" aria-label="Отправить сообщение">
        <TextareaWrapper>
          <StyledTextarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Message Claude 3.7 Sonnet..."
            disabled={isLoading}
            aria-label="Текст сообщения"
          />
          <SendButton 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <FiSend />
          </SendButton>
        </TextareaWrapper>
        
        <ActionButtons>
          <IconButton 
            onClick={handleClearChat} 
            disabled={(messages.length === 0 && !isStreaming) || isLoading}
            danger
            aria-label="Clear chat"
          >
            <FiTrash2 />
          </IconButton>
          
          {isLoading && (
            <StatusIndicator role="status" aria-live="polite">
              <FiLoader style={{ animation: 'spin 1s linear infinite' }} />
              {streamingMessage ? 'Receiving response...' : 'Connecting to Claude...'}
            </StatusIndicator>
          )}
        </ActionButtons>
      </InputContainer>
    </ChatContainer>
  );
};

export default React.memo(ChatInterface);

// Add default props at the bottom of the file
ChatInterface.defaultProps = {
  onPuterStatusChange: () => {}
}; 