import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress Monaco Editor ResizeObserver loop errors in webpack dev server
window.addEventListener('error', e => {
  if (e.message && (e.message.includes('ResizeObserver') || e.message.includes('Resize observer'))) {
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);