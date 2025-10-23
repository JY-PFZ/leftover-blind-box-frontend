import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';

const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// **新增**: 检查 token 是否过期
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Token解析失败:', error);
    return true;
  }
};

export const useUserStore = defineStore('user', () => {
  // --- 状态 ---
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const role = ref(localStorage.getItem('role') || 'customer');
  const userLocation = ref(null);
  const userProfile = ref(null); // **新增**: 用于存储完整的用户资料
  // **修改**: 检查 token 是否存在且未过期
  const isLoggedIn = computed(() => {
    return !!token.value && !isTokenExpired(token.value);
  });
  
  // 获取用户ID
  const userId = computed(() => {
    return userProfile.value?.id;
  });
  
  // 使用内部状态跟踪是否已初始化
  const _isInitialized = ref(false);
  
  // 确保用户信息已初始化
  const ensureAuth = async () => {
    console.log('🔄 开始用户信息水合...');
    
    // 1. 从localStorage恢复token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      console.log('✅ 已恢复token:', storedToken.substring(0, 20) + '...');
    }
    
    // 2. 如果有token且用户信息为空，获取用户信息
    if (token.value && !isTokenExpired(token.value) && !userProfile.value) {
      try {
        await fetchUserProfile();
        console.log('✅ 用户信息水合完成:', userProfile.value);
      } catch (error) {
        console.error('❌ 用户信息水合失败:', error);
        // 如果获取失败，清除无效token
        logout();
      }
    }
    
    console.log('✅ Store初始化完成');
  };


  // --- Actions ---

  // **新增**: 从后端获取完整的用户个人资料
  const fetchUserProfile = async () => {
    if (!isLoggedIn.value) return; // 如果未登录，则不执行
    try {
      // 调用 GET /api/user 接口
      const response = await api.get('/user');
      console.log('🔍 /user接口返回数据:', response.data);
      const profile = response.data.data;
      console.log('🔍 解析后的profile:', profile);
      
      // 如果后端返回了用户信息，使用后端数据
      if (profile && profile.id) {
        userProfile.value = profile;
        console.log('✅ 使用后端用户信息:', profile);
      } else {
        // 如果后端没有返回用户信息，从token中解析
        console.log('🔄 后端未返回用户信息，从token中解析...');
        const tokenPayload = JSON.parse(atob(token.value.split('.')[1]));
        console.log('🔍 Token payload:', tokenPayload);
        
        // 从token中构造用户信息
        const mockProfile = {
          id: tokenPayload.userId || tokenPayload.id || 8, // 兜底使用8
          username: tokenPayload.sub || username.value,
          email: tokenPayload.sub,
          role: tokenPayload.roles || role.value
        };
        
        userProfile.value = mockProfile;
        console.log('✅ 使用Token解析的用户信息:', mockProfile);
      }

      // 更新username和role
      if (userProfile.value && userProfile.value.username) {
        username.value = userProfile.value.username;
        localStorage.setItem('username', userProfile.value.username);
      }
      if (userProfile.value && userProfile.value.role) {
        role.value = userProfile.value.role.toLowerCase();
        localStorage.setItem('role', role.value);
      }

    } catch (error) {
      console.error("[UserStore] 获取用户资料失败:", error);
      // 如果获取失败，尝试从token中解析用户信息
      try {
        console.log('🔄 API失败，从token中解析用户信息...');
        const tokenPayload = JSON.parse(atob(token.value.split('.')[1]));
        if (tokenPayload.sub) {
          username.value = tokenPayload.sub;
          localStorage.setItem('username', tokenPayload.sub);
        }
        if (tokenPayload.roles) {
          role.value = tokenPayload.roles.toLowerCase();
          localStorage.setItem('role', role.value);
        }
      } catch (tokenError) {
        console.error("[UserStore] Token解析失败:", tokenError);
        logout();
      }
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

  // **新增**: 检查并处理 token 过期
  const checkTokenValidity = () => {
    if (token.value && isTokenExpired(token.value)) {
      console.log('🔓 Token已过期，自动登出');
      logout();
      return false;
    }
    return true;
  };

  const logout = () => {
    console.log('🔓 执行登出操作');
    token.value = '';
    username.value = '';
    role.value = 'customer';
    userProfile.value = null; // 登出时清空用户资料
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    
    // 触发全局登出事件
    window.dispatchEvent(new CustomEvent('user-logout'));
  };
  
  const login = async (usernameInput, password) => {
    console.log('🔐 开始登录流程...', { username: usernameInput });
    
    // 首先尝试API登录
    try {
      console.log('🔄 尝试API登录...');
      
      const loginPayload = {
        username: usernameInput,
        password: password
      };
      console.log('📤 登录请求体:', loginPayload);
      
      const response = await api.post('/auth/login', loginPayload);

      const receivedToken = response.headers['X-New-Token'] || response.headers['x-new-token'];
      if (!receivedToken) throw new Error('Login response did not contain a token.');
      
      token.value = receivedToken;
      localStorage.setItem('token', receivedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      isLoggedIn.value = true;

      // 登录成功后，调用 fetchUserProfile 来获取真实的角色和信息
      await fetchUserProfile();

      return { success: true, message: 'API登录成功！' };
    } catch (error) {
      console.error('❌ API登录失败:', error);
      let errorMessage = error.response?.data?.message || error.message || '用户名或密码错误';
      
      // 处理账户未激活的情况
      if (errorMessage.includes('User Account Not Activate')) {
        errorMessage = '账户未激活，请检查邮箱中的激活链接，或联系管理员激活账户';
      }
      
      // 不要在这里调用logout()，避免循环
      return { success: false, message: errorMessage };
    }
  };
  
  const register = async (usernameInput, password, email, additionalData = {}) => {
    console.log('📝 开始注册流程...', { username: usernameInput, email });
    
    // 首先尝试API注册
    try {
      const payload = {
        username: (usernameInput || email)?.trim()?.toLowerCase(),
        password: password,
        role: (additionalData?.role || 'CUSTOMER')
      };
      
      console.log('🔄 尝试API注册...', payload);
      const response = await api.post('/user/register', payload);
      
      console.log('✅ API注册成功:', response.data);
      return { success: true, message: 'API注册成功！请登录。' };
    } catch (error) {
      console.error('❌ API注册失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '注册失败';
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
    if (_isInitialized.value) return;
    _isInitialized.value = true;

    await fetchUserLocation(); 

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      // **新增**: 检查 token 是否过期
      if (isTokenExpired(savedToken)) {
        console.log('🔓 启动时发现token已过期，清除并登出');
        logout();
        return;
      }
      
      token.value = savedToken;
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      // **修改**: 应用启动时，也调用 fetchUserProfile
      await fetchUserProfile();
    }
  };

  return {
    token, username, role, userLocation, userProfile, isLoggedIn, userId,
    login, register, logout, initialize, fetchUserLocation, updateUserProfile, checkTokenValidity, ensureAuth,
    // 提供只读 getter，保持在路由守卫中以 userStore.isInitialized 访问
    get isInitialized() { return _isInitialized.value; },
  };
});

