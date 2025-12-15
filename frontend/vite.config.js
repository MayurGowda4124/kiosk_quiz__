import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  // Load env file from root directory (parent of frontend) for local development
  // In Vercel, environment variables are set in the dashboard and Vite picks them up automatically
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    }
    // Don't use define - let Vite handle environment variables automatically
    // Vite automatically exposes VITE_* variables and PROD/DEV/MODE
  }
})

