/**
 * Fallback API for accessing Claude 3.7 when Puter.js is unavailable
 * This provides alternative methods to access Claude API
 */

// Flag to track if we're using fallback mode
let usingFallback = false;

/**
 * Check if we're currently using fallback mode
 * @returns {boolean} True if using fallback
 */
export const isUsingFallback = () => usingFallback;

/**
 * Set fallback status
 * @param {boolean} status - Whether to use fallback
 */
export const setFallbackStatus = (status) => {
  usingFallback = status;
  console.log(`Claude API fallback mode ${status ? 'enabled' : 'disabled'}`);
};

/**
 * Fallback method to send a message to Claude 3.7 Sonnet
 * This method uses a direct script injection approach as a workaround
 * 
 * @param {string} message - User message
 * @param {function} onStreamUpdate - Callback for streaming updates
 * @param {string} systemPrompt - Optional system prompt to influence model behavior
 * @returns {Promise<string>} The complete response
 */
export const fallbackSendMessage = async (message, onStreamUpdate, systemPrompt = '') => {
  try {
    console.log('Using fallback method to access Claude API');
    
    // First, make sure fallback mode is enabled
    setFallbackStatus(true);
    
    // Create a new function in the global scope to handle Claude response
    const callbackId = `claude_callback_${Date.now()}`;
    
    // Set up a promise that will resolve when Claude responds
    const responsePromise = new Promise((resolve, reject) => {
      // Set up a global callback function that Claude will call
      window[callbackId] = (response, error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(response);
        }
        
        // Clean up the global callback
        delete window[callbackId];
      };
      
      // Set timeout to prevent waiting indefinitely
      setTimeout(() => {
        if (window[callbackId]) {
          delete window[callbackId];
          reject(new Error('Claude API request timed out'));
        }
      }, 30000); // 30 second timeout
    });
    
    // Create a streamer function to handle streaming updates
    window[`${callbackId}_stream`] = (chunk) => {
      if (onStreamUpdate && typeof onStreamUpdate === 'function') {
        onStreamUpdate(chunk);
      }
    };
    
    // Create and inject script element to load alternative Claude API access
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      // Once loaded, attempt to access Claude API through an alternative method
      const claudeScript = document.createElement('script');
      claudeScript.textContent = `
        try {
          if (window.puter && window.puter.ai && window.puter.ai.claudeCompletion) {
            const apiOptions = {
              messages: [{ role: 'user', content: ${JSON.stringify(message)} }],
              model: 'claude-3-7-sonnet',
              stream: true,
              max_tokens: 65000,
              onStreamUpdate: function(update) {
                if (window['${callbackId}_stream']) {
                  window['${callbackId}_stream'](update);
                }
              }
            };
            
            // Add system prompt if provided
            if (${JSON.stringify(systemPrompt)} && ${JSON.stringify(systemPrompt)}.trim() !== '') {
              const trimmedPrompt = ${JSON.stringify(systemPrompt)}.trim();
              if (trimmedPrompt.length > 0) {
                apiOptions.systemPrompt = trimmedPrompt;
                console.log('Fallback API: Setting systemPrompt (length: ' + trimmedPrompt.length + ')');
              }
            }
            
            window.puter.ai.claudeCompletion(apiOptions)
            .then(function(response) {
              if (window['${callbackId}']) {
                window['${callbackId}'](response);
              }
            })
            .catch(function(error) {
              if (window['${callbackId}']) {
                window['${callbackId}'](null, error.message || 'Error calling Claude API');
              }
            });
          } else {
            if (window['${callbackId}']) {
              window['${callbackId}'](null, 'Claude API not available');
            }
          }
        } catch (error) {
          if (window['${callbackId}']) {
            window['${callbackId}'](null, error.message || 'Error accessing Claude API');
          }
        }
      `;
      document.head.appendChild(claudeScript);
    };
    
    script.onerror = () => {
      if (window[callbackId]) {
        window[callbackId](null, 'Failed to load Puter.js');
      }
    };
    
    document.head.appendChild(script);
    
    // Wait for the response
    const response = await responsePromise;
    
    // Clean up streaming callback
    delete window[`${callbackId}_stream`];
    
    return response;
  } catch (error) {
    console.error('Fallback Claude API access failed:', error);
    throw error;
  }
}; 