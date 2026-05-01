import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient';
import './index.css';
import App from './App.jsx';

// Global error handler for debugging white screen issues
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
  // In production, you might want to send this to an error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

// Log environment info for debugging
console.log('[App] Environment:', {
  mode: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL,
  base: import.meta.env.BASE_URL,
});

// Register Service Worker (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Flag to prevent multiple update prompts
  let updatePromptShown = false;
  
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { type: 'module' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);

        // ✅ Check for updates every 1 hour (not 60 seconds!)
        // This prevents aggressive update checks that cause infinite loops
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hour

        // Listen for new SW waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // ✅ Only show update prompt once per session
              if (!updatePromptShown) {
                updatePromptShown = true;
                
                // ✅ Auto-update silently after 3 seconds (better UX)
                // User can continue working, update happens in background
                console.log('[PWA] New version available, updating in 3 seconds...');
                
                setTimeout(() => {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  
                  // ✅ Listen for controlling SW change, then reload
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    // Only reload if this is a real update, not initial load
                    if (navigator.serviceWorker.controller) {
                      console.log('[PWA] New version activated, reloading...');
                      window.location.reload();
                    }
                  });
                }, 3000);
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
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
      {/* QueryClientProvider must wrap the entire app so all hooks can access it */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
  console.log('[App] React app mounted successfully');
} catch (error) {
  console.error('[App] Failed to mount React app:', error);
  // Show error message to user
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
