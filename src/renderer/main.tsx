import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OverlayApp } from './OverlayApp';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import './i18n/config';

const isOverlay = new URLSearchParams(window.location.search).get('overlay') === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>{isOverlay ? <OverlayApp /> : <App />}</ThemeProvider>
  </React.StrictMode>
);
