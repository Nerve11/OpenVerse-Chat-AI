import React, { useState, useRef, useEffect } from 'react';
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

const WelcomeMessage = styled(motion.div)`
  text-align: center;
  padding: 3rem 1rem;
  max-width: 600px;
  margin: 0 auto;
  
  /* Небольшая декоративная подсветка */
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    left: calc(50% - 150px);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%);
    z-index: -1;
    border-radius: 50%;
  }
`;

const WelcomeTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 2.5rem;
  background: linear-gradient(120deg, #6366f1, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: gradient 8s ease infinite;
  
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

const WelcomeText = styled.p`
  color: ${props => props.theme.textSecondary};
  line-height: 1.8;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

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

// Обновленная функция для работы с API Puter.js
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
    
    // Check if error is related to network/connection
    if (
      error.message.includes('network') || 
      error.message.includes('connection') || 
      error.message.includes('offline')
    ) {
      onPuterStatusChange && onPuterStatusChange('error');
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

  // Check if puter is loaded
  useEffect(() => {
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
  }, [onPuterStatusChange]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Уменьшаем количество логов для отладки
    // console.log("Input text:", e.target.value);
    // console.log("Textarea color:", getComputedStyle(e.target).color);
  };

  const handleClearChat = () => {
    setMessages([]);
    setStreamingMessage('');
    setIsStreaming(false);
  };

  const handleSendMessage = async () => {
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
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input and set loading state
    const userInput = input.trim();
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
      
      // Add error message
      setMessages(prevMessages => {
        // Filter out the streaming message
        const messages = prevMessages.filter(m => m.id !== 'streaming');
        
        // Add the error message
        return [...messages, {
          id: responseId,
          text: error.message.includes("Puter.js") 
            ? error.message 
            : "Sorry, I encountered an error while processing your request. Please try again.",
          sender: 'claude',
          isError: true,
          timestamp: new Date().toISOString(),
        }];
      });
    } finally {
      // Make sure loading state is cleared
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const retryPuterConnection = () => {
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
  };

  return (
    <ChatContainer>
      <MessagesContainer role="log" aria-live="polite" aria-label="Диалог с Claude 3.7 Sonnet">
        {messages.length === 0 && !isStreaming ? (
          <WelcomeMessage
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeTitle className="gradient-text">Welcome to Claude 3.7</WelcomeTitle>
            <WelcomeText>
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
            </WelcomeText>
          </WelcomeMessage>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
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
            ))}
          </AnimatePresence>
        )}
        
        {/* Show streaming response in real-time */}
        {isStreaming && streamingMessage && (
          <Message
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
            onKeyDown={handleKeyDown}
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

export default ChatInterface;

// Add default props at the bottom of the file
ChatInterface.defaultProps = {
  onPuterStatusChange: () => {}
}; 