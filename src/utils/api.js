import axios from 'axios';

// 创建一个 axios 实例，用于与后端 API 通信
const api = axios.create({
  // 🔧 不使用 baseURL，让前端代码手动添加 /api 前缀
  // baseURL: '/api', 
  timeout: 10000, // 请求超时时间
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

// 设置响应拦截器，处理 401 未授权错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 401 未授权，清除 token 并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      // 可以在这里添加跳转到登录页的逻辑
    }
    return Promise.reject(error);
  }
);

export { api };
