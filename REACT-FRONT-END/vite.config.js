import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Dev server proxy — routes /api requests to Laravel (local only)
  // In production, VITE_API_URL points directly to the Render API URL
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  build: {
    // Suppress the chunk size warning
    chunkSizeWarningLimit: 1500,
  }
})
