import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getUserLocation } from '@/utils/geoUtils'; 

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
  
  const login = async (usernameInput) => {
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
    return { success: false, message: 'Mock user not found' };
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
    isInitialized, // **步骤 2: 导出标志**
    login,
    logout,
    initialize,
  };
});

