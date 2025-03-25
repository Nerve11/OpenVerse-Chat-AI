/**
 * Example of using Claude 3.5 Sonnet via Puter.js API directly
 * This demonstrates the minimal implementation needed
 */

// Claude model names
const CLAUDE_MODELS = {
  CLAUDE_3_5_SONNET: 'claude-3-5-sonnet'
};

/**
 * Send a message to Claude and get a response
 * @param {string} message - User message
 * @returns {Promise<string>} Claude's response
 */
async function askClaude(message) {
  try {
    // Wait for Puter.js to load
    await waitForPuter();

    // Call Claude API
    const response = await window.puter.ai.chat(
      message,
      {
        model: CLAUDE_MODELS.CLAUDE_3_5_SONNET,
        stream: false
      }
    );

    // Extract and return the text content
    if (response && response.message && response.message.content && response.message.content.length > 0) {
      return response.message.content[0].text;
    }
    
    return JSON.stringify(response);
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
  }
}

/**
 * Send a message to Claude with streaming
 * @param {string} message - User message
 * @param {function} onChunk - Callback for each chunk
 * @returns {Promise<string>} Complete response when done
 */
async function askClaudeWithStreaming(message, onChunk) {
  try {
    // Wait for Puter.js to load
    await waitForPuter();
    
    let fullResponse = '';
    
    // Call Claude API with streaming
    const response = await window.puter.ai.chat(
      message,
      {
        model: CLAUDE_MODELS.CLAUDE_3_5_SONNET,
        stream: true
      }
    );
    
    // Process the streaming response
    for await (const part of response) {
      if (part && part.text) {
        fullResponse += part.text;
        if (onChunk && typeof onChunk === 'function') {
          onChunk(part.text, fullResponse);
        }
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Error calling Claude with streaming:', error);
    throw error;
  }
}

/**
 * Wait for Puter.js to load and initialize
 * @returns {Promise<void>}
 */
function waitForPuter() {
  return new Promise((resolve, reject) => {
    // If Puter is already loaded
    if (typeof window.puter !== 'undefined' && 
        window.puter && 
        window.puter.ai && 
        typeof window.puter.ai.chat === 'function') {
      resolve();
      return;
    }
    
    // If script is already in the document, wait for it
    if (document.querySelector('script[src*="puter.com"]')) {
      const interval = setInterval(() => {
        if (typeof window.puter !== 'undefined' && 
            window.puter && 
            window.puter.ai && 
            typeof window.puter.ai.chat === 'function') {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Timeout waiting for Puter.js to load'));
      }, 10000);
      
      return;
    }
    
    // Load the script
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    
    script.onload = () => {
      const interval = setInterval(() => {
        if (typeof window.puter !== 'undefined' && 
            window.puter && 
            window.puter.ai && 
            typeof window.puter.ai.chat === 'function') {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Timeout waiting for Puter.js API to initialize'));
      }, 5000);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Puter.js script'));
    };
    
    document.head.appendChild(script);
  });
}

// Example usage in browser:
/*
// Simple usage
askClaude('Hello, how are you?')
  .then(response => console.log('Claude says:', response))
  .catch(error => console.error('Error:', error));

// Streaming usage
askClaudeWithStreaming('Tell me about quantum computing', 
  (chunk, fullResponse) => {
    console.log('New chunk:', chunk);
    // Update UI with fullResponse
  })
  .then(fullResponse => console.log('Complete response:', fullResponse))
  .catch(error => console.error('Error:', error));
*/

// Export for use in other files
export { askClaude, askClaudeWithStreaming, waitForPuter }; 