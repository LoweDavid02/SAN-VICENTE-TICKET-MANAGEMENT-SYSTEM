import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient';
import './index.css';
import App from './App.jsx';

// Global error handler for debugging white screen issues
window.addEventListener('error', (event) => {
  if (import.meta.env.DEV) {
    console.error('[Global Error]', event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) {
    console.error('[Unhandled Promise Rejection]', event.reason);
  }
});

// ✅ FIXED: Disable PWA service worker to prevent infinite update loop
// Service worker will be re-enabled after proper testing
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Unregister any existing service workers to stop the loop
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has <div id="root"></div>');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
} catch (error) {
  if (import.meta.env.DEV) {
    console.error('[App] Failed to mount React app:', error);
  }
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; max-width: 600px; margin: 50px auto;">
      <h1 style="color: #dc2626;">Application Error</h1>
      <p>Failed to load the application. Please try:</p>
      <ul>
        <li>Refreshing the page</li>
        <li>Clearing your browser cache</li>
        <li>Checking your internet connection</li>
      </ul>
      <details style="margin-top: 20px;">
        <summary style="cursor: pointer; color: #2563eb;">Technical Details</summary>
        <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow: auto;">${error.message}\n\n${error.stack}</pre>
      </details>
    </div>
  `;
}
