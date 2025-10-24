import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // 统一以 /api 开头发起请求
      '/api': {
        target: 'http://13.215.158.65:10016',   // Gateway
        changeOrigin: true,
        secure: false,
        // Gateway 配置的路由是 /api/product、/api/auth、/api/user 等
        // 保留 /api 前缀，直接转发到后端
        // rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[proxy] ->', req.method, proxyReq.getHeader('host'), req.url)
          })
        }
      },
    },
  },
})
