/**
 * Utility functions for working with Puter.js API
 * Documentation: https://docs.puter.com/AI/chat/
 */
import { isUsingFallback, fallbackSendMessage, setFallbackStatus } from './fallbackApi';
import { debugLog, isDebugMode, collectDiagnostics } from './debugUtils';

// Number of retries for API calls
const MAX_RETRIES = 3;

// Claude model names
export const CLAUDE_MODELS = {
  CLAUDE_3_7_SONNET: 'claude-3-7-sonnet',
  CLAUDE_3_5_SONNET: 'claude-3-5-sonnet',
  GPT_4O: 'gpt-4o',
  O3_MINI: 'o3-mini',
  O1_MINI: 'o1-mini',
  META_LLAMA_3_1_405B: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
  GEMINI_2_0_FLASH: 'gemini-2.0-flash',
  DEEPSEEK_REASONER: 'deepseek-reasoner'
};

/**
 * Checks if Puter.js API is available
 * @returns {boolean} True if Puter.js is available
 */
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

/**
 * Sends a message to Claude via Puter.js API
 * @param {string} message - The user's message
 * @param {function} onStreamUpdate - Callback for streaming updates
 * @param {string} model - The model to use (defaults to CLAUDE_3_5_SONNET)
 * @param {string} systemPrompt - Optional system prompt to influence model behavior
 * @param {number} retryCount - Current retry count (internal use)
 * @returns {Promise<string>} The complete response
 */
export const sendMessageToClaude = async (message, onStreamUpdate, model = CLAUDE_MODELS.CLAUDE_3_5_SONNET, systemPrompt = '', retryCount = 0) => {
  try {
    // Validate that we have a proper model specified
    const modelToUse = model || CLAUDE_MODELS.CLAUDE_3_5_SONNET;
    
    if (isDebugMode()) {
      debugLog(`Sending message to Claude, retry: ${retryCount}/${MAX_RETRIES}, model: ${modelToUse}`);
      if (systemPrompt) {
        debugLog(`Using system prompt: ${systemPrompt.substring(0, 50)}${systemPrompt.length > 50 ? '...' : ''}`);
      }
    }
    
    // If we're already in fallback mode, use fallback directly
    if (isUsingFallback()) {
      debugLog('Using fallback mode for message sending');
      return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
    }
    
    // Check if Puter.js is available
    if (!isPuterAvailable()) {
      debugLog('Puter.js not available for message sending');
      
      // If we've already retried, use fallback
      if (retryCount > 0) {
        console.warn(`Switching to fallback after ${retryCount} failed attempts with Puter.js`);
        return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
      }
      
      // Try to load Puter.js first
      debugLog('Attempting to load Puter.js');
      const loaded = await loadPuterScript();
      if (!loaded) {
        debugLog('Failed to load Puter.js, switching to fallback');
        return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
      }
    }

    // Call Claude through Puter.js API
    try {
      debugLog(`Calling model: ${modelToUse} API via Puter.js`);
      
      let fullResponse = '';
      
      // Wrap the API call in a try/catch to handle any model-specific errors
      try {
        // Prepare API options
        const apiOptions = {
          model: modelToUse,
          stream: true,
          max_tokens: 65000 // Добавляем максимальное количество токенов для ответа
        };
        
        // Add system prompt if provided
        if (systemPrompt && systemPrompt.trim() !== '') {
          // Проверяем, что системный промпт не пустой
          const trimmedPrompt = systemPrompt.trim();
          if (trimmedPrompt.length > 0) {
            apiOptions.systemPrompt = trimmedPrompt;
            console.log(`Setting systemPrompt in API options (${trimmedPrompt.length} chars): "${trimmedPrompt.substring(0, 50)}${trimmedPrompt.length > 50 ? '...' : ''}"`);
          }
        }
        
        console.log('API options:', JSON.stringify(apiOptions));
        
        const response = await window.puter.ai.chat(message, apiOptions);
        
        // Handle streaming response
        for await (const part of response) {
          if (part && part.text) {
            if (isDebugMode() && part.text.length < 50) {
              debugLog(`Stream update: ${part.text}`);
            }
            onStreamUpdate(part.text);
            fullResponse += part.text;
          }
        }
      } catch (modelError) {
        // If there's an error with the specific model, try with a default model
        console.error(`Error with model ${modelToUse}:`, modelError);
        
        if (modelToUse !== CLAUDE_MODELS.CLAUDE_3_5_SONNET) {
          debugLog(`Falling back to default model ${CLAUDE_MODELS.CLAUDE_3_5_SONNET}`);
          onStreamUpdate("⚠️ Error with selected model. Switching to Claude 3.5 Sonnet.\n\n");
          
          // Prepare fallback API options
          const fallbackOptions = {
            model: CLAUDE_MODELS.CLAUDE_3_5_SONNET,
            stream: true,
            max_tokens: 65000 // Добавляем максимальное количество токенов для ответа
          };
          
          // Add system prompt if provided
          if (systemPrompt && systemPrompt.trim() !== '') {
            // Используем параметр systemPrompt вместо массива messages
            const trimmedPrompt = systemPrompt.trim();
            if (trimmedPrompt.length > 0) {
              fallbackOptions.systemPrompt = trimmedPrompt;
              console.log(`Setting systemPrompt in fallback options (${trimmedPrompt.length} chars): "${trimmedPrompt.substring(0, 50)}${trimmedPrompt.length > 50 ? '...' : ''}"`);
            }
          }
          
          console.log('Fallback options:', JSON.stringify(fallbackOptions));
          
          const response = await window.puter.ai.chat(message, fallbackOptions);
          
          for await (const part of response) {
            if (part && part.text) {
              onStreamUpdate(part.text);
              fullResponse += part.text;
            }
          }
        } else {
          // If we're already using the default model, rethrow the error
          throw modelError;
        }
      }

      // Reset fallback status if successful
      if (isUsingFallback()) {
        debugLog('Resetting fallback status after successful call');
        setFallbackStatus(false);
      }
      
      return fullResponse;
    } catch (apiError) {
      console.error("Error calling Claude API directly:", apiError);
      
      if (isDebugMode()) {
        debugLog('Collecting diagnostics after API error');
        collectDiagnostics().then(diagnostics => {
          debugLog('Diagnostics after API error:', diagnostics);
        });
      }
      
      // If this is not our last retry, try again
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying Claude API call (${retryCount + 1}/${MAX_RETRIES - 1})...`);
        return await sendMessageToClaude(message, onStreamUpdate, modelToUse, systemPrompt, retryCount + 1);
      }
      
      // Otherwise, use fallback
      console.warn("Switching to fallback API after exhausting retries");
      return await fallbackSendMessage(message, onStreamUpdate, systemPrompt);
    }
  } catch (error) {
    console.error("Error sending message to Claude:", error);
    throw error;
  }
};

/**
 * Loads the Puter.js script if not already loaded
 * @returns {Promise<boolean>} Resolves to true if loaded successfully
 */
export const loadPuterScript = () => {
  return new Promise((resolve) => {
    if (isDebugMode()) {
      debugLog('Attempting to load Puter.js script');
    }
    
    // If already loaded, resolve immediately
    if (isPuterAvailable()) {
      debugLog('Puter.js already available');
      resolve(true);
      return;
    }

    // Script already loading, wait for it
    if (document.querySelector('script[src*="puter.com"]')) {
      debugLog('Puter.js script already loading, waiting for it');
      const checkInterval = setInterval(() => {
        if (isPuterAvailable()) {
          clearInterval(checkInterval);
          debugLog('Puter.js became available');
          resolve(true);
        }
      }, 200);
      // Set a timeout for script loading
      setTimeout(() => {
        clearInterval(checkInterval);
        debugLog('Timed out waiting for Puter.js to load');
        resolve(false);
      }, 5000); // 5 second timeout
      return;
    }

    // Load the script
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
      // Set a timeout for initialization
      setTimeout(() => {
        clearInterval(checkInterval);
        debugLog('Timed out waiting for Puter.js to initialize');
        resolve(false);
      }, 5000); // 5 second timeout
    };
    
    script.onerror = () => {
      console.error("Failed to load Puter.js");
      debugLog('Error loading Puter.js script');
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
}; 