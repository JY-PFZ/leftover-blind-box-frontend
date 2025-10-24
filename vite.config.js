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
      // 统一以 /api 开头发起请求，后端 Gateway 需要 /api 前缀
      '/api': {
        target: 'http://13.215.158.65:10016',   // 你的后端网关/微服务入口
        changeOrigin: true,
        secure: false,
        // 保留 /api 前缀，不重写路径
        // 可选：看见代理日志（排查超好用）
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[proxy] ->', req.method, proxyReq.getHeader('host'), req.url)
          })
        }
      },
    },
  },
})
