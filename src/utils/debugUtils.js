/**
 * Debugging utilities for Claude 3.7 via Puter.js
 * These tools provide diagnostic information and troubleshooting
 */

// Debugging mode flag
let debugMode = false;

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled
 */
export const isDebugMode = () => debugMode;

/**
 * Enable or disable debug mode
 * @param {boolean} enabled - Whether to enable debug mode
 */
export const setDebugMode = (enabled) => {
  debugMode = enabled;
  if (enabled) {
    console.log('Debug mode enabled for Claude 3.7 integration');
  }
};

/**
 * Log a debug message if debug mode is enabled
 * @param {...any} args - Arguments to log
 */
export const debugLog = (...args) => {
  if (debugMode) {
    console.log('[Claude Debug]', ...args);
  }
};

/**
 * Get client environment information for diagnostics
 * @returns {Object} Client environment info
 */
export const getClientInfo = () => {
  const info = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    connection: null,
    puterAvailable: false,
    claude37Available: false,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timestamps: {
      collected: new Date().toISOString()
    }
  };
  
  // Add network connection info if available
  if (navigator.connection) {
    info.connection = {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }
  
  // Check Puter.js availability
  if (typeof window.puter !== 'undefined') {
    info.puterAvailable = true;
    
    // Check methods
    if (window.puter.ai) {
      const methods = [];
      if (typeof window.puter.ai.chat === 'function') methods.push('chat');
      if (typeof window.puter.ai.claudeCompletion === 'function') methods.push('claudeCompletion');
      if (typeof window.puter.ai.completion === 'function') methods.push('completion');
      
      info.puterMethods = methods;
      info.claude37Available = methods.includes('claudeCompletion');
    }
  }
  
  return info;
};

/**
 * Test client connectivity to critical services
 * @returns {Promise<Object>} Connectivity test results
 */
export const testConnectivity = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Helper to test a URL
  const testUrl = async (name, url) => {
    const start = performance.now();
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit'
      });
      const time = performance.now() - start;
      
      results.tests[name] = {
        success: true,
        time: Math.round(time),
        status: response.status
      };
    } catch (error) {
      results.tests[name] = {
        success: false,
        error: error.message,
        time: Math.round(performance.now() - start)
      };
    }
  };
  
  // Test connectivity to critical services
  await Promise.all([
    testUrl('puter', 'https://js.puter.com/v2/'),
    testUrl('google', 'https://www.google.com'),
    testUrl('cloudflare', 'https://1.1.1.1')
  ]);
  
  return results;
};

/**
 * Collect full diagnostic information
 * @returns {Promise<Object>} Complete diagnostic info
 */
export const collectDiagnostics = async () => {
  debugLog('Collecting diagnostics...');
  
  // Start with basic client info
  const diagnostics = {
    clientInfo: getClientInfo(),
    connectivity: await testConnectivity(),
    timestamps: {
      collected: new Date().toISOString()
    }
  };
  
  // Add performance metrics if available
  if (window.performance) {
    try {
      const navEntry = window.performance.getEntriesByType('navigation')[0];
      const perfEntries = {
        navigationTiming: navEntry ? {
          loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.connectStart,
          firstByte: navEntry.responseStart - navEntry.requestStart,
          domInteractive: navEntry.domInteractive - navEntry.fetchStart
        } : null
      };
      
      diagnostics.performance = perfEntries;
    } catch (err) {
      diagnostics.performanceError = err.message;
    }
  }
  
  debugLog('Diagnostics collected', diagnostics);
  return diagnostics;
};

// Initialize debug mode based on URL param or localStorage
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  const debugParam = params.get('debug');
  
  if (debugParam === 'true' || debugParam === '1' || localStorage.getItem('claude_debug_mode') === 'true') {
    setDebugMode(true);
  }
} 