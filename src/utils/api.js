import axios from 'axios';

// 创建一个 axios 实例，用于与后端 API 通信
const api = axios.create({
  // 确保 baseURL 指向你正在运行的后端服务的正确端口
  baseURL: 'http://localhost:10015/api', 
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

export { api };
