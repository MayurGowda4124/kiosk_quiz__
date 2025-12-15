import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Check environment variables before rendering
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Get root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
} else if (!supabaseUrl || !supabaseKey) {
  // Show error message if env vars are missing
  rootElement.innerHTML = `
    <div style="padding: 40px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #FF6600; font-size: 2em;">⚠️ Configuration Error</h1>
      <p style="font-size: 1.2em; color: #333;">Environment variables are missing!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>VITE_SUPABASE_URL:</strong> ${supabaseUrl || '❌ NOT SET'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> ${supabaseKey ? '✅ SET' : '❌ NOT SET'}</p>
      </div>
      <h2>How to fix:</h2>
      <ol style="line-height: 1.8;">
        <li><strong>For Local Development:</strong> Create a <code>.env</code> file in the <code>frontend/</code> directory with:
          <pre style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px; overflow-x: auto;">VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
VITE_ADMIN_PASSWORD=UPI_ADMIN_2024</pre>
        </li>
        <li>Restart the dev server after creating/updating the <code>.env</code> file</li>
        <li><strong>For Production:</strong> Set environment variables in Vercel Dashboard → Settings → Environment Variables</li>
        <li>Check browser console (F12) for more details</li>
      </ol>
    </div>
  `
} else {
  // Render the app
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #FF0000; font-size: 2em;">❌ Application Error</h1>
        <p style="font-size: 1.2em; color: #333;">Failed to initialize the application.</p>
        <p style="color: #666;">Check browser console (F12) for details.</p>
        <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow: auto;">${error.toString()}</pre>
      </div>
    `
  }
}

