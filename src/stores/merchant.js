import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';
import { useUserStore } from './user'; // Import user store to get current userId and phone

export const useMerchantStore = defineStore('merchant', () => {
  // --- 状态 ---
  const currentMerchant = ref(null); // 存储当前商家的完整信息
  const isLoading = ref(false);
  const error = ref(null);

  // --- Actions ---

  // 获取当前登录用户的商家信息 (Workaround: 获取所有商家再根据 phone 筛选)
  const fetchMyMerchantProfile = async () => {
    console.log("[MerchantStore] Attempting to fetch current merchant profile (using phone workaround)...");
    isLoading.value = true;
    error.value = null;
    currentMerchant.value = null; // 清空旧数据
    const userStore = useUserStore(); 
    
    // 确保用户已登录且是商家角色，并且获取到 userProfile
    if (!userStore.isLoggedIn || userStore.role !== 'merchant' || !userStore.userProfile) {
        error.value = 'User is not logged in as a merchant or user profile is missing.';
        isLoading.value = false;
        console.error("[MerchantStore] " + error.value, { 
            isLoggedIn: userStore.isLoggedIn, 
            role: userStore.role, 
            userProfile: userStore.userProfile 
        });
        return; 
    }
    
    // 🟢 获取当前用户的电话号码
    const currentUserPhone = userStore.userProfile.phone;
    console.log(`[MerchantStore] Current User Phone: ${currentUserPhone}`);

    // 🟢 检查电话号码是否存在
    if (!currentUserPhone) {
        error.value = 'Current user profile is missing a phone number, cannot match merchant.';
        isLoading.value = false;
        console.error("[MerchantStore] " + error.value);
        return;
    }

    try {
      // 🟢 Workaround: 调用获取所有商家的接口
      console.log("[MerchantStore] Calling GET /api/merchant/merchants (workaround)...");
      const response = await api.get('/api/merchant/merchants'); // 使用确认可用的路径
      
      // 检查响应码 (兼容 1 和 20000) 和数据结构
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      const allMerchants = response.data?.data; 

      if (successCode && Array.isArray(allMerchants)) {
        console.log(`[MerchantStore] Received ${allMerchants.length} merchants. Filtering for phone: ${currentUserPhone}`);
        // 🟢 在前端根据 phone 筛选
        const foundMerchant = allMerchants.find(merchant => merchant.phone === currentUserPhone);

        if (foundMerchant) {
          currentMerchant.value = foundMerchant;
          console.log("[MerchantStore] Found and set current merchant profile by phone:", currentMerchant.value);
        } else {
          // 获取列表成功，但没找到匹配的商家
          error.value = `Could not find a merchant with phone number ${currentUserPhone} in the returned list.`;
          console.error("[MerchantStore] " + error.value);
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

  // 可以在 user store 的 logout action 中调用 merchantStore.clearMerchantProfile()

  return {
    currentMerchant,
    isLoading,
    error,
    fetchMyMerchantProfile,
    clearMerchantProfile,
  };
});

