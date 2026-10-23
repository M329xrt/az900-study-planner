import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { applyTheme, initialTheme } from '@/hooks/useTheme'

// Apply the saved theme before the first paint so there is no flash.
applyTheme(initialTheme())

// Cache the app shell for offline use. Skipped in development and if the
// browser refuses, so it can never break the app.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)