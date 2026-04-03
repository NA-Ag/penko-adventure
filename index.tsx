
// Force WASM backend for Transformers.js and ONNX Runtime
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.ORT_BACKEND = 'wasm';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './src/i18n/config'; // Initialize i18next

// ServiceWorker with Virtual File System support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use import.meta.env.BASE_URL to get the correct base path
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swPath).then(
      (registration) => {
        console.log('[Penko] ServiceWorker registered successfully at:', swPath);
        console.log('[Penko] Virtual file system enabled at /local-model/*');
      },
      (err) => {
        console.error('[Penko] ServiceWorker registration failed:', err);
      }
    );
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);
