import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';

// --- 辅助函数：尝试解码 JWT ---
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null; // Invalid token format
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("[UserStore] Failed to decode JWT:", error);
    return null;
  }
}

// --- 辅助函数：从解码后的 Token 中提取角色 (带超详细日志) ---
function extractRoleFromToken(decodedToken) {
    console.log("-------------------- EXTRACT ROLE START --------------------"); // 🟢
    if (!decodedToken) {
        console.log("[UserStore JWT Decode] Decoded token is null, returning 'customer'.");
        console.log("-------------------- EXTRACT ROLE END ----------------------"); // 🟢
        return 'customer'; // 默认角色
    }

    console.log("[UserStore JWT Decode] Attempting to extract role from:", JSON.stringify(decodedToken));

    // 尝试常见的角色声明字段
    const rolesClaim = decodedToken.roles || decodedToken.authorities || decodedToken.role;
    let rolesArray = [];
    let finalRole = 'customer'; // 🟢 默认值

    console.log("[UserStore JWT Decode] Raw rolesClaim:", rolesClaim, "(type:", typeof rolesClaim + ")");

    if (typeof rolesClaim === 'string') {
        const singleRole = rolesClaim.trim();
        console.log("[UserStore JWT Decode] rolesClaim is single string:", `'${singleRole}'`); // 🟢 加引号看清空格
        // 移除 ROLE_ 前缀并转小写
        const normalizedRole = singleRole.startsWith('ROLE_') ? singleRole.substring(5).toLowerCase() : singleRole.toLowerCase();
        console.log("[UserStore JWT Decode] Normalized single role:", `'${normalizedRole}'`); // 🟢 加引号看清空格

        // 🟢 直接判断这个标准化的角色 (添加详细日志)
        console.log(`[UserStore JWT Decode] Comparing normalizedRole ('${normalizedRole}') with 'merchant'...`);
        if (normalizedRole === 'merchant') {
             console.log("[UserStore JWT Decode] EXACT MATCH found: 'merchant'. Setting finalRole to 'merchant'.");
             finalRole = 'merchant';
        } else {
             console.log(`[UserStore JWT Decode] Comparing normalizedRole ('${normalizedRole}') with 'admin' or 'super_admin'...`);
             if (normalizedRole === 'admin' || normalizedRole === 'super_admin') {
                 console.log("[UserStore JWT Decode] EXACT MATCH found: 'admin'/'super_admin'. Setting finalRole to 'admin'.");
                 finalRole = 'admin';
             } else {
                  console.log(`[UserStore JWT Decode] Comparing normalizedRole ('${normalizedRole}') with 'customer' or 'user'...`);
                  if (normalizedRole === 'customer' || normalizedRole === 'user') {
                      console.log("[UserStore JWT Decode] EXACT MATCH found: 'customer'/'user'. Setting finalRole to 'customer'.");
                      finalRole = 'customer';
                  } else {
                      console.log("[UserStore JWT Decode] Single role string did not match known roles ('merchant', 'admin', 'customer', 'user'). Keeping default 'customer'.");
                      // finalRole 保持 'customer'
                  }
             }
        }
    } 
    else if (Array.isArray(rolesClaim)) {
        rolesArray = rolesClaim.map(r => String(r).trim()); 
         console.log("[UserStore JWT Decode] rolesClaim is array, rolesArray:", rolesArray);
        const normalizedRoles = rolesArray.map(r => r.startsWith('ROLE_') ? r.substring(5).toLowerCase() : r.toLowerCase());
        console.log("[UserStore JWT Decode] Normalized roles for checking:", normalizedRoles);

        console.log("[UserStore JWT Decode] Checking if normalizedRoles includes 'merchant'...");
        if (normalizedRoles.includes('merchant')) {
            console.log("[UserStore JWT Decode] INCLUDES 'merchant'. Setting finalRole to 'merchant'.");
            finalRole = 'merchant';
        } else {
             console.log("[UserStore JWT Decode] Checking if normalizedRoles includes 'admin' or 'super_admin'...");
             if (normalizedRoles.includes('admin') || normalizedRoles.includes('super_admin')) {
                 console.log("[UserStore JWT Decode] INCLUDES 'admin'/'super_admin'. Setting finalRole to 'admin'.");
                 finalRole = 'admin';
             } else {
                  console.log("[UserStore JWT Decode] Checking if normalizedRoles includes 'customer' or 'user'...");
                  if (normalizedRoles.includes('customer') || normalizedRoles.includes('user')) {
                       console.log("[UserStore JWT Decode] INCLUDES 'customer'/'user'. Setting finalRole to 'customer'.");
                       finalRole = 'customer'; 
                  } else {
                       console.log("[UserStore JWT Decode] No specific role matched in normalizedRoles array. Keeping default 'customer'.");
                       // finalRole 保持 'customer'
                  }
             }
        }
    } 
    else {
        console.log("[UserStore JWT Decode] No standard role claim ('roles', 'authorities', 'role') found or invalid format. Keeping default 'customer'.");
        // finalRole 保持 'customer'
    }

    console.log("[UserStore JWT Decode] Final determined role:", `'${finalRole}'`); // 🟢 最终结果加引号
    console.log("-------------------- EXTRACT ROLE END ----------------------"); // 🟢
    return finalRole; 
}


export const useUserStore = defineStore('user', () => {
  // --- 状态 ---
  const token = ref(localStorage.getItem('token') || '');
  const username = ref(localStorage.getItem('username') || '');
  const role = ref(localStorage.getItem('role') || 'customer'); 
  const userProfile = ref(null); 
  const isLoggedIn = ref(!!token.value);
  const isInitialized = ref(false); 
  const showLoginModal = ref(false); 

  // --- Actions ---

  const fetchUserProfile = async () => {
    // ... (保持不变) ...
    if (!token.value) {
        console.warn("[UserStore] No token found, cannot fetch user profile.");
        if (isLoggedIn.value) await logout(false); 
        return null; 
    }
    console.log("[UserStore] Attempting to fetch user profile...");
    try {
      const response = await api.get('/api/user'); 
      console.log("[UserStore] /api/user Response:", response.data); 
      const profile = response.data?.data; 
      
      if (profile) {
        userProfile.value = profile;
        console.log("[UserStore] User profile fetched:", JSON.stringify(profile)); 

        if (profile.username) {
          username.value = profile.username;
          localStorage.setItem('username', profile.username);
        }
        if (profile.role) {
          const lowerCaseRole = profile.role.toLowerCase();
          if (role.value !== lowerCaseRole) {
            role.value = lowerCaseRole;
            localStorage.setItem('role', lowerCaseRole);
            console.log("[UserStore] Updated role from profile:", lowerCaseRole);
          }
        }
        isLoggedIn.value = true; 
        return profile; 
      } else {
         console.warn("[UserStore] Backend /api/user returned null data.");
         return null;
      }

    } catch (error) {
      console.error("[UserStore] 获取用户资料失败:", error.response?.data || error.message);
      return null; 
    }
  };
  
  const updateUserProfile = async (profileData) => {
    // ... (保持不变) ...
    if (!isLoggedIn.value) return { success: false, message: "Not logged in." };
    try {
      await api.put('/api/user/profile', profileData);
      await fetchUserProfile(); 
      return { success: true };
    } catch (error) {
      console.error("[UserStore] 更新用户资料失败:", error);
      const message = error.response?.data?.message || "Update failed.";
      return { success: false, message: message };
    }
  };

  const logout = async (shouldRedirect = true) => { 
    // ... (保持不变) ...
    console.log("[UserStore] Logging out...");
    token.value = '';
    username.value = '';
    role.value = 'customer'; 
    userProfile.value = null; 
    isLoggedIn.value = false;
    isInitialized.value = false; 
    localStorage.clear();
    console.log("[UserStore] Logout complete.");
  };
  
  // Login 函数使用更新后的角色提取逻辑
  const login = async (usernameInput, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username: usernameInput,
        password: password
      });

      console.log('[Login Debug] Full response:', response);
      const receivedToken = response.headers?.['x-new-token'] || response.headers?.['X-New-Token'];

      console.log('[Login Debug] Extracted token:', receivedToken ? 'Token Found' : 'Token Not found in headers');

      if (!receivedToken) {
          console.error('[Login Debug] Token not found in response headers.');
          throw new Error('Login response did not contain a token.');
      }
      
      token.value = receivedToken;
      localStorage.setItem('token', receivedToken);

      console.log("[UserStore] Login successful, token acquired.");

      // 尝试获取 profile
      const profile = await fetchUserProfile(); 
      
      if (profile) {
        console.log("[UserStore] Profile fetched successfully after login.");
        isLoggedIn.value = true; 
      } else {
        console.warn("[UserStore] Profile fetch failed after login. Using JWT decode fallback.");
        isLoggedIn.value = true; // 关键：设置登录状态为 true

        const decodedToken = decodeJwt(receivedToken);
        const extractedRole = extractRoleFromToken(decodedToken); // 🟢 使用带详细日志的辅助函数
        const usernameFromSub = decodedToken?.sub || usernameInput; 
        const userIdFromToken = decodedToken?.id || decodedToken?.userId;

        username.value = usernameFromSub;
        localStorage.setItem('username', usernameFromSub);
        role.value = extractedRole; // 设置解码出的角色
        localStorage.setItem('role', extractedRole);
        userProfile.value = { 
            id: userIdFromToken || null, 
            username: username.value, 
            role: role.value.toUpperCase() 
        }; 
        console.log(`[UserStore] Using fallback info: User=${username.value}, Role=${role.value}, ID from token=${userIdFromToken || 'Not Found'}`);
      }

      isInitialized.value = true; 
      return { success: true }; // 只要拿到 token 就返回成功

    } catch (error) {
      console.error('API 登录失败:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      await logout(false); 
      return { success: false, message: errorMessage };
    }
  };
  
  // Initialize 函数使用更新后的角色提取逻辑
  const initialize = async () => {
    if (isInitialized.value) return;
    console.log("[UserStore] Initializing...");

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
      console.log("[UserStore] Found token in localStorage, attempting to fetch profile.");
      
      const profile = await fetchUserProfile(); // 尝试获取 profile

      if (!profile) {
        console.warn("[UserStore] Profile fetch failed during init. Using JWT decode fallback.");
        isLoggedIn.value = true; // 关键：设置登录状态为 true
        
        const decodedToken = decodeJwt(savedToken);
        const extractedRole = extractRoleFromToken(decodedToken); // 🟢 使用带详细日志的辅助函数
        const usernameFromSub = decodedToken?.sub || localStorage.getItem('username') || ''; 
        const userIdFromToken = decodedToken?.id || decodedToken?.userId;

        username.value = usernameFromSub;
        localStorage.setItem('username', usernameFromSub); // 更新存储
        role.value = extractedRole;
        localStorage.setItem('role', extractedRole); // 更新存储
        userProfile.value = { 
            id: userIdFromToken || null,
            username: username.value, 
            role: role.value.toUpperCase() 
        }; 
        console.log(`[UserStore] Using fallback info during init: User=${username.value}, Role=${role.value}, ID from token=${userIdFromToken || 'Not Found'}`);
      }
      // 如果 profile 获取成功，fetchUserProfile 内部已经设置了 isLoggedIn
      
    } else {
        console.log("[UserStore] No token found in localStorage during init.");
        await logout(false); // 确保是登出状态
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

