# Claude 3.7 Sonnet Chat UI

A modern, visually stunning chat interface for interacting with Claude 3.7 Sonnet, Anthropic's most advanced AI assistant. This application uses the Puter.js API to provide real-time communication with Claude.

## Features

- Beautiful, responsive UI with animations and transitions
- Dark mode support
- Real-time streaming responses from Claude 3.7 Sonnet
- Markdown rendering for rich text responses
- Code syntax highlighting
- Message history
- Custom UI elements for an engaging chat experience

## Integration with Claude

This application uses [Puter.js](https://docs.puter.com/AI/chat/) to communicate directly with Claude 3.7 Sonnet. The integration:

- Sends user messages directly to Claude through the Puter API
- Streams responses in real-time with a typing indicator
- Supports markdown and code formatting
- Maintains the conversation context for natural discussions

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Usage

Simply type your message in the input box and press Enter or click the Send button. Claude 3.7 Sonnet will respond in real-time with a typing animation as the response streams in.

The application automatically formats code blocks, lists, and other markdown elements for better readability.

## Credits

This application uses the Puter.js library to connect with Claude 3.7 Sonnet. The UI is built with React, styled-components, and Framer Motion for animations.

## Note

Please be aware that this is a UI demonstration. For production use, you should implement proper API key management, user authentication, and other security measures. 