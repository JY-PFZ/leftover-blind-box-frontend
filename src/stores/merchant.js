import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';
import { useUserStore } from './user'; // Import user store to get current userId

export const useMerchantStore = defineStore('merchant', () => {
  // --- 状态 ---
  const currentMerchant = ref(null); // 存储当前商家的完整信息
  const isLoading = ref(false);
  const error = ref(null);

  // --- Actions ---

  // 🟢 [NEW] 商家注册
  /**
   * 注册一个新商家 (使用 /api/merchant/register 接口)
   * 注意：需要先以 customer 身份登录，然后才能注册为 merchant
   */
  const registerMerchant = async (merchantData) => {
    console.log("[MerchantStore] ====== 开始商家注册 ======");
    console.log("[MerchantStore] 接收到的参数:", JSON.stringify(merchantData, null, 2));
    isLoading.value = true;
    error.value = null;
    
    // 检查用户是否已登录（后端会从token中获取userId，不需要前端传递）
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) {
      error.value = 'Please login as a customer first before registering as a merchant.';
      isLoading.value = false;
      return { success: false, message: error.value };
    }
    
    console.log("[MerchantStore] ✅ 用户已登录，后端将从token中获取userId");
    
    try {
      // 使用 /api/merchant/register 接口注册商家
      // 后端会自动生成商家ID，不需要前端传递
      
      // 🔧 第一步：处理手机号（可选字段）
      console.log("[MerchantStore] 步骤1: 处理手机号");
      let phone = null;
      if (merchantData.phone && merchantData.phone.trim()) {
        const phoneStr = merchantData.phone.trim().replace(/\s+/g, '');
        if (/^1[3-9]\d{9}$/.test(phoneStr)) {
          phone = phoneStr;
          console.log("[MerchantStore] ✅ 手机号格式正确:", phone);
        } else {
          console.warn('[MerchantStore] ⚠️ 手机号格式不正确，将不发送phone字段:', phoneStr);
        }
      }
      
      // 🔧 第二步：构建请求数据
      // 根据 MerchantRegisterDto，后端期望的字段：
      // - name (必须)
      // - address (必须)
      // - phone (可选，新加坡8位手机号：以8或9开头)
      // - latitude (可选)
      // - longitude (可选)
      // - businessLicense (可选)
      // 注意：不需要 userId 和 id，后端会从 token 中获取 userId，并自动生成 id
      console.log("[MerchantStore] 步骤2: 构建请求数据");
      const requestData = {
        name: merchantData.merchantName || '',
        address: merchantData.address || '',
        latitude: merchantData.latitude || null,
        longitude: merchantData.longitude || null
      };
      
      // 处理手机号：后端期望新加坡8位手机号（以8或9开头）
      // 如果用户输入的是中国11位手机号，需要转换或提示
      if (merchantData.phone && merchantData.phone.trim()) {
        const phoneStr = merchantData.phone.trim().replace(/\s+/g, '');
        // 检查是否符合新加坡手机号格式（8位，以8或9开头）
        if (/^[89]\d{7}$/.test(phoneStr)) {
          requestData.phone = phoneStr;
          console.log("[MerchantStore] ✅ 手机号格式正确（新加坡8位）:", phoneStr);
        } else {
          // 如果不符合格式，可以选择不发送或提示用户
          console.warn('[MerchantStore] ⚠️ 手机号格式不符合新加坡8位格式（以8或9开头），将不发送phone字段:', phoneStr);
          // 也可以选择发送空字符串（后端允许空字符串）
          // requestData.phone = '';
        }
      }
      
      console.log('[MerchantStore] 步骤3: 最终请求数据');
      console.log('[MerchantStore] 完整请求数据:', JSON.stringify(requestData, null, 2));
      console.log('[MerchantStore] ✅ 确认：请求数据中不包含userId和id字段（后端会从token中获取userId并自动生成id）');
      console.log('[MerchantStore] 请求数据的所有键:', Object.keys(requestData));
      
      // 🔧 第三步：发送请求
      // 根据后端 MerchantController，正确的路径是 /api/merchant/register（单数形式）
      const possiblePaths = ['/api/merchant/register'];
      let response = null;
      let lastError = null;
      
      for (const path of possiblePaths) {
        try {
          console.log(`[MerchantStore] 步骤4: 尝试发送POST请求到 ${path}`);
          console.log("[MerchantStore] 请求URL:", path);
          console.log("[MerchantStore] 请求方法: POST");
          console.log("[MerchantStore] 请求体:", requestData);
          
          response = await api.post(path, requestData);
          console.log(`[MerchantStore] ${path} 响应成功:`, response.status);
          break; // 如果成功，跳出循环
        } catch (error) {
          console.warn(`[MerchantStore] ${path} 请求失败:`, error.response?.status);
          lastError = error;
          // 继续尝试下一个路径
          continue;
        }
      }
      
      if (!response) {
        throw lastError || new Error('所有商家注册接口路径都失败');
      }
      
      console.log("[MerchantStore] 响应状态:", response.status);
      console.log("[MerchantStore] 响应数据:", response.data);

      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode) {
        console.log("[MerchantStore] Merchant registration successful.", response.data.data);
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Registration failed due to server logic.');
      }
    } catch (err) {
      console.error('[MerchantStore] Error registering merchant:', err);
      console.error('[MerchantStore] 错误详情:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
      
      // 提取具体的错误消息
      let errorMessage = 'An unknown error occurred.';
      if (err.response?.data) {
        console.error('[MerchantStore] 后端返回的错误数据:', err.response.data);
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          // 打印完整的错误数据以便调试
          console.error('[MerchantStore] 完整错误数据:', JSON.stringify(err.response.data, null, 2));
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('[MerchantStore] 最终错误消息:', errorMessage);
      
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };


  // 🟢 [FIXED] 修改为使用 /api/merchant/my 接口
  const fetchMyMerchantProfile = async () => {
    console.log("[MerchantStore] Attempting to fetch current merchant profile...");
    isLoading.value = true;
    error.value = null;
    currentMerchant.value = null; // 清空旧数据
    const userStore = useUserStore();

    // 确保用户已登录且是商家角色
    if (!userStore.isLoggedIn || userStore.role !== 'merchant') {
      error.value = 'User is not logged in as a merchant.';
      isLoading.value = false;
      console.error("[MerchantStore] " + error.value, { isLoggedIn: userStore.isLoggedIn, role: userStore.role });
      return; // 直接返回
    }
    console.log(`[MerchantStore] Current User is a merchant.`);

    try {
      // 🟢 [FIXED] Workaround 移除, 直接调用专用接口
      console.log("[MerchantStore] Calling GET /api/merchant/my ...");
      const response = await api.get('/api/merchant/my');

      // 🟢 检查响应码 (兼容 1 和 20000) 和数据结构
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      const foundMerchant = response.data?.data; // 假设 data 是商家对象

      if (successCode && foundMerchant) {
        console.log(`[MerchantStore] Received merchant profile successfully.`);
        currentMerchant.value = foundMerchant;
        console.log("[MerchantStore] Set current merchant profile:", currentMerchant.value);
      } else {
        // API 调用失败或返回数据结构错误
        error.value = response.data?.message || 'Failed to fetch merchant profile or invalid data structure.';
        console.error("[MerchantStore] " + error.value, response.data);
        currentMerchant.value = null;
      }
    } catch (err) {
      console.error('[MerchantStore] Error fetching /api/merchant/my:', err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      currentMerchant.value = null; // Clear on error
    } finally {
      isLoading.value = false;
      console.log("[MerchantStore] fetchMyMerchantProfile finished.");
    }
  };

  // 清除商家信息 (例如，在用户登出时调用)
  const clearMerchantProfile = () => {
    currentMerchant.value = null;
    error.value = null;
    console.log("[MerchantStore] Cleared merchant profile.");
  };

  // 🟢 在 logout 时也清除商家信息 (如果 user store 调用)
  // 可以在 user store 的 logout action 中调用 merchantStore.clearMerchantProfile()

  return {
    currentMerchant,
    isLoading,
    error,
    registerMerchant, // 🟢 [ADDED] 导出新函数
    fetchMyMerchantProfile,
    clearMerchantProfile,
  };
});