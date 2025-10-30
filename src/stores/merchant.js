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
   * 注册一个新商家 (这会同时创建 User 和 Merchant)
   */
  const registerMerchant = async (merchantData) => {
    console.log("[MerchantStore] Attempting to register new merchant...", merchantData);
    isLoading.value = true;
    error.value = null;
    try {
      // 调用 /api/merchant/register
      // 我们假设后端此接口会处理 User 创建 和 Merchant 创建
      const response = await api.post('/api/merchant/register', {
        // User DTO 部分
        username: merchantData.username,
        password: merchantData.password,
        role: 'MERCHANT', // 角色固定
        // Merchant DTO 部分
        name: merchantData.merchantName,
        address: merchantData.address,
        latitude: merchantData.latitude,
        longitude: merchantData.longitude,
        // 其他后端可能需要的字段...
      });

      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode) {
        console.log("[MerchantStore] Merchant registration successful.", response.data.data);
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Registration failed due to server logic.');
      }
    } catch (err) {
      console.error('[MerchantStore] Error registering merchant:', err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      return { success: false, message: error.value };
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