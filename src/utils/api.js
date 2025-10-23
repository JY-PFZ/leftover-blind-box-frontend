import axios from 'axios';

// 创建一个 axios 实例，用于与后端 API 通信
const api = axios.create({
  // 走 Vite 代理，避免跨域与响应头丢失
  baseURL: '/api', 
  timeout: 15000, // 请求超时时间
});

// 设置请求拦截器
// 这个拦截器会在每次发送请求前，自动将 localStorage 中存储的 token 添加到请求头中
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      // 后端通过这个请求头来验证你的登录状态
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export { api };
