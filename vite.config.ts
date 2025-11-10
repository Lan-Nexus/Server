import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const apiPort = process.env.PORT || 8080;

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/renderer', import.meta.url))
    }
  },
  build: {
    outDir: './dist/public'
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
