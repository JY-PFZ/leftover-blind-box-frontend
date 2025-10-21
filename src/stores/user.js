import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';

// --- 辅助函数 ---
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

export const useUserStore = defineStore('user', () => {
  // --- 状态 ---
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const role = ref(localStorage.getItem('role') || 'customer');
  const userLocation = ref(null);
  const userProfile = ref(null); // **新增**: 用于存储完整的用户资料
  const isLoggedIn = ref(!!token.value);
  
  let isInitialized = false;

  // --- Actions ---

  // **新增**: 从后端获取完整的用户个人资料
  const fetchUserProfile = async () => {
    if (!isLoggedIn.value) return; // 如果未登录，则不执行
    try {
      // 调用 GET /api/user 接口
      const response = await api.get('/user');
      const profile = response.data.data;
      userProfile.value = profile;

      // 从获取到的真实数据中更新 username 和 role，确保数据同步
      if (profile && profile.username) {
        username.value = profile.username;
        localStorage.setItem('username', profile.username);
      }
      if (profile && profile.role) {
        role.value = profile.role.toLowerCase();
        localStorage.setItem('role', role.value);
      }

    } catch (error) {
      console.error("[UserStore] 获取用户资料失败:", error);
      // 如果获取失败（例如 Token 过期），则执行登出
      logout();
    }
  };
  
  // **新增**: 更新用户个人资料
  const updateUserProfile = async (profileData) => {
    try {
      // 调用 PUT /api/user/profile 接口
      await api.put('/user/profile', profileData);
      // 更新成功后，重新获取最新的个人资料
      await fetchUserProfile();
      return { success: true };
    } catch (error) {
      console.error("[UserStore] 更新用户资料失败:", error);
      const message = error.response?.data?.message || "Update failed.";
      return { success: false, message: message };
    }
  };

  const logout = () => {
    token.value = '';
    username.value = '';
    role.value = 'customer';
    userProfile.value = null; // 登出时清空用户资料
    isLoggedIn.value = false;
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
  };
  
  const login = async (usernameInput, password) => {
    try {
      const response = await api.post('/auth/login', {
        username: usernameInput,
        password: password
      });

      const receivedToken = response.headers['x-new-token'];
      if (!receivedToken) throw new Error('Login response did not contain a token.');
      
      token.value = receivedToken;
      localStorage.setItem('token', receivedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      isLoggedIn.value = true;

      // **修改**: 登录成功后，调用 fetchUserProfile 来获取真实的角色和信息
      await fetchUserProfile();

      return { success: true };
    } catch (error) {
      console.error('API 登录失败:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      logout();
      return { success: false, message: errorMessage };
    }
  };
  
  const fetchUserLocation = async () => {
    try {
      const position = await getUserLocation();
      userLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error('[UserStore] Failed to get user location:', error.message);
      userLocation.value = { latitude: 1.2966, longitude: 103.7764 }; // 默认位置
    }
  };
  
  const initialize = async () => {
    if (isInitialized) return;
    isInitialized = true;

    await fetchUserLocation(); 

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      isLoggedIn.value = true;
      // **修改**: 应用启动时，也调用 fetchUserProfile
      await fetchUserProfile();
    }
  };

  return {
    token, username, role, userLocation, userProfile, isLoggedIn,
    login, logout, initialize, fetchUserLocation, updateUserProfile,
  };
});
