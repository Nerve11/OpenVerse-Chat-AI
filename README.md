# Claude 3.7 Sonnet Chat Interface

This application provides a reliable web interface for accessing Anthropic's powerful Claude 3.7 Sonnet AI assistant. This application uses the Puter.js API to provide real-time communication with Claude.

## Features

- **Direct Claude 3.7 Sonnet Access**: Chat directly with Claude 3.7 Sonnet without requiring an API key
- **Streaming Responses**: See Claude's responses appear in real-time as they're generated
- **Robust API Integration**: Multiple fallback mechanisms ensure consistent access to Claude
- **Responsive Design**: Works on desktop and mobile devices
- **Debugging Tools**: Built-in diagnostic features to help troubleshoot connection issues
- **Enhanced Reliability**: Automatically recovers from temporary API issues

## How It Works

This application uses [Puter.js](https://docs.puter.com/AI/chat/) to communicate directly with Claude 3.7 Sonnet. The integration:

- Sends user messages directly to Claude through the Puter API
- Handles streaming of responses back to the user interface
- Implements multiple fallback mechanisms if the primary connection fails
- Provides debugging tools to diagnose and fix connection issues

## Troubleshooting

If you encounter issues with Claude 3.7 access, try these steps:

1. **Click the Debug button** in the bottom right corner to activate diagnostic mode
2. Check the browser console (F12) for diagnostic information
3. Verify that `https://js.puter.com/v2/` is accessible from your network
4. Try refreshing the page or clearing your browser cache
5. If issues persist, the application will automatically try alternative connection methods

## Adding URL Parameters

You can add the following parameters to the URL:

- `?debug=true` - Activates debug mode on startup
- `?model=claude-3-sonnet-20240229` - Explicitly set the model to use

## Development

This application uses React and modern web technologies for a responsive, efficient user experience.

### Key Files

- `src/utils/puterApi.js` - Core implementation of Claude API integration
- `src/utils/fallbackApi.js` - Fallback mechanisms for reliable access
- `src/utils/debugUtils.js` - Debugging and diagnostic tools
- `src/App.js` - Main application component

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Credits

- UI Design by Chronix
- Backend access via Puter.js API

## Ready to receive feedback in telegram - @Trivialsion
