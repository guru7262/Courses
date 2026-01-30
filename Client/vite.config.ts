import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 'all' is safer for testing so you don't have to update it if the URL changes
    allowedHosts: true, 
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    // ADD THIS BLOCK: This ensures the frontend doesn't break when trying to connect back to your PC
    hmr: {
      clientPort: 443,
    },
  }
})