import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // 🔧 连接到本地后端（用于开发测试）
        target: 'http://localhost:10015', 
        changeOrigin: true,
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
