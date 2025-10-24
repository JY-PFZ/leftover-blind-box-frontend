import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // 🔧 连接到微服务后端
        target: 'http://13.215.158.65:10016', 
        changeOrigin: true,
        secure: false,
        // 去掉 /api 前缀，因为后端微服务路径不包含 /api
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 调试日志
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[Proxy] ->', req.method, proxyReq.getHeader('host'), req.url);
          });
        }
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
