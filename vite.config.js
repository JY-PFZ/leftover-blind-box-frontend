import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // 使用远程后端服务（本地后端启动失败）
        target: 'http://54.169.196.90:10015',
        changeOrigin: true,
        // 如果本地后端不可用，可以切换回远程服务器
        // target: 'http://54.169.196.90:10015',
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
