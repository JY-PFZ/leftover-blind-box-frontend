import axios from 'axios';
import { useUserStore } from '../stores/user';

// 创建一个 Axios 的实例，我们可以对它进行单独的配置
const apiClient = axios.create({
  // baseURL: '/api' // 你可以根据需要设置基础URL
});

// 添加一个请求拦截器 (Request Interceptor)
// 它会在你的每一个请求被发送出去之前执行
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token;
    if (token) {
      // 在请求头中添加 Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 新增：添加一个响应拦截器 (Response Interceptor)
// 它会在你的每一个响应成功返回之后执行
apiClient.interceptors.response.use(
  (response) => {
    // 检查响应头中是否有新的 token
    const newToken = response.headers['x-new-token'];
    
    if (newToken) {
      console.log("收到了新的 Token，正在更新...");
      const userStore = useUserStore();
      // 调用 user store 中的方法来更新 token
      userStore.updateToken(newToken);
    }
    
    // 返回原始响应，让业务代码继续处理
    return response;
  },
  (error) => {
    // 对响应错误做些什么
    // 例如，如果收到 401 Unauthorized 错误，可以自动登出
    if (error.response && error.response.status === 401) {
      console.log("Token 无效或已过期，自动登出。");
      const userStore = useUserStore();
      userStore.logout();
    }
    return Promise.reject(error);
  }
);


export default apiClient;

