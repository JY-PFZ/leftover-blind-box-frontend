import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // 临时使用远端后端，避免本地后端未启动导致 500
        target: 'http://54.169.196.90:10015', 
        changeOrigin: true,
        secure: false,
        // (可选) 如果后端API路径不包含/api，可能需要路径重写
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
