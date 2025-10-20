// src/utils/api.js
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true, // 如果后端用 cookie，会自动带上
})

// 请求拦截器：自动添加JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try { 
        // 动态导入避免循环依赖
        import('@/stores/user').then(({ useUserStore }) => {
          const userStore = useUserStore();
          userStore.logout();
          // 可以在这里添加重定向到登录页的逻辑
          window.location.href = '/';
        });
      } catch (e) {
        console.error('Logout failed:', e);
      }
    }
    return Promise.reject(err);
  }
);
