import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getUserLocation } from '@/utils/geoUtils';
import { api } from '@/utils/api';
import JSEncrypt from 'jsencrypt';

const mockUserDatabase = {
  'customer@test.com': {
    username: 'customer@test.com',
    role: 'customer', 
  },
  'merchant@shop.com': {
    username: 'merchant@shop.com',
    role: 'merchant',
  },
};

export const useUserStore = defineStore('user', () => {
  const token = ref('');
  const username = ref('');
  const role = ref('customer');
  const userLocation = ref(null);
  const isLoggedIn = ref(false);
  const isInitialized = ref(false); // **步骤 1: 添加初始化标志**

  const logout = () => {
    token.value = '';
    username.value = '';
    role.value = 'customer';
    isLoggedIn.value = false;
    userLocation.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  };
  
  const login = async (usernameInput, password) => {
    try {
      // 1. 获取RSA公钥
      const keyResponse = await api.get('/auth/key');
      const publicKey = keyResponse.data?.data || keyResponse.data;
      
      // 2. 加密密码
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      const encryptedPassword = encrypt.encrypt(password);
      
      // 3. 发送登录请求
      const loginResponse = await api.post('/auth/login', {
        username: usernameInput,
        password: encryptedPassword
      });
      
      if (loginResponse.data?.success || loginResponse.data?.code === 200) {
        const userData = loginResponse.data?.data || loginResponse.data;
        token.value = userData.token || userData.accessToken || 'backend-token-' + Date.now();
        username.value = userData.username || usernameInput;
        role.value = userData.role || 'customer';
        isLoggedIn.value = true;
        
        // 保存到localStorage
        localStorage.setItem('token', token.value);
        localStorage.setItem('username', username.value);
        localStorage.setItem('role', role.value);
        
        return { success: true, data: userData };
      } else {
        throw new Error(loginResponse.data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Backend login failed, falling back to mock:', error);
      
      // 后端登录失败，回退到mock登录
      const mockUser = mockUserDatabase[usernameInput];
      if (mockUser) {
        token.value = 'mock-token-' + Date.now();
        username.value = mockUser.username;
        role.value = mockUser.role;
        isLoggedIn.value = true;
        localStorage.setItem('token', token.value);
        localStorage.setItem('username', username.value);
        localStorage.setItem('role', role.value);
        return { success: true };
      }
      
      return { success: false, message: error.message || 'Login failed' };
    }
  };
  
  const register = async (usernameInput, password, email) => {
    try {
      // 1. 获取RSA公钥
      const keyResponse = await api.get('/auth/key');
      const publicKey = keyResponse.data?.data || keyResponse.data;
      
      // 2. 加密密码
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      const encryptedPassword = encrypt.encrypt(password);
      
      // 3. 发送注册请求
      const registerResponse = await api.post('/auth/register', {
        username: usernameInput,
        password: encryptedPassword,
        email: email
      });
      
      if (registerResponse.data?.success || registerResponse.data?.code === 200) {
        return { success: true, message: 'Registration successful' };
      } else {
        throw new Error(registerResponse.data?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Backend registration failed:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const fetchUserLocation = async () => {
    try {
        const location = await getUserLocation();
        userLocation.value = location;
    } catch (error) {
        console.error('获取用户位置失败，使用默认值。', error);
        userLocation.value = { latitude: 1.2966, longitude: 103.7764 };
    }
  };
  
  const initialize = async () => {
    // 防止重复初始化
    if (isInitialized.value) return;

    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');

    if (savedToken && savedUsername && savedRole) {
      token.value = savedToken;
      username.value = savedUsername;
      role.value = savedRole;
      isLoggedIn.value = true;
      await fetchUserLocation();
    }
    // 无论是否恢复成功，都标记为已初始化
    isInitialized.value = true; 
  };

  return {
    token,
    username,
    role,
    isLoggedIn,
    userLocation,
    isInitialized,
    login,
    register,
    logout,
    initialize,
  };
});

