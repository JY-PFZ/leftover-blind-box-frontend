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
      // Product 服务直连（因为 Gateway 没有配置 product 路由）
      '/api/product': {
        target: 'http://13.215.158.65:10019',   // Product 服务直连
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[proxy product] ->', req.method, proxyReq.getHeader('host'), req.url)
          })
        }
      },
      // 其他服务通过 Gateway
      '/api': {
        target: 'http://13.215.158.65:10016',   // Gateway
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[proxy gateway] ->', req.method, proxyReq.getHeader('host'), req.url)
          })
        }
      },
    },
  },
})
