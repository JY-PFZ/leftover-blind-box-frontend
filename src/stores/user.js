import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';
// 不再需要 JSEncrypt
// import { JSEncrypt } from 'jsencrypt';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const role = ref(localStorage.getItem('role') || 'customer');
  const isLoggedIn = ref(!!token.value);
  
  let isInitialized = false;
  let initializationPromise = null;

  const fetchUserProfile = async () => {
    if (!token.value) return;
    try {
      const response = await api.get('/user');
      const userProfile = response.data.data;
      if (userProfile && userProfile.username && userProfile.role) {
        username.value = userProfile.username;
        role.value = userProfile.role.toLowerCase();
        localStorage.setItem('username', username.value);
        localStorage.setItem('role', role.value);
      } else {
        console.warn('用户资料响应格式无效或接口不存在。');
      }
    } catch (error) {
      console.error('获取用户资料失败，可能Token已过期:', error);
      logout();
      throw error;
    }
  };

  const login = async (usernameInput, rawPassword) => {
    try {
      // **核心修复：直接发送原始密码**
      const response = await api.post('/auth/login', {
        username: usernameInput,
        password: rawPassword 
      });

      const receivedToken = response.headers['x-new-token']; 
      
      if (!receivedToken || typeof receivedToken !== 'string') {
        throw new Error('登录响应头中未找到有效的 Token。');
      }
      
      token.value = receivedToken;
      localStorage.setItem('token', receivedToken);
      isLoggedIn.value = true;
      
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

      await fetchUserProfile();

      return { success: true };
    } catch (error) {
      console.error('API 登录失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '登录时发生未知错误。';
      logout();
      return { success: false, message: errorMessage };
    }
  };
  
  const logout = () => {
    token.value = '';
    username.value = '';
    role.value = 'customer';
    isLoggedIn.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
  };
  
  const initialize = () => {
    if (!isInitialized) {
      isInitialized = true;
      initializationPromise = (async () => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          token.value = savedToken;
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          isLoggedIn.value = true;
          try {
            await fetchUserProfile();
          } catch (error) { /* Token无效，状态已清理 */ }
        }
      })();
    }
    return initializationPromise;
  };

  return {
    token, username, role, isLoggedIn, isInitialized,
    login, logout, initialize,
  };
});

