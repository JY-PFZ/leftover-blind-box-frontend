import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';
import { useUserStore } from './user'; // Import user store if needed for userId

export const useMerchantStore = defineStore('merchant', () => {
  // --- 状态 ---
  const currentMerchant = ref(null); // 存储当前商家的完整信息
  const isLoading = ref(false);
  const error = ref(null);

  // --- Actions ---

  // 获取当前登录用户的商家信息
  const fetchMyMerchantProfile = async () => {
    isLoading.value = true;
    error.value = null;
    const userStore = useUserStore(); // Access user store if needed, e.g., for userId
    
    // 确保用户已登录且是商家角色
    if (!userStore.isLoggedIn || userStore.role !== 'merchant') {
        error.value = 'User is not logged in as a merchant.';
        isLoading.value = false;
        currentMerchant.value = null; // Clear any previous data
        console.error("[MerchantStore] " + error.value);
        return;
    }

    try {
      // 假设后端提供了 GET /api/merchants/my 接口
      // 这个接口应该在后端根据 token 识别用户，并返回对应的 Merchant DTO
      const response = await api.get('/merchants/my'); 
      if (response.data?.code === 20000 && response.data?.data) {
        currentMerchant.value = response.data.data;
        console.log("[MerchantStore] Fetched merchant profile:", currentMerchant.value);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch merchant profile.');
      }
    } catch (err) {
      console.error('[MerchantStore] Error fetching merchant profile:', err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      currentMerchant.value = null; // Clear on error
    } finally {
      isLoading.value = false;
    }
  };

  // 清除商家信息 (例如，在用户登出时调用)
  const clearMerchantProfile = () => {
    currentMerchant.value = null;
    error.value = null;
  };

  return {
    currentMerchant,
    isLoading,
    error,
    fetchMyMerchantProfile,
    clearMerchantProfile,
  };
});
