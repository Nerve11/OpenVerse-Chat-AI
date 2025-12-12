import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import AuthManager from './components/AuthManager';
import { isPuterAvailable, sendMessageToClaude, loadPuterScript, CLAUDE_MODELS, getCachedModels } from './utils/puterApi';
import { setDebugMode, isDebugMode, collectDiagnostics } from './utils/debugUtils';
import { testPuterApi, testClaude37Access } from './utils/puterTest';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

// Function to generate a unique ID for messages
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Function to handle AI API calls
const sendToAI = async (message, setStreamingMessage, selectedModel, systemPrompt, testMode, temperature) => {
  try {
    if (!isPuterAvailable()) {
      throw new Error("Puter.js API not available");
    }

    setStreamingMessage({ content: '', role: 'assistant', id: generateUniqueId() });
    let responseBuffer = '';
    
    try {
      await sendMessageToClaude(
        message, 
        (update) => {
          if (typeof update !== 'string') {
            console.warn("Invalid update received:", update);
            return;
          }
          
          responseBuffer += update;
          
          setStreamingMessage(prev => {
            if (!prev || prev.content === undefined) {
              return { 
                content: responseBuffer, 
                role: 'assistant', 
                id: generateUniqueId() 
              };
            }
            
            return {
              ...prev,
              content: responseBuffer
            };
          });
        },
        selectedModel,
        systemPrompt,
        testMode,
        temperature
      );

      return true;
    } catch (apiError) {
      console.error("API Error:", apiError);
      
      if (responseBuffer) {
        setStreamingMessage(prev => ({
          ...prev,
          content: responseBuffer
        }));
      }
      
      return false;
    }
  } catch (error) {
    console.error("Error in sendToAI:", error);
    
    setStreamingMessage(prev => {
      if (!prev || !prev.content || !prev.content.includes("⚠️ Error")) {
        return {
          ...prev,
          content: (prev?.content || '') + 
            "\n\n⚠️ Ошибка: " + (error.message || "Не удалось подключиться к API.")
        };
      }
      return prev;
    });
    
    return false;
  }
};

const App = ({ puterLoaded, puterTimeout }) => {
  const [connectionStatus, setConnectionStatus] = useState('loading');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const inputRef = useRef(null);
  const currentStreamingMessageRef = useRef(null);
  const [debugActive, setDebugActive] = useState(isDebugMode());
  const [testMode, setTestMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(CLAUDE_MODELS.CLAUDE_3_5_SONNET);
  const [systemPrompt, setSystemPrompt] = useState(() => {
    const savedPrompt = localStorage.getItem('systemPrompt');
    return savedPrompt || '';
  });
  const [isSystemPromptVisible, setIsSystemPromptVisible] = useState(false);
  const [showPromptNotification, setShowPromptNotification] = useState(false);
  const [temperature, setTemperature] = useState(1.0);
  const [attachments, setAttachments] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  
  useEffect(() => {
    currentStreamingMessageRef.current = streamingMessage;
  }, [streamingMessage]);
  
  useEffect(() => {
    const loadModels = async () => {
      if (isPuterAvailable()) {
        try {
          const models = await getCachedModels();
          setAvailableModels(models);
        } catch (error) {
          console.error('Ошибка при загрузке моделей:', error);
        }
      }
    };
    
    loadModels();
    const interval = setInterval(loadModels, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [puterLoaded]);
  
  useEffect(() => {
    if (systemPrompt) {
      localStorage.setItem('systemPrompt', systemPrompt);
    } else {
      localStorage.removeItem('systemPrompt');
    }
  }, [systemPrompt]);
  
  useEffect(() => {
    if (showPromptNotification) {
      const timer = setTimeout(() => {
        setShowPromptNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPromptNotification]);
  
  useEffect(() => {
    const setupPuter = async () => {
      try {
        if (puterLoaded) {
          setConnectionStatus('loaded');
        } else if (puterTimeout) {
          const loaded = await loadPuterScript();
          if (loaded) {
            setConnectionStatus('loaded');
          } else {
            setConnectionStatus('error');
          }
        } else {
          setConnectionStatus('loading');
        }
      } catch (error) {
        console.error("Connection error:", error);
        setConnectionStatus('error');
      }
    };
    
    setupPuter();
  }, [puterLoaded, puterTimeout]);

  const { t } = useTranslation();

  const connectionStatusText = useMemo(() => {
    switch(connectionStatus) {
      case 'loading': return t('app.connecting');
      case 'loaded': return t('app.connected');
      case 'error': return t('app.error');
      default: return '';
    }
  }, [connectionStatus, t]);

  const connectionStatusClass = useMemo(() => {
    switch(connectionStatus) {
      case 'loading': return 'connecting';
      case 'loaded': return 'connected';
      case 'error': return 'error';
      default: return '';
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;
    
    let composed = inputValue.trim();
    if (attachments.length > 0) {
      const header = `\n\n[Attached files (${attachments.length})]\n`;
      const filesText = attachments.map(f => `\n---\nFile: ${f.name}\n\n\`\`\`\n${f.content}\n\`\`\``).join('');
      composed += header + filesText + '\n\n';
    }

    const userMessage = {
      content: composed,
      role: 'user',
      id: generateUniqueId()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);
    
    try {
      const modelToUse = selectedModel || CLAUDE_MODELS.CLAUDE_3_5_SONNET;
      setStreamingMessage({ content: '', role: 'assistant', id: generateUniqueId() });
      
      const success = await sendToAI(
        userMessage.content, 
        setStreamingMessage,
        modelToUse,
        systemPrompt,
        testMode,
        temperature
      );
      
      const currentMessage = currentStreamingMessageRef.current;
      
      if (currentMessage && currentMessage.content) {
        const assistantMessage = {
          content: currentMessage.content,
          role: 'assistant',
          id: currentMessage.id || generateUniqueId()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else if (!success) {
        setMessages(prev => [...prev, {
          content: "Произошла ошибка при обработке запроса.",
          role: 'assistant',
          id: generateUniqueId()
        }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        content: "Произошла ошибка.",
        role: 'assistant',
        id: generateUniqueId()
      }]);
    } finally {
      setIsStreaming(false);
      setStreamingMessage(null);
      setAttachments([]);
    }
  };

  const handleDiscussCode = (code) => {
    const formattedCode = "```\n" + code + "\n```\n\n";
    setInputValue(formattedCode);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectModel = (modelId) => {
    if (modelId) {
      setSelectedModel(modelId);
    }
  };
  
  const handleSystemPromptChange = (newPrompt) => {
    const cleanPrompt = newPrompt !== null && newPrompt !== undefined ? newPrompt : '';
    setSystemPrompt(cleanPrompt);
    setIsSystemPromptVisible(false);
    if (cleanPrompt) {
      setShowPromptNotification(true);
    }
  };

  const handleClearSystemPrompt = () => {
    if (window.confirm("Remove system prompt?")) {
      setSystemPrompt('');
    }
  };

  const toggleSystemPromptVisibility = () => {
    setIsSystemPromptVisible(!isSystemPromptVisible);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleToggleDebug = async () => {
    const newDebugState = !debugActive;
    setDebugActive(newDebugState);
    setDebugMode(newDebugState);
    
    if (newDebugState) {
      localStorage.setItem('debug_mode', 'true');
      const diagnostics = await collectDiagnostics();
      console.log("Diagnostics:", diagnostics);
      const apiTest = await testPuterApi();
      console.log("API test:", apiTest);
      if (apiTest.isClaudeAvailable) {
        const claudeTest = await testClaude37Access();
        console.log("AI access test:", claudeTest ? "PASSED" : "FAILED");
      }
    } else {
      localStorage.removeItem('debug_mode');
    }
  };

  const handleToggleTestMode = () => {
    setTestMode(prev => !prev);
  };

  const handleTemperatureChange = (newTemperature) => {
    setTemperature(newTemperature);
  };

  const handleFilesAdded = (files) => {
    setAttachments(prev => [...prev, ...files]);
    inputRef.current?.focus();
  };

  const handleAuthChange = (isAuth, user) => {
    if (isAuth && user) {
      console.log(`User authenticated: ${user.username}`);
    } else {
      console.log('User signed out');
    }
  };

  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <div className="main-container">
          <Sidebar
            selectedModel={selectedModel}
            onSelectModel={handleSelectModel}
            availableModels={availableModels}
            onClearChat={handleClearChat}
            systemPrompt={systemPrompt}
            onToggleSystemPromptVisibility={toggleSystemPromptVisibility}
          />
          
          <div className="main-content">
            <div className="header">
              <div className="header-title">
                {t('app.chat') || 'Chat'}
              </div>
              <div className="header-controls">
                <div className={`connected ${connectionStatusClass}`}>
                  <div className="group">
                    <div className="vector" />
                    <span className="connected-1">{connectionStatusText}</span>
                  </div>
                </div>
                <LanguageSwitcher />
                <AuthManager onAuthChange={handleAuthChange} />
              </div>
            </div>
            
            <div className="chat">
              <ChatInterface 
                messages={messages} 
                setMessages={setMessages}
                streamingMessage={streamingMessage}
                puterLoaded={puterLoaded}
                onDiscussCode={handleDiscussCode}
              />
            </div>
            
            <div className="write-message">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder') || 'Type your message...'}
                disabled={!puterLoaded || isStreaming}
                className="message-claude-sonnet"
              />
              <div className="frame-3" onClick={handleSendMessage} />
            </div>
            
            <Controls
              systemPrompt={systemPrompt}
              onSystemPromptChange={handleSystemPromptChange}
              isSystemPromptVisible={isSystemPromptVisible}
              onToggleSystemPromptVisibility={toggleSystemPromptVisibility}
              onClearSystemPrompt={handleClearSystemPrompt}
              debugActive={debugActive}
              onToggleDebug={handleToggleDebug}
              testMode={testMode}
              onToggleTestMode={handleToggleTestMode}
              temperature={temperature}
              onTemperatureChange={handleTemperatureChange}
              onFilesAdded={handleFilesAdded}
              attachmentsCount={attachments.length}
            />
            
            {showPromptNotification && systemPrompt && (
              <div className="system-prompt-notification">
                <div className="notification-icon">S</div>
                <div className="notification-text">System prompt activated</div>
              </div>
            )}
          </div>
        </div>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
};

export default App;