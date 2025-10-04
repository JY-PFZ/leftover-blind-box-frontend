// src/stores/user.js

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '@/services/axiosConfig';

// --- MOCK DATA CONTROL ---
// 设置为 true 来强制使用模拟数据，非常适合UI开发和测试
const USE_MOCK_DATA = ref(true);

// MOCK USER PROFILE
// 当后端没有数据时，我们将使用这份模拟数据
const mockUserProfile = {
  id: 1,
  username: "pfz2@gmail.com",
  role: "USER",
  phone: "13800138000",
  nickname: "testuser",
  avatar: "https://example.com/avatar.jpg", // 你可以换成一个真实的图片URL
  status: 1
};

export const useUserStore = defineStore('user', () => {
  // --- STATE ---
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const realUserProfile = ref(null);

  // --- GETTERS ---
  // **核心改动**: 这个计算属性现在会智能地返回数据
  // 1. 如果有真实数据，则返回真实数据
  // 2. 如果没有真实数据且开启了模拟开关，则返回模拟数据
  const userProfile = computed(() => {
    if (realUserProfile.value) {
      return realUserProfile.value;
    }
    if (USE_MOCK_DATA.value) {
      return mockUserProfile;
    }
    return null;
  });
  
  const isLoggedIn = computed(() => !!token.value);

  // --- ACTIONS ---
  const setToken = (newToken) => {
    // ... (此函数无需改动)
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  // **核心改动**: 更新了 fetchUserProfile 逻辑
  const fetchUserProfile = async () => {
    if (!isLoggedIn.value) return;

    // 如果开启了模拟数据，直接加载并返回
    if (USE_MOCK_DATA.value) {
      console.log("Using Mock User Profile Data");
      realUserProfile.value = mockUserProfile;
      return;
    }

    try {
      const response = await apiClient.get('/user/profile');
      if (response.data && response.data.data) {
        realUserProfile.value = response.data.data;
      } else {
        // 如果后端返回空，为了开发方便，我们也可以选择加载模拟数据
        console.warn('User profile not found, falling back to mock data for development.');
        realUserProfile.value = mockUserProfile;
      }
    } catch (error) {
      console.error('Failed to fetch user profile, falling back to mock data:', error);
      realUserProfile.value = mockUserProfile; // API请求失败时也使用模拟数据
    }
  };

  const updateUserProfile = async (profileData) => {
    // ... (此函数无需改动)
    try {
      await apiClient.put('/user/profile', profileData);
      realUserProfile.value = { ...realUserProfile.value, ...profileData };
      return { success: true };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      const message = error.response?.data?.message || 'Update failed. Please try again.';
      return { success: false, message };
    }
  };

  const login = async (usernameInput, password) => {
    // ... (此函数无需改动)
    try {
      const response = await apiClient.post('/auth/login', { username: usernameInput, password: password });
      const userToken = response.data?.data?.token;
      if (userToken) {
        setToken(userToken);
        username.value = usernameInput;
        localStorage.setItem('username', usernameInput);
        await fetchUserProfile();
        return { success: true };
      } else {
        throw new Error("Login successful, but no token was received.");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    // ... (此函数无需改动)
    setToken('');
    username.value = '';
    realUserProfile.value = null;
    localStorage.removeItem('username');
  };

  const initializeUser = async () => {
    // ... (此函数无需改动)
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      username.value = localStorage.getItem('username') || '';
      await fetchUserProfile();
    }
  };

  return {
    token, username, userProfile, isLoggedIn, login, logout, updateUserProfile, initializeUser, fetchUserProfile,
  };
});