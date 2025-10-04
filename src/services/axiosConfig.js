import axios from 'axios';

// 创建一个 Axios 实例
const apiClient = axios.create({
  // Vite 代理会将 /api 转发到你的后端地址
  baseURL: '/api', 
  timeout: 10000, // 请求超时时间
});

// 添加一个请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，比如从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      // 让每个请求都携带 token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

export default apiClient;
