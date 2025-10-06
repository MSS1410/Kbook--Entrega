// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // APIs si quieres (opcional, tu axios ya usa 4000)
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      // CLAVE: Proxy de /uploads -> backend 4000
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true }
    }
  }
})
