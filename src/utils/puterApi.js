import { isUsingFallback, fallbackSendMessage, setFallbackStatus } from './fallbackApi';
import { debugLog, isDebugMode, collectDiagnostics } from './debugUtils';

// Number of retries for API calls
const MAX_RETRIES = 3;

// Claude model names (Fallback list - used if dynamic loading fails)
export const CLAUDE_MODELS = {
  CLAUDE_3_7_SONNET: 'claude-3-7-sonnet',
  CLAUDE_3_5_SONNET: 'claude-3-5-sonnet',
  O1: 'o1',
  O1_PRO: 'o1-pro',
  O1_MINI: 'o1-mini',
  O3: 'o3',
  O3_MINI: 'o3-mini',
  O4_MINI: 'o4-mini',
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4_1: 'gpt-4.1',
  GPT_4_1_MINI: 'gpt-4.1-mini',
  GPT_4_1_NANO: 'gpt-4.1-nano',
  GPT_4_5_PREVIEW: 'gpt-4.5-preview',
  META_LLAMA_3_1_8B: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  META_LLAMA_3_1_70B: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  META_LLAMA_3_1_405B: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
  GEMINI_2_0_FLASH: 'gemini-2.0-flash',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',
  DEEPSEEK_CHAT: 'deepseek-chat',
  DEEPSEEK_REASONER: 'deepseek-reasoner',
  MISTRAL_LARGE_LATEST: 'mistral-large-latest',
  PIXTRAL_LARGE_LATEST: 'pixtral-large-latest',
  CODESTRAL_LATEST: 'codestral-latest',
  GEMMA_2_27B_IT: 'google/gemma-2-27b-it',
  GROK_BETA: 'grok-beta',
  GROK4: 'x-ai/grok-4',
  O3PRO: 'openai/o3-pro',
  GPT5: 'gpt-5'
};

const detectProvider = (modelId) => {
  if (!modelId) return 'Unknown';
  
  const id = modelId.toLowerCase();
  
  if (id.includes('claude')) return 'Anthropic';
  if (id.includes('gpt') || id.includes('o1') || id.includes('o3') || id.includes('o4') || id.startsWith('openai/')) return 'OpenAI';
  if (id.includes('gemini') || id.includes('gemma') || id.startsWith('google/')) return 'Google';
  if (id.includes('llama') || id.startsWith('meta')) return 'Meta';
  if (id.includes('deepseek')) return 'DeepSeek';
  if (id.includes('mistral') || id.includes('pixtral') || id.includes('codestral')) return 'Mistral';
  if (id.includes('grok') || id.startsWith('x-ai/') || id.startsWith('xai/')) return 'xAI';
  
  return 'Other';
};

export const getAvailableModels = async () => {
  try {
    if (!isPuterAvailable()) {
      debugLog('Puter.js недоступен для загрузки списка моделей');
      return Object.entries(CLAUDE_MODELS).map(([key, value]) => ({
        id: value,
        name: key.replace(/_/g, ' '),
        provider: detectProvider(value)
      }));
    }

    debugLog('Загрузка списка доступных моделей через Puter API');
    const modelsResponse = await window.puter.ai.listModels();
    debugLog(`Получен ответ от puter.ai.listModels():`, modelsResponse);
    
    let models = [];
    
    if (Array.isArray(modelsResponse)) {
      models = modelsResponse;
    } else if (modelsResponse && typeof modelsResponse === 'object') {
      models = modelsResponse.models || modelsResponse.data || modelsResponse.items || [];
    }
    
    if (!Array.isArray(models) || models.length === 0) {
      console.warn('Не удалось получить список моделей из API, используем fallback');
      debugLog('Ответ API не содержит массив моделей:', modelsResponse);
      return Object.entries(CLAUDE_MODELS).map(([key, value]) => ({
        id: value,
        name: key.replace(/_/g, ' '),
        provider: detectProvider(value)
      }));
    }
    
    debugLog(`Загружено ${models.length} моделей из Puter API`);
    
    return models.map(model => {
      const modelId = model.id || model.model_id || model.name || model.model;
      const modelName = model.name || model.display_name || model.id || modelId;
      const provider = model.provider || model.owner || detectProvider(modelId);
      
      return {
        id: modelId,
        name: modelName,
        provider: provider,
        description: model.description || '',
        capabilities: model.capabilities || model.features || []
      };
    });
  } catch (error) {
    console.error('Ошибка при загрузке списка моделей:', error);
    debugLog(`Ошибка загрузки моделей: ${error.message}`);
    
    return Object.entries(CLAUDE_MODELS).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' '),
      provider: detectProvider(value)
    }));
  }
};

let cachedModels = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const getCachedModels = async (forceRefresh = false) => {
  const now = Date.now();
  
  if (!forceRefresh && cachedModels && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    debugLog('Использование кешированного списка моделей');
    return cachedModels;
  }
  
  debugLog('Обновление списка моделей');
  cachedModels = await getAvailableModels();
  cacheTimestamp = now;
  
  return cachedModels;
};

export const isPuterAvailable = () => {
  try {
    const available = typeof window.puter !== 'undefined' && 
                      window.puter && 
                      window.puter.ai && 
                      typeof window.puter.ai.chat === 'function';
    
    if (isDebugMode()) {
      debugLog(`Puter.js availability check: ${available}`);
    }
    
    return available;
  } catch (error) {
    console.error("Error checking Puter availability:", error);
    return false;
  }
};

export const sendMessageToClaude = async (message, onStreamUpdate, model = CLAUDE_MODELS.CLAUDE_3_5_SONNET, systemPrompt = '', testMode = false, temperature = 1.0, retryCount = 0) => {
  let fullResponse = '';

  if (testMode && !isPuterAvailable()) {
    debugLog('Test Mode: Puter.js not available. Using local simulated stream.');
    const mockResponse =
      'This is a mock response in test mode. The quick brown fox jumps over the lazy dog. ' +
      'This simulated stream demonstrates the UI\'s ability to handle incoming text chunks without making a real API call. ' +
      'Temperature is set to ' + temperature.toFixed(1) + '.';
    const chunks = mockResponse.split(' ');
    return new Promise(resolve => {
      let i = 0;
      function sendChunk() {
        if (i < chunks.length) {
          onStreamUpdate(chunks[i] + ' ');
          i++;
          setTimeout(sendChunk, 50);
        } else {
          resolve(mockResponse);
        }
      }
      sendChunk();
    });
  }

  try {
    const modelToUse = model || CLAUDE_MODELS.CLAUDE_3_5_SONNET;
    
    if (isDebugMode()) {
      debugLog(`Sending message to model: ${modelToUse}, retry: ${retryCount}/${MAX_RETRIES}`);
      if (systemPrompt) {
        debugLog(`Using system prompt: ${systemPrompt.substring(0, 50)}${systemPrompt.length > 50 ? '...' : ''}`);
      }
    }
    
    if (isUsingFallback()) {
      debugLog('Using fallback mode for message sending');
      return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
    }
    
    if (!isPuterAvailable()) {
      debugLog('Puter.js not available for message sending');
      
      if (retryCount > 0) {
        console.warn(`Switching to fallback after ${retryCount} failed attempts with Puter.js`);
        return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
      }
      
      debugLog('Attempting to load Puter.js');
      const loaded = await loadPuterScript();
      if (!loaded) {
        debugLog('Failed to load Puter.js, switching to fallback');
        return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
      }
    }

    try {
      debugLog(`Calling model: ${modelToUse} API via Puter.js`);
      
      try {
        let response;
        
        if (systemPrompt && systemPrompt.trim()) {
          const messages = [
            {
              role: 'system',
              content: systemPrompt.trim()
            },
            {
              role: 'user',
              content: message
            }
          ];
          
          if (isDebugMode()) {
            debugLog(`Calling with messages array format: ${JSON.stringify(messages.map(m => ({ role: m.role, content_length: m.content.length })))}`);
          }
          
          response = await window.puter.ai.chat(
            messages,
            Boolean(testMode),
            {
              model: modelToUse,
              stream: true,
              temperature: temperature,
              max_tokens: 100000  // Убран лимит - максимальное количество токенов
            }
          );
        } else {
          if (isDebugMode()) {
            debugLog(`Calling with simple format: message length ${message.length}`);
          }
          
          response = await window.puter.ai.chat(
            message,
            Boolean(testMode),
            {
              model: modelToUse,
              stream: true,
              temperature: temperature,
              max_tokens: 100000  // Убран лимит - максимальное количество токенов
            }
          );
        }
        
        let isStreamComplete = false;
        let streamTimeout;
        let lastDataTime = Date.now();
        
        try {
          const STREAM_TIMEOUT = 120000;
          const INACTIVITY_TIMEOUT = 30000;
          
          const resetTimeout = () => {
            lastDataTime = Date.now();
            if (streamTimeout) {
              clearTimeout(streamTimeout);
            }
            
            streamTimeout = setTimeout(() => {
              if (!isStreamComplete) {
                const timeSinceLastData = Date.now() - lastDataTime;
                if (timeSinceLastData > INACTIVITY_TIMEOUT) {
                  debugLog('Stream inactivity timeout - no data received for 30 seconds');
                  console.warn('Stream appears stalled - no new data received');
                }
              }
            }, STREAM_TIMEOUT);
          };
          
          resetTimeout();
          
          for await (const part of response) {
            resetTimeout();
            
            if (part && part.text) {
              if (isDebugMode() && part.text.length < 50) {
                debugLog(`Stream update: ${part.text}`);
              }
              onStreamUpdate(part.text);
              fullResponse += part.text;
            }
          }
          
          isStreamComplete = true;
          clearTimeout(streamTimeout);
          
          debugLog(`Stream completed successfully. Response length: ${fullResponse.length} characters`);
          
        } catch (streamError) {
          console.error("Error during streaming:", streamError);
          clearTimeout(streamTimeout);
          
          const errorMessage = "\n\n[Ответ был прерван из-за ошибки при получении данных]";
          onStreamUpdate(errorMessage);
          fullResponse += errorMessage;
          
          const isRecoverable = streamError.message && (
            streamError.message.includes("timeout") || 
            streamError.message.includes("temporarily") || 
            streamError.message.includes("retry")
          );
          
          if (isRecoverable && retryCount < MAX_RETRIES - 1) {
            console.log(`Attempting to recover from stream interruption (retry ${retryCount + 1}/${MAX_RETRIES})`);
            onStreamUpdate("\n\n[Пытаемся восстановить соединение...]");
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return await sendMessageToClaude(message, onStreamUpdate, modelToUse, systemPrompt, testMode, temperature, retryCount + 1);
          }
          
          if (streamError.message && (
              streamError.message.includes("network") || 
              streamError.message.includes("connection") ||
              streamError.message.includes("abort")
          )) {
            throw streamError;
          }
        }
      } catch (modelError) {
        console.error(`Error with model ${modelToUse}:`, modelError);
        
        let errorMessage = "⚠️ Ошибка с выбранной моделью. ";
        
        if (modelError.message) {
          if (modelError.message.includes("not supported")) {
            errorMessage += `Модель "${modelToUse}" в данный момент не поддерживается. `;
          } else if (modelError.message.includes("unavailable")) {
            errorMessage += `Модель "${modelToUse}" временно недоступна. `;
          } else if (modelError.message.includes("quota") || modelError.message.includes("limit")) {
            errorMessage += `Превышена квота использования для модели "${modelToUse}". `;
          } else if (modelError.message.includes("permission")) {
            errorMessage += `У вас нет разрешения на использование модели "${modelToUse}". `;
          } else if (modelError.message.includes("format")) {
            errorMessage += `Неверный формат запроса для модели "${modelToUse}". `;
          } else {
            errorMessage += `Ошибка: ${modelError.message}`;
          }
        } else {
          errorMessage += `Возникла проблема при использовании выбранной модели "${modelToUse}". `;
        }
        
        onStreamUpdate(errorMessage);
        throw modelError;
      }

      if (isUsingFallback()) {
        debugLog('Resetting fallback status after successful call');
        setFallbackStatus(false);
      }
      
      return fullResponse;
    } catch (apiError) {
      console.error("Error calling API directly:", apiError);
      
      if (isDebugMode()) {
        debugLog('Collecting diagnostics after API error');
        collectDiagnostics().then(diagnostics => {
          debugLog('Diagnostics after API error:', diagnostics);
        });
      }
      
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying API call (${retryCount + 1}/${MAX_RETRIES - 1})...`);
        return await sendMessageToClaude(message, onStreamUpdate, modelToUse, systemPrompt, testMode, temperature, retryCount + 1);
      }
      
      console.warn("Switching to fallback API after exhausting retries");
      return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const loadPuterScript = () => {
  return new Promise((resolve) => {
    if (isDebugMode()) {
      debugLog('Attempting to load Puter.js script');
    }
    
    if (isPuterAvailable()) {
      debugLog('Puter.js already available');
      resolve(true);
      return;
    }

    if (document.querySelector('script[src*="puter.com"]')) {
      debugLog('Puter.js script already loading, waiting for it');
      const checkInterval = setInterval(() => {
        if (isPuterAvailable()) {
          clearInterval(checkInterval);
          debugLog('Puter.js became available');
          resolve(true);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(checkInterval);
        debugLog('Timed out waiting for Puter.js to load');
        resolve(false);
      }, 5000);
      return;
    }

    debugLog('Creating new Puter.js script tag');
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.setAttribute('fetchpriority', 'high');
    
    script.onload = () => {
      debugLog('Puter.js script loaded, waiting for initialization');
      const checkInterval = setInterval(() => {
        if (isPuterAvailable()) {
          clearInterval(checkInterval);
          debugLog('Puter.js initialized successfully');
          resolve(true);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(checkInterval);
        debugLog('Timed out waiting for Puter.js to initialize');
        resolve(false);
      }, 5000);
    };
    
    script.onerror = () => {
      console.error("Failed to load Puter.js");
      debugLog('Error loading Puter.js script');
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};