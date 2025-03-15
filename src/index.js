import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Проверка загрузки Puter.js
window.addEventListener('load', () => {
  console.log('Window loaded, checking Puter.js availability');
  if (typeof window.puter !== 'undefined') {
    console.log('Puter.js is loaded successfully!');
    if (window.puter.ai) {
      console.log('Available puter.ai methods:', Object.keys(window.puter.ai));
    } else {
      console.warn('puter.ai is not available');
    }
  } else {
    console.error('Puter.js is not loaded!');
    // Пробуем загрузить его повторно
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 