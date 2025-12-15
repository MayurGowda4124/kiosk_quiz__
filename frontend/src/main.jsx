import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Check environment variables before rendering
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  document.getElementById('root').innerHTML = `
    <div style="padding: 40px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #FF6600; font-size: 2em;">⚠️ Configuration Error</h1>
      <p style="font-size: 1.2em; color: #333;">Environment variables are missing!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>VITE_SUPABASE_URL:</strong> ${supabaseUrl || '❌ NOT SET'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> ${supabaseKey ? '✅ SET' : '❌ NOT SET'}</p>
      </div>
      <h2>How to fix:</h2>
      <ol style="line-height: 1.8;">
        <li>Ensure <code>.env</code> file exists in the <strong>root directory</strong></li>
        <li>Restart the dev server: <code>npm run dev</code></li>
        <li>Check browser console (F12) for more details</li>
      </ol>
    </div>
  `
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

