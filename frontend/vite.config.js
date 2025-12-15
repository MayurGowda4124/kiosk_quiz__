import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  // Load env file from root directory (parent of frontend) for local development
  // In Vercel, environment variables are set in the dashboard and Vite picks them up automatically
  // loadEnv will check both frontend/.env and ../.env
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const localEnv = loadEnv(mode, __dirname, '')
  
  // Merge: local env takes precedence, then root env, then process.env
  const env = {
    ...rootEnv,
    ...localEnv,
    ...process.env
  }
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    },
    // Expose environment variables
    // In production (Vercel), process.env will have the values from dashboard
    // In development, loadEnv will get them from .env files
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL || 'http://localhost:5000'),
      'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD || 'UPI_ADMIN_2024'),
    }
  }
})

