import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';

export const useUserStore = defineStore('user', () => {
  // --- 状态 ---
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const role = ref(localStorage.getItem('role') || 'customer'); 
  const userProfile = ref(null); 
  const isLoggedIn = ref(!!token.value);
  // 🟢 使用 ref 跟踪初始化状态，并确保默认值为 false
  const isInitialized = ref(false); 
  const showLoginModal = ref(false); 

  // --- Actions ---

  const fetchUserProfile = async () => {
    // 🟢 增加检查，如果 token 为空，直接返回 null 或抛出错误，避免无效请求
    if (!token.value) {
        console.warn("[UserStore] No token found, cannot fetch user profile.");
        // 清理可能残留的状态
        await logout(false); // 调用 logout 清理，但不重定向
        return null; // 返回 null 表示获取失败
    }
    console.log("[UserStore] Attempting to fetch user profile...");
    try {
      const response = await api.get('/user');
      const profile = response.data?.data; 
      
      if (profile) {
        userProfile.value = profile;
        console.log("[UserStore] User profile fetched:", JSON.stringify(profile)); // Log 内容

        if (profile.username) {
          username.value = profile.username;
          localStorage.setItem('username', profile.username);
        }
        if (profile.role) {
          const lowerCaseRole = profile.role.toLowerCase();
          // 🟢 只有在角色实际改变时才更新 localStorage
          if (role.value !== lowerCaseRole) {
            role.value = lowerCaseRole;
            localStorage.setItem('role', lowerCaseRole);
            console.log("[UserStore] Updated role from profile:", lowerCaseRole);
          }
        }
        isLoggedIn.value = true; // 确认已登录
        return profile; // 返回获取到的 profile
      } else {
         console.warn("[UserStore] Fetched profile data is null or undefined.");
         await logout(false); // 获取失败也清理状态
         return null;
      }

    } catch (error) {
      console.error("[UserStore] 获取用户资料失败:", error.response?.data || error.message);
      await logout(false); // 获取失败清理状态
      return null; // 返回 null 表示获取失败
      // throw error; // 或者重新抛出错误
    }
  };
  
  const updateUserProfile = async (profileData) => {
    if (!isLoggedIn.value) return { success: false, message: "Not logged in." };
    try {
      await api.put('/user/profile', profileData);
      await fetchUserProfile(); // 更新后重新获取
      return { success: true };
    } catch (error) {
      console.error("[UserStore] 更新用户资料失败:", error);
      const message = error.response?.data?.message || "Update failed.";
      return { success: false, message: message };
    }
  };

  // 🟢 添加一个可选参数，决定是否在登出后重定向
  const logout = async (shouldRedirect = true) => { 
    console.log("[UserStore] Logging out...");
    token.value = '';
    username.value = '';
    role.value = 'customer'; 
    userProfile.value = null; 
    isLoggedIn.value = false;
    isInitialized.value = false; // 重置初始化，下次需要重新初始化
    localStorage.clear();
    // 注意：不需要手动删除 api.defaults.headers.common['Authorization']
    // 因为拦截器会自动检查 localStorage，如果 token 不存在就不会添加 Authorization header
    console.log("[UserStore] Logout complete.");
    // 🟢 根据参数决定是否跳转
    // if (shouldRedirect && router) { // 确保 router 实例可用
    //   router.push('/'); 
    // }
  };
  
  const login = async (usernameInput, password) => {
    try {
      const response = await api.post('/auth/login', {
        username: usernameInput,
        password: password
      });

      console.log('[Login Debug] Full response:', response);
      console.log('[Login Debug] Response headers:', response.headers);
      console.log('[Login Debug] Response data:', response.data);
      console.log('[Login Debug] Checking for token in multiple locations...');

      // 🔧 从多个位置提取 token
      const receivedToken =
        response.headers?.['x-new-token'] ||
        response.headers?.['X-New-Token'] ||
        response.headers?.['X-NEW-TOKEN'] ||
        response.data?.data?.token ||
        response.data?.token;

      console.log('[Login Debug] Extracted token:', receivedToken ? 'Found' : 'Not found');

      if (!receivedToken) {
          console.error('[Login Debug] Token not found in:', {
            headers: response.headers,
            data: response.data
          });
          throw new Error('Login response did not contain a token.');
      }
      
      token.value = receivedToken;
      localStorage.setItem('token', receivedToken);
      // 注意：不需要手动设置 api.defaults.headers.common['Authorization']
      // 因为 api.js 的拦截器会自动从 localStorage 读取 token 并添加到请求头
      console.log("[UserStore] Login successful, token set.");

      // 登录成功后，获取 profile 并更新状态
      const profile = await fetchUserProfile(); 
      if (!profile) {
        // 如果 fetchUserProfile 失败 (返回 null), 登录也算失败
        throw new Error("Failed to fetch user profile after login.");
      }
      isInitialized.value = true; // 登录成功也意味着初始化完成
      return { success: true };
    } catch (error) {
      console.error('API 登录失败:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      await logout(false); // 登录失败清理状态，不重定向
      return { success: false, message: errorMessage };
    }
  };
  
  // 初始化函数
  const initialize = async () => {
    // 🟢 改进初始化逻辑，确保只执行一次，并正确处理 token
    if (isInitialized.value) return;
    console.log("[UserStore] Initializing...");

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
      // 注意：不需要手动设置 api.defaults.headers.common['Authorization']
      // 因为 api.js 的拦截器会自动从 localStorage 读取 token 并添加到请求头
      console.log("[UserStore] Found token in localStorage, attempting to fetch profile.");
      // 尝试获取 profile 来验证 token 并设置登录状态
      await fetchUserProfile(); // fetchUserProfile 内部会设置 isLoggedIn
    } else {
        console.log("[UserStore] No token found in localStorage.");
        // 确保未登录状态被正确设置
        await logout(false); 
    }
    isInitialized.value = true; // 标记初始化完成
    console.log("[UserStore] Initialization complete. isLoggedIn:", isLoggedIn.value, "Role:", role.value);
  };

  return {
    token, 
    username, 
    role, 
    userProfile, 
    isLoggedIn, 
    isInitialized, 
    showLoginModal, 
    
    login, 
    logout, 
    initialize, 
    updateUserProfile,
    fetchUserProfile 
  };
});

