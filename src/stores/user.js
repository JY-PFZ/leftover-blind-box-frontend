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
      console.log('🔐 开始后端登录流程...', { username: usernameInput });
      
      // 1. 获取RSA公钥
      const keyResponse = await api.get('/auth/key');
      console.log('🔑 获取公钥成功:', keyResponse.data);
      
      const publicKey = keyResponse.data?.data || keyResponse.data;
      if (!publicKey) {
        throw new Error('无法获取RSA公钥');
      }
      
      // 2. 加密密码
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      const encryptedPassword = encrypt.encrypt(password);
      
      if (!encryptedPassword) {
        throw new Error('密码加密失败');
      }
      
      console.log('🔒 密码加密成功');
      
      // 3. 发送登录请求
      const loginResponse = await api.post('/auth/login', {
        email: usernameInput,  // 后端期望email字段
        username: usernameInput,  // 后端也需要username字段
        password: encryptedPassword
      });
      
      console.log('📡 登录响应:', loginResponse.data);
      
      // 检查响应格式 - 后端返回 {code: 1, message: "SUCCESS", data: {...}}
      if (loginResponse.data?.code === 1 || loginResponse.data?.success) {
        const userData = loginResponse.data?.data || loginResponse.data;
        
        // 保存用户信息
        token.value = userData.token || userData.accessToken || 'backend-token-' + Date.now();
        username.value = userData.username || usernameInput;
        role.value = userData.role || 'customer';
        isLoggedIn.value = true;
        
        // 保存到localStorage
        localStorage.setItem('token', token.value);
        localStorage.setItem('username', username.value);
        localStorage.setItem('role', role.value);
        
        console.log('✅ 后端登录成功:', { username: username.value, role: role.value });
        return { success: true, data: userData };
      } else {
        throw new Error(loginResponse.data?.message || '登录失败');
      }
    } catch (error) {
      console.error('❌ 后端登录失败，回退到Mock登录:', error);
      
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
        
        console.log('✅ Mock登录成功:', { username: username.value, role: role.value });
        return { success: true };
      }
      
      return { success: false, message: error.message || '登录失败' };
    }
  };
  
  const register = async (usernameInput, password, email, additionalData = {}) => {
    try {
      console.log('📝 开始后端注册流程...', { username: usernameInput, email });
      
      // 1. 获取RSA公钥
      const keyResponse = await api.get('/auth/key');
      console.log('🔑 获取公钥成功:', keyResponse.data);
      
      const publicKey = keyResponse.data?.data || keyResponse.data;
      if (!publicKey) {
        throw new Error('无法获取RSA公钥');
      }
      
      // 2. 加密密码
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      const encryptedPassword = encrypt.encrypt(password);
      
      if (!encryptedPassword) {
        throw new Error('密码加密失败');
      }
      
      console.log('🔒 密码加密成功');
      
      // 3. 发送注册请求
      const registerData = {
        email: usernameInput,
        password: encryptedPassword,
        username: usernameInput,
        role: additionalData.role || 'CUSTOMER',
        ...additionalData  // 包含其他可能的字段
      };
      
      console.log('📤 发送注册数据:', { ...registerData, password: '[ENCRYPTED]' });
      
      const registerResponse = await api.post('/user/register', registerData);
      
      console.log('📡 注册响应:', registerResponse.data);
      
      // 检查响应格式 - 后端返回 {code: 1, message: "SUCCESS", data: {...}}
      if (registerResponse.data?.code === 1 || registerResponse.data?.success) {
        console.log('✅ 后端注册成功');
        return { success: true, message: '注册成功！请登录' };
      } else {
        throw new Error(registerResponse.data?.message || '注册失败');
      }
    } catch (error) {
      console.error('❌ 后端注册失败:', error);
      
      // 根据错误类型返回不同的错误信息
      let errorMessage = '注册失败';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  // 测试API连接
  const testApiConnection = async () => {
    try {
      console.log('🔍 测试API连接...');
      const response = await api.get('/auth/key');
      console.log('✅ API连接成功:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ API连接失败:', error);
      return { success: false, error: error.message };
    }
  };

  // 测试注册API
  const testRegisterApi = async () => {
    try {
      console.log('🧪 测试注册API...');
      
      // 获取公钥
      const keyResponse = await api.get('/auth/key');
      const publicKey = keyResponse.data?.data || keyResponse.data;
      
      // 加密测试密码
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      const encryptedPassword = encrypt.encrypt('test123456');
      
      // 测试最简单的注册请求
      const testData = {
        email: 'test@example.com',
        password: encryptedPassword,
        username: 'testuser',
        role: 'CUSTOMER'  // 添加role字段
      };
      
      console.log('📤 测试注册数据:', { ...testData, password: '[ENCRYPTED]' });
      
      const response = await api.post('/user/register', testData);
      console.log('📡 测试注册响应:', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ 测试注册API失败:', error);
      return { success: false, error: error.message, details: error.response?.data };
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
    testApiConnection,
    testRegisterApi,
  };
});

