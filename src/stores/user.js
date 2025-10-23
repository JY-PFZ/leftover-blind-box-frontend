import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';

// --- 辅助函数 ---
function base64UrlDecode(input) {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return atob(padded);
  } catch {
    return '';
  }
}

function decodeJwtPayload(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function extractRoleFromToken(token) {
  const claims = decodeJwtPayload(token);
  if (!claims) return null;
  const normalize = (v) => (typeof v === 'string' ? v.toLowerCase() : v);
  const candidates = [];
  if (claims.role) candidates.push(claims.role);
  if (claims.roles) candidates.push(Array.isArray(claims.roles) ? claims.roles[0] : claims.roles);
  if (claims.authority) candidates.push(claims.authority);
  if (claims.authorities) candidates.push(Array.isArray(claims.authorities) ? claims.authorities[0] : claims.authorities);
  if (claims.scope) candidates.push(Array.isArray(claims.scope) ? claims.scope[0] : claims.scope);
  for (const c of candidates) {
    if (!c) continue;
    const s = String(Array.isArray(c) ? c[0] : c).toLowerCase();
    if (s.startsWith('role_')) return s.replace('role_', '');
    if (['merchant','admin','super_admin','user','customer'].includes(s)) return s;
  }
  return null;
}
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
      // 仅在未授权时登出；其它错误保留登录态，避免误登出影响路由
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
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

      // 同时尝试从响应头与响应体读取 token
      const headerToken = response.headers && (response.headers['x-new-token'] || response.headers['X-New-Token']);
      const bodyToken = response.data && response.data.data && response.data.data.token;
      const receivedToken = headerToken || bodyToken;
      if (!receivedToken) throw new Error('Login response did not contain a token.');
      
      token.value = receivedToken;
      localStorage.setItem('token', receivedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      isLoggedIn.value = true;

      // 可选：从响应体同步用户名与角色
      const bodyUsername = response.data && response.data.data && response.data.data.username;
      const bodyRole = response.data && response.data.data && response.data.data.role;
      if (bodyUsername) {
        username.value = bodyUsername;
        localStorage.setItem('username', bodyUsername);
      }
      if (bodyRole) {
        role.value = (bodyRole || '').toLowerCase();
        localStorage.setItem('role', role.value);
      } else {
        const inferred = extractRoleFromToken(receivedToken);
        if (inferred) {
          role.value = inferred;
          localStorage.setItem('role', inferred);
        }
      }

      // 登录成功后，获取个人资料
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
      // 尝试从 JWT 推断角色，优先于后端资料
      const inferred = extractRoleFromToken(savedToken);
      if (inferred) {
        role.value = inferred;
        localStorage.setItem('role', inferred);
      }
      // **修改**: 应用启动时，也调用 fetchUserProfile
      await fetchUserProfile();
    }
  };

  return {
    token, username, role, userLocation, userProfile, isLoggedIn,
    login, logout, initialize, fetchUserLocation, updateUserProfile,
  };
});
