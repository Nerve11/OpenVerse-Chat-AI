import { isUsingFallback, fallbackSendMessage, setFallbackStatus } from './fallbackApi';
import { debugLog, isDebugMode, collectDiagnostics } from './debugUtils';

// Number of retries for API calls
const MAX_RETRIES = 3;

// Claude model names
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
 * @param {string} message - The user's message
 * @param {function} onStreamUpdate - Callback for streaming updates
 * @param {string} model - The model to use (defaults to CLAUDE_3_5_SONNET)
 * @param {string} systemPrompt - Optional system prompt to influence model behavior
 * @param {boolean} testMode - Whether to use test mode
 * @param {number} temperature - The temperature for the model
 * @param {number} retryCount - Current retry count (internal use)
 * @returns {Promise<string>} The complete response
 */
export const sendMessageToClaude = async (message, onStreamUpdate, model = CLAUDE_MODELS.CLAUDE_3_5_SONNET, systemPrompt = '', testMode = false, temperature = 1.0, retryCount = 0) => {
  let fullResponse = '';

  // If Puter is unavailable, provide a local simulation so the UI can still be tested without credits
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
    // Validate that we have a proper model specified
    const modelToUse = model || CLAUDE_MODELS.CLAUDE_3_5_SONNET;
    
    // List of currently supported models (should be updated as Puter API evolves)
    const SUPPORTED_MODELS = [
      CLAUDE_MODELS.CLAUDE_3_7_SONNET, 
      CLAUDE_MODELS.CLAUDE_3_5_SONNET,
      CLAUDE_MODELS.GPT_4O,
      CLAUDE_MODELS.O1,
      CLAUDE_MODELS.O1_PRO,
      CLAUDE_MODELS.O3,
      CLAUDE_MODELS.O3_MINI,
      CLAUDE_MODELS.O4_MINI,
      CLAUDE_MODELS.GPT_4_1,
      CLAUDE_MODELS.GEMINI_2_0_FLASH,
      CLAUDE_MODELS.META_LLAMA_3_1_8B,
      CLAUDE_MODELS.META_LLAMA_3_1_70B,
      CLAUDE_MODELS.META_LLAMA_3_1_405B,
      CLAUDE_MODELS.DEEPSEEK_CHAT,
      CLAUDE_MODELS.DEEPSEEK_REASONER,
      CLAUDE_MODELS.PIXTRAL_LARGE_LATEST,
      CLAUDE_MODELS.GEMMA_2_27B_IT,
      CLAUDE_MODELS.GROK_BETA,
      CLAUDE_MODELS.GROK4,
      CLAUDE_MODELS.GPT5
    ];
    
    // Check if selected model is in the supported list
    if (!SUPPORTED_MODELS.includes(modelToUse)) {
      console.warn(`Model ${modelToUse} might not be supported yet by the Puter API`);
      if (isDebugMode()) {
        debugLog(`Model ${modelToUse} might not be fully supported, will attempt anyway`);
      }
      onStreamUpdate("⚠️ Warning: The selected model may not be fully supported. Attempting to use it anyway...\n\n");
    }
    
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
      
      // Wrap the API call in a try/catch to handle any model-specific errors
      try {
        // Different handling based on whether we're using messages or direct prompt
        let response;
        
        // According to the Puter.js documentation, there are multiple ways to call the API
        if (systemPrompt && systemPrompt.trim()) {
          // If we have a system prompt, use the messages array format
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
          
          // Call with messages array and model in options
          if (isDebugMode()) {
            debugLog(`Calling with messages array format: ${JSON.stringify(messages.map(m => ({ role: m.role, content_length: m.content.length })))}`);
          }
          
          // Per docs: puter.ai.chat(messages, testMode = false, options = {})
          response = await window.puter.ai.chat(
            messages,
            Boolean(testMode),
            {
              model: modelToUse,
              stream: true,
              temperature: temperature
            }
          );
        } else {
          // If no system prompt, use the simpler format with just the message and options
          if (isDebugMode()) {
            debugLog(`Calling with simple format: message length ${message.length}`);
          }
          
          // Per docs: puter.ai.chat(prompt, testMode = false, options = {})
          response = await window.puter.ai.chat(
            message,
            Boolean(testMode),
            {
              model: modelToUse,
              stream: true,
              temperature: temperature
            }
          );
        }
        
        // Handle streaming response
        let isStreamComplete = false;
        let streamTimeout;
        
        try {
          // Set a timeout to detect stalled streams
          const STREAM_TIMEOUT = 60000; // 60 seconds timeout (increased from 30s)
          
          streamTimeout = setTimeout(() => {
            if (!isStreamComplete) {
              debugLog('Stream timeout detected - response may be incomplete');
              onStreamUpdate("\n\n[Ответ может быть неполным из-за таймаута]");
            }
          }, STREAM_TIMEOUT);
          
          // Process the streaming response with better error handling
          for await (const part of response) {
            if (part && part.text) {
              if (isDebugMode() && part.text.length < 50) {
                debugLog(`Stream update: ${part.text}`);
              }
              onStreamUpdate(part.text);
              fullResponse += part.text;
            }
          }
          
          // Mark stream as complete
          isStreamComplete = true;
          clearTimeout(streamTimeout);
          
          // If the response seems unusually short, add a note
          if (fullResponse.length < 20 && !fullResponse.endsWith('.') && !fullResponse.endsWith('?') && !fullResponse.endsWith('!')) {
            debugLog('Response seems suspiciously short or incomplete');
            onStreamUpdate("\n\n[Ответ может быть неполным]");
          }
        } catch (streamError) {
          // Handle errors during streaming
          console.error("Error during streaming:", streamError);
          clearTimeout(streamTimeout);
          
          // Notify user about the interrupted response
          onStreamUpdate("\n\n[Ответ был прерван из-за ошибки при получении данных]");
          
          // Check if this is a recoverable error (like a temporary network hiccup)
          const isRecoverable = streamError.message && (
            streamError.message.includes("timeout") || 
            streamError.message.includes("temporarily") || 
            streamError.message.includes("retry")
          );
          
          // If error seems recoverable and we haven't retried too many times, try again
          if (isRecoverable && retryCount < MAX_RETRIES - 1) {
            console.log(`Attempting to recover from stream interruption (retry ${retryCount + 1}/${MAX_RETRIES})`);
            onStreamUpdate("\n\n[Пытаемся восстановить соединение...]");
            
            // Wait a moment before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry with incremented retry count
            return await sendMessageToClaude(message, onStreamUpdate, modelToUse, systemPrompt, retryCount + 1);
          }
          
          // Rethrow error if it's severe
          if (streamError.message && (
              streamError.message.includes("network") || 
              streamError.message.includes("connection") ||
              streamError.message.includes("abort")
          )) {
            throw streamError;
          }
        }
      } catch (modelError) {
        // If there's an error with the specific model, report it but don't auto-switch
        console.error(`Error with model ${modelToUse}:`, modelError);
        
        // Provide more specific error details to help diagnose the issue
        let errorMessage = "⚠️ Error with selected model. ";
        
        if (modelError.message) {
          if (modelError.message.includes("not supported")) {
            errorMessage += `The model "${modelToUse}" is not currently supported. `;
          } else if (modelError.message.includes("unavailable")) {
            errorMessage += `The model "${modelToUse}" is temporarily unavailable. `;
          } else if (modelError.message.includes("quota") || modelError.message.includes("limit")) {
            errorMessage += `Usage quota exceeded for model "${modelToUse}". `;
          } else if (modelError.message.includes("permission")) {
            errorMessage += `You don't have permission to use model "${modelToUse}". `;
          } else if (modelError.message.includes("format")) {
            errorMessage += `Invalid request format for model "${modelToUse}". `;
          } else {
            // Include actual error message for transparency
            errorMessage += `Error: ${modelError.message}`;
          }
        } else {
          errorMessage += `There was an issue using the selected model "${modelToUse}". `;
        }
        
        onStreamUpdate(errorMessage);
        
        // Just throw the error instead of switching to Claude 3.5 Sonnet
        throw modelError;
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
