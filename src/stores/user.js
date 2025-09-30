import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
// 恢复使用我们配置好的 apiClient，让代码更优雅
import apiClient from '../services/axiosConfig'; 

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const userProfile = ref(null);
  const isLoggedIn = computed(() => !!token.value);

  const updateToken = (newToken) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const fetchUserProfile = async () => {
    if (!token.value) return;
    try {
      // 恢复使用 apiClient 发起请求
      const response = await apiClient.get('/api/user');
      if (response.data?.data?.records?.length > 0) {
        userProfile.value = response.data.data.records[0];
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const login = async (usernameInput, password) => {
    try {
      // 恢复使用 apiClient 发起请求，它会自动通过 Vite 代理
      // 发送的是明文密码，因为后端现在接收明文
      const response = await apiClient.post('/api/auth/login', {
        username: usernameInput,
        password: password
      });

      const userToken = response.headers['x-new-token'];
      if (userToken) {
        updateToken(userToken);
        username.value = usernameInput;
        localStorage.setItem('username', usernameInput);
        
        await fetchUserProfile();
        return { success: true };
      } else {
        throw new Error("登录成功，但未收到 Token。");
      }
    } catch (error) {
      console.error("登录请求失败，原始错误:", error);
      const message = error.response?.data?.message || '登录失败，请检查网络或服务器状态';
      return { success: false, message };
    }
  };

  const logout = () => {
    token.value = '';
    username.value = '';
    userProfile.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  const initializeUser = async () => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      token.value = savedToken;
      username.value = savedUsername;
      await fetchUserProfile();
    }
  };

  return {
    token, username, userProfile, isLoggedIn,
    login, logout, initializeUser, updateToken
  };
});

