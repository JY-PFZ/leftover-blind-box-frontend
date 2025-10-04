import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // 所有以 /api 开头的请求都会被代理到你的本地后端服务
      '/api': {
        target: 'http://localhost:10016', // 保留这个端口以匹配你的后端配置
        changeOrigin: true
        // 如果后端接口实际上没有 /api 前缀，可以取消下面的注释来重写路径
        // rewrite: (path) => path.replace(/^\/api/, ''),
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
