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
    // 定义不需要认证的接口路径（注册、登录等公开接口）
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/user/register', // 用户注册（customer/merchant/admin）
      '/api/auth/key',
      '/api/auth/activate',
      '/api/payment/verify', // 支付验证接口（Stripe 重定向后调用，可能没有 token）
      '/api/payment/success', // 支付成功页面（公开访问）
      '/api/payment/cancel' // 支付取消页面（公开访问）
    ];
    
    // 如果是公开接口，不添加 Authorization 头
    const isPublicPath = publicPaths.some(path => config.url?.includes(path));
    
    if (!isPublicPath) {
      // 🔧 检查是否已经手动设置了 Authorization header（不区分大小写）
      const hasManualAuth = config.headers && (
        config.headers.Authorization || 
        config.headers.authorization ||
        config.headers['Authorization'] ||
        config.headers['authorization']
      );
      
      if (!hasManualAuth) {
        // 🔧 优先从 sessionStorage 获取 token（用于支付流程），然后从 localStorage 获取
        let token = sessionStorage.getItem('payment_token');
        if (!token) {
          token = localStorage.getItem('token');
        }
        
        if (token) {
          // 确保 token 格式正确（去掉可能的空格）
          const cleanToken = token.trim();
          // 后端通过这个请求头来验证你的登录状态
          config.headers.Authorization = `Bearer ${cleanToken}`;
          console.log('[API Interceptor] Added Authorization header for:', config.url);
        } else {
          console.warn('[API Interceptor] No token found in localStorage or sessionStorage for:', config.url);
        }
      } else {
        console.log('[API Interceptor] Authorization header already set manually, skipping:', config.url);
        // 🔧 确保手动设置的 header 使用正确的大小写
        if (config.headers.authorization && !config.headers.Authorization) {
          config.headers.Authorization = config.headers.authorization;
          delete config.headers.authorization;
        }
      }
    } else {
      // 🔧 对于公开接口，如果已经有 token，也可以选择性地添加（某些接口可能需要）
      // 但对于支付验证接口，我们已经在 PaymentSuccessView 中手动处理了
      console.log('[API Interceptor] Public path, skipping Authorization header:', config.url);
    }
    
    // 🔧 调试：输出最终设置的 headers
    if (config.headers.Authorization || config.headers.authorization) {
      console.log('[API Interceptor] Final Authorization header:', (config.headers.Authorization || config.headers.authorization).substring(0, 30) + '...');
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
      // 🔧 细粒度处理：支付成功页面和支付验证接口不清除 token
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';
      const isPaymentSuccessPage = currentPath.startsWith('/payment/success');
      const isPaymentVerifyApi = requestUrl.includes('/api/payment/verify');
      
      if (!isPaymentSuccessPage && !isPaymentVerifyApi) {
        // 非支付相关页面才清除 token
        console.warn('[API Interceptor] 401 error - clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        // 可以在这里添加跳转到登录页的逻辑
      } else {
        console.warn('[API Interceptor] 401 error on payment page/API - keeping token (Stripe payment was successful)');
      }
    }
    return Promise.reject(error);
  }
);

export { api };
