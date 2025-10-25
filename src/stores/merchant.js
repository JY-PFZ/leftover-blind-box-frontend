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

  // 获取当前登录用户的商家信息 (Workaround: 获取所有商家再筛选)
  const fetchMyMerchantProfile = async () => {
    // 🟢 增加日志
    console.log("[MerchantStore] Attempting to fetch current merchant profile (using workaround)...");
    isLoading.value = true;
    error.value = null;
    currentMerchant.value = null; // 清空旧数据
    const userStore = useUserStore(); 
    
    // 确保用户已登录且是商家角色，并且有 userId
    if (!userStore.isLoggedIn || userStore.role !== 'merchant' || !userStore.userProfile?.id) {
        error.value = 'User is not logged in as a merchant or user ID is missing.';
        isLoading.value = false;
        console.error("[MerchantStore] " + error.value, { isLoggedIn: userStore.isLoggedIn, role: userStore.role, userId: userStore.userProfile?.id });
        return; // 直接返回，不再尝试获取
    }
    const currentUserId = userStore.userProfile.id;
    console.log(`[MerchantStore] Current User ID: ${currentUserId}`);

    try {
      // 🟢 Workaround: 调用获取所有商家的接口
      console.log("[MerchantStore] Calling GET /api/merchant/merchants (workaround)...");
      const response = await api.get('/api/merchant/merchants'); // 使用确认可用的路径
      
      // 🟢 检查响应码 (兼容 1 和 20000) 和数据结构
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      const allMerchants = response.data?.data; // 假设 data 是商家列表数组

      if (successCode && Array.isArray(allMerchants)) {
        console.log(`[MerchantStore] Received ${allMerchants.length} merchants. Filtering for userId: ${currentUserId}`);
        // 🟢 在前端筛选
        const foundMerchant = allMerchants.find(merchant => merchant.userId === currentUserId);

        if (foundMerchant) {
          currentMerchant.value = foundMerchant;
          console.log("[MerchantStore] Found and set current merchant profile:", currentMerchant.value);
        } else {
          // 获取列表成功，但没找到匹配的商家
          error.value = `Could not find a merchant associated with user ID ${currentUserId} in the returned list.`;
          console.error("[MerchantStore] " + error.value);
          // 确保 currentMerchant 仍然是 null
          currentMerchant.value = null;
        }
      } else {
        // API 调用失败或返回数据结构错误
        error.value = response.data?.message || 'Failed to fetch merchants list or invalid data structure.';
        console.error("[MerchantStore] " + error.value, response.data);
         currentMerchant.value = null;
      }
    } catch (err) {
      console.error('[MerchantStore] Error fetching merchants list (workaround):', err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      currentMerchant.value = null; // Clear on error
    } finally {
      isLoading.value = false;
      console.log("[MerchantStore] fetchMyMerchantProfile (workaround) finished.");
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
    fetchMyMerchantProfile,
    clearMerchantProfile,
  };
});

