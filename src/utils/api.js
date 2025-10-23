import axios from 'axios';

// 创建一个 axios 实例，用于与后端 API 通信
const api = axios.create({
  // 确保 baseURL 指向你正在运行的后端服务的正确端口
  baseURL: '/api', 
  timeout: 10000, // 请求超时时间
});

// 设置请求拦截器
// 这个拦截器会在每次发送请求前，自动将 localStorage 中存储的 token 添加到请求头中
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    
    // 定义不需要Authorization头的端点白名单
    const AUTH_WHITELIST = ['/auth/login', '/auth/register', '/auth/refresh', '/user/register'];
    const isAuthEndpoint = AUTH_WHITELIST.some(endpoint => config.url?.includes(endpoint));
    
    console.log('🔑 API请求拦截器 - Token状态:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      url: config.url,
      method: config.method,
      isAuthEndpoint: isAuthEndpoint
    });
    
    // 只有非认证端点才添加Authorization头
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ 已添加Authorization头:', `Bearer ${token.substring(0, 20)}...`);
    } else if (isAuthEndpoint) {
      console.log('🔒 认证端点，跳过Authorization头');
    } else {
      console.log('❌ 没有token，无法添加Authorization头');
    }
    
    return config;
  },
  error => {
    console.error('❌ API请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 设置响应拦截器
api.interceptors.response.use(
  response => {
    console.log('✅ API响应成功:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ API响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // 如果是401错误，清除token并重定向到登录页
    if (error.response?.status === 401) {
      console.log('🔓 检测到401错误，清除token并重定向到登录页');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      
      // 触发全局事件，通知其他组件用户已登出
      window.dispatchEvent(new CustomEvent('user-logout'));
      
      // 重定向到登录页
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export { api };
export default api;
