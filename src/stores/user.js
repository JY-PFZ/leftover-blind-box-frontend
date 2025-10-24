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
    if (!token.value) {
        console.warn("[UserStore] No token found, cannot fetch user profile.");
        // If initialize calls this without token, ensure logged out state
        if (isLoggedIn.value) await logout(false); 
        return null; 
    }
    console.log("[UserStore] Attempting to fetch user profile...");
    try {
      // 🟢 使用 profile/{username} 接口获取用户信息
      const currentUsername = username.value || localStorage.getItem('username');
      if (!currentUsername) {
        console.warn("[UserStore] No username available to fetch profile");
        return null;
      }
      
      const response = await api.get(`/api/user/profile/${currentUsername}`); 
      console.log("[UserStore] /api/user/profile Response:", response.data); // Log the full response
      const profile = response.data?.data; 
      
      if (profile && profile.id && profile.username) {
        // 后端返回了有效数据
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
         console.warn("[UserStore] Backend /api/user/profile returned null or invalid data, using JWT fallback.");
         // 后端返回null，使用JWT信息创建临时profile
         const currentUsername = username.value || localStorage.getItem('username');
         if (currentUsername) {
           // 使用用户名作为临时ID（因为后端Cart API需要数字ID，但用户名也可以工作）
           const tempProfile = {
             id: currentUsername, // 临时使用用户名作为ID
             username: currentUsername,
             role: role.value.toUpperCase(),
             phone: null,
             nickname: null,
             avatar: null
           };
           userProfile.value = tempProfile;
           isLoggedIn.value = true;
           console.log("[UserStore] Created temporary profile from JWT:", tempProfile);
           return tempProfile;
         }
         return null;
      }

    } catch (error) {
      console.error("[UserStore] 获取用户资料失败:", error.response?.data || error.message);
      // 发生错误也返回 null
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
    console.log("[UserStore] Logging out...");
    token.value = '';
    username.value = '';
    role.value = 'customer'; 
    userProfile.value = null; 
    isLoggedIn.value = false;
    isInitialized.value = false; 
    localStorage.clear();
    // 拦截器会自动处理 Authorization header
    console.log("[UserStore] Logout complete.");
    // if (shouldRedirect && router) { // router instance might not be available here
    //   router.push('/'); 
    // }
  };
  
  // 🟢 修改 login 函数以处理 fetchUserProfile 失败的情况
  const login = async (usernameInput, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username: usernameInput,
        password: password
      });

      console.log('[Login Debug] Full response:', response);
      // 尝试从 header 获取 token
      const receivedToken = response.headers?.['x-new-token'] || response.headers?.['X-New-Token'];

      console.log('[Login Debug] Extracted token:', receivedToken ? 'Token Found' : 'Token Not found in headers');

      if (!receivedToken) {
          // 如果 header 没有，可以尝试从 body 获取 (根据后端实际情况调整)
          // const tokenFromBody = response.data?.data?.token || response.data?.token;
          // if(tokenFromBody) receivedToken = tokenFromBody; else ...
          console.error('[Login Debug] Token not found in response headers or body.');
          throw new Error('Login response did not contain a token.');
      }
      
      token.value = receivedToken;
      localStorage.setItem('token', receivedToken);
      // api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`; // 拦截器会做

      console.log("[UserStore] Login successful, token acquired.");

      // 尝试获取 profile
      const profile = await fetchUserProfile(); 
      
      if (profile) {
        // Profile 获取成功，fetchUserProfile 内部已更新状态
        console.log("[UserStore] Profile fetched successfully after login.");
        isLoggedIn.value = true; // 确保状态正确
      } else {
        // Profile 获取失败 (后端返回 null 或出错)，但我们有 token
        console.warn("[UserStore] Profile fetch failed after login. Using JWT decode or defaults as fallback.");
        isLoggedIn.value = true; // 关键：设置登录状态为 true

        // 尝试解码 JWT 获取信息
        const decodedToken = decodeJwt(receivedToken);
        let foundInfoInToken = false;
        if (decodedToken) {
            console.log("[UserStore] Decoded JWT:", decodedToken);
            // 假设 'sub' 是用户名/邮箱, 'roles' 或 'authorities' 是角色数组
            const usernameFromToken = decodedToken.sub; 
            // 检查常见的角色声明字段
            const rolesFromToken = decodedToken.roles || decodedToken.authorities || (decodedToken.role ? [decodedToken.role] : []); 

            if (usernameFromToken) {
                username.value = usernameFromToken;
                localStorage.setItem('username', usernameFromToken);
                
                // 根据 token 中的角色信息设置 role
                let assignedRole = 'customer'; // 默认
                if (Array.isArray(rolesFromToken) && rolesFromToken.length > 0) {
                   // 检查是否包含商家或管理员角色 (忽略大小写和 ROLE_ 前缀)
                   if (rolesFromToken.some(r => r.toUpperCase().includes('MERCHANT'))) {
                       assignedRole = 'merchant';
                   } else if (rolesFromToken.some(r => r.toUpperCase().includes('ADMIN'))) {
                       assignedRole = 'admin'; // 如果有管理员角色
                   } // 可以添加更多角色判断
                }
                role.value = assignedRole;
                localStorage.setItem('role', assignedRole);
                // 创建基础 profile，包含必要的 id 字段
                const userId = decodedToken.userId || decodedToken.id || decodedToken.sub; // 尝试从JWT获取ID
                userProfile.value = { 
                    id: userId, 
                    username: username.value, 
                    role: role.value.toUpperCase() 
                }; 
                console.log(`[UserStore] Using info from decoded JWT: User=${username.value}, Role=${role.value}, ID=${userId}`);
                foundInfoInToken = true;
            }
        }

        // 如果 JWT 解码失败或未包含足够信息，使用登录输入和默认值
        if (!foundInfoInToken) {
            console.log("[UserStore] JWT decode failed or no info found, using login input as fallback.");
            username.value = usernameInput;
            localStorage.setItem('username', usernameInput);
            // 维持默认角色 'customer' 或根据用户名猜测 (不推荐)
            role.value = 'customer'; 
            localStorage.setItem('role', 'customer');
            // 使用用户名作为临时ID（因为后端 /api/user 返回 null）
            userProfile.value = { 
                id: username.value, // 临时使用用户名作为ID
                username: username.value, 
                role: 'CUSTOMER' 
            }; 
        }
      }

      isInitialized.value = true; // 标记初始化完成
      return { success: true }; // 核心修改：只要拿到 token 就返回成功

    } catch (error) {
      console.error('API 登录失败:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      await logout(false); 
      return { success: false, message: errorMessage };
    }
  };
  
  // 初始化函数
  const initialize = async () => {
    if (isInitialized.value) return;
    console.log("[UserStore] Initializing...");

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
      // api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`; // 拦截器会做
      console.log("[UserStore] Found token in localStorage, attempting to fetch profile.");
      
      const profile = await fetchUserProfile(); // 尝试获取 profile

      if (!profile) {
        // 如果获取 profile 失败，但 token 存在，尝试解码 token 获取信息
        console.warn("[UserStore] Profile fetch failed during init. Using JWT decode or defaults as fallback.");
        isLoggedIn.value = true; // 关键：设置登录状态为 true
        const decodedToken = decodeJwt(savedToken);
        let foundInfoInToken = false;
        if (decodedToken) {
            const usernameFromToken = decodedToken.sub;
            const rolesFromToken = decodedToken.roles || decodedToken.authorities || (decodedToken.role ? [decodedToken.role] : []);
            if (usernameFromToken) {
                username.value = usernameFromToken;
                localStorage.setItem('username', usernameFromToken);
                let assignedRole = 'customer';
                if (Array.isArray(rolesFromToken) && rolesFromToken.length > 0) {
                   if (rolesFromToken.some(r => r.toUpperCase().includes('MERCHANT'))) assignedRole = 'merchant';
                   else if (rolesFromToken.some(r => r.toUpperCase().includes('ADMIN'))) assignedRole = 'admin';
                }
                role.value = assignedRole;
                localStorage.setItem('role', assignedRole);
                const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;
                userProfile.value = { 
                    id: userId, 
                    username: username.value, 
                    role: role.value.toUpperCase() 
                };
                console.log(`[UserStore] Using info from decoded JWT during init: User=${username.value}, Role=${role.value}, ID=${userId}`);
                foundInfoInToken = true;
            }
        }
        // 如果解码失败，尝试使用 localStorage 中可能存在的旧 username/role
        if (!foundInfoInToken) {
            console.log("[UserStore] JWT decode failed during init, using localStorage fallback.");
            username.value = localStorage.getItem('username') || '';
            role.value = localStorage.getItem('role') || 'customer';
            userProfile.value = { 
                id: username.value, // 临时使用用户名作为ID
                username: username.value, 
                role: role.value.toUpperCase() 
            };
        }
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
