import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register PWA Service Worker for Mobile installation & offline support
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      // Relative registration for GitHub Pages subpath compatibility
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL })
        .then((reg) => {
          console.log('Mr. DODO Offline Service Worker ready:', reg.scope);
        })
        .catch((err) => {
          console.warn('SW registration note:', err);
        });
    });
  } else {
    // In development mode: unregister any stale service workers and clear caches immediately
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if (typeof caches !== 'undefined') {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
