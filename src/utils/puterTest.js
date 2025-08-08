/**
 * Test utility for Puter.js integration with Claude
 * This file can be used to diagnose problems with the Puter.js API
 */

import { isPuterAvailable, loadPuterScript } from './puterApi';

// Claude model names
const CLAUDE_MODELS = {
  CLAUDE_3_5_SONNET: 'claude-3-5-sonnet'
};

/**
 * Run diagnostics on Puter.js API
 * @returns {Promise<Object>} Test results
 */
export const testPuterApi = async () => {
  console.log('⚙️ Running Puter.js API diagnostics...');
  
  const results = {
    isScriptLoaded: false,
    isApiAvailable: false,
    isClaudeAvailable: false,
    availableMethods: [],
    error: null
  };
  
  try {
    // Test 1: Check if Puter.js script is loaded
    results.isScriptLoaded = typeof window.puter !== 'undefined';
    console.log(`✓ Script loaded: ${results.isScriptLoaded}`);
    
    if (!results.isScriptLoaded) {
      console.log('🔄 Attempting to load Puter.js script...');
      await loadPuterScript();
      results.isScriptLoaded = typeof window.puter !== 'undefined';
      console.log(`✓ Script loaded after attempt: ${results.isScriptLoaded}`);
    }
    
    // Test 2: Check if API is available
    results.isApiAvailable = results.isScriptLoaded && window.puter && window.puter.ai;
    console.log(`✓ API available: ${results.isApiAvailable}`);
    
    if (!results.isApiAvailable) {
      throw new Error('Puter.js API not available');
    }
    
    // Test 3: Check available methods
    if (window.puter.ai) {
      if (typeof window.puter.ai.chat === 'function') results.availableMethods.push('chat');
      if (typeof window.puter.ai.txt2img === 'function') results.availableMethods.push('txt2img');
      if (typeof window.puter.ai.img2txt === 'function') results.availableMethods.push('img2txt');
    }
    console.log(`✓ Available methods: ${results.availableMethods.join(', ')}`);
    
    // Test 4: Check Claude availability
    results.isClaudeAvailable = results.availableMethods.includes('chat');
    console.log(`✓ Claude available: ${results.isClaudeAvailable}`);
    
    if (results.isClaudeAvailable) {
      // Test 5: Basic Claude API test
      try {
        // Send a simple message to Claude without streaming
        const response = await window.puter.ai.chat(
          'Hello, Claude. Respond with a single word: "Working"', 
          true,
          {
            model: CLAUDE_MODELS.CLAUDE_3_5_SONNET,
            stream: false
          }
        );
        
        console.log('✓ Claude API test response:', response);
        if (response && response.message && response.message.content) {
          results.testResponse = response.message.content[0].text;
        } else {
          results.testResponse = JSON.stringify(response);
        }
      } catch (claudeError) {
        console.error('✗ Claude API test failed:', claudeError);
        results.claudeApiError = claudeError.message;
      }
    }
    
    console.log('✅ Puter.js API diagnostics completed successfully');
  } catch (error) {
    console.error('✗ Puter.js API diagnostics failed:', error);
    results.error = error.message;
  }
  
  return results;
};

/**
 * Run a simple test to check if Claude is working
 * @returns {Promise<boolean>} True if working correctly
 */
export const testClaude37Access = async () => {
  if (!isPuterAvailable()) {
    console.error('✗ Puter.js API not available for Claude test');
    return false;
  }
  
  try {
    const response = await window.puter.ai.chat(
      'Respond with just one word: "Working"',
      true,
      {
        model: CLAUDE_MODELS.CLAUDE_3_5_SONNET,
        stream: false
      }
    );
    
    let responseText = '';
    if (response && response.message && response.message.content) {
      responseText = response.message.content[0].text;
    } else {
      responseText = JSON.stringify(response);
    }
    
    const isWorking = responseText && responseText.toLowerCase().includes('working');
    console.log(`Claude test ${isWorking ? 'succeeded' : 'failed'}:`, responseText);
    return isWorking;
  } catch (error) {
    console.error('✗ Claude test failed with error:', error);
    return false;
  }
}; 