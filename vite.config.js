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
        // 🔧 使用云服务器后端地址
        target: 'http://52.77.254.95:10015',
        changeOrigin: true,
        secure: false,
        // 你的后端 Controller 是以 /auth /user /product/... 开头，没有 /api 前缀
        // 因此需要把 "/api" 前缀去掉
        // [NOTE] 保持注释状态。根据你的 API 列表，后端似乎确实需要 /api 前缀。
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // 可选：看见代理日志（排查超好用）
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[proxy] ->', req.method, proxyReq.getHeader('host'), req.url)
          })
          proxy.on('error', (err, req, res) => {
            console.error('[proxy] ❌ Proxy error:', err.message)
            console.error('[proxy] Request URL:', req.url)
            console.error('[proxy] Target:', 'http://52.77.254.95:10015')
            console.error('[proxy] 请检查云服务器后端是否可访问！')
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (proxyRes.statusCode >= 500) {
              console.error('[proxy] ⚠️ Backend returned', proxyRes.statusCode, 'for', req.url)
              console.error('[proxy] 这通常是后端服务器内部错误，请检查后端日志')
            }
          })
        }
      },
    },
  },
})
