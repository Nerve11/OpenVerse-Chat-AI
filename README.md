# OpenVerse Chat AI

A modern, feature-rich chat interface designed to interact with a variety of powerful AI models through the Puter.js platform. This application provides a seamless and dynamic user experience for chatting with AI, configuring model behavior, and even executing code snippets directly within the interface.

## ✨ Key Features

- **Multi-Model Support**: Seamlessly switch between various AI models, including Claude, GPT, Llama, Gemini, and more.
- **Real-time Streaming**: Receive AI responses in real-time with streaming support.
- **Customizable System Prompts**: Define the AI's behavior, role, or style by setting custom system prompts.
- **Adjustable Temperature**: Fine-tune the creativity and randomness of the AI's responses with a temperature slider.
- **User Authentication**: Securely sign in and manage your session using Puter.js authentication.
- **Markdown & Code Highlighting**: Renders Markdown responses beautifully with syntax highlighting for code blocks.
- **Test & Debug Modes**: Includes a test mode for UI testing without API calls and a debug mode for diagnostics.
- **Responsive Design**: A clean and responsive user interface that works across different devices.

## 🛠️ Technologies Used

- **Frontend**: React.js
- **Styling**: styled-components, Framer Motion for animations.
- **API Integration**: Puter.js (for AI model access and authentication)
- **Markdown Rendering**: `react-markdown`
- **Syntax Highlighting**: `react-syntax-highlighter`

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have Node.js and npm installed on your system.
- [Node.js](https://nodejs.org/) (which includes npm)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nerve11/OpenVerse-Chat-AI.git
    cd OpenVerse-Chat-AI-main
    ```

2.  **Run the setup script:**
    The project includes a setup script that installs dependencies and creates necessary configuration files.
    ```bash
    node setup.js
    ```
    This command will install all required `npm` packages and automatically start the development server.

3.  **Manual Installation (Alternative):**
    If you prefer to set up the project manually:
    ```bash
    npm install
    ```

## 📜 Available Scripts

In the project directory, you can run the following commands:

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## ⚙️ Configuration

### How It Works

This application is architected to be "backend-less" from the user's perspective. It uses **Puter.js**, which is loaded via a script tag in `public/index.html`. Puter.js handles user authentication and securely proxies API requests to the various AI models without requiring you to manage API keys in a `.env` file.

### System Prompts

- You can configure a **System Prompt** by clicking the "Системный промпт" button in the UI.
- This allows you to set a persistent instruction or context for the AI model, influencing its personality, response style, and behavior for the entire session.
- The system prompt is saved in your browser's `localStorage`.

## Acknowledgements
This project was created to demonstrate a powerful and flexible chat UI using modern web technologies and the Puter.js platform.

## Star History
[![Star History Chart](https://api.star-history.com/svg?repos=nerve11/OpenVerse-Chat-AI&type=Date)](https://star-history.com/#nerve11/OpenVerse-Chat-AI&Date)

