import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';
import { useMerchantStore } from './merchant'; // Import merchant store

export const useMagicBagStore = defineStore('magicBag', () => {
  // --- 状态 ---
  const magicBags = ref([]); // 存储当前商家的 Magic Bags 列表
  const isLoading = ref(false);
  const error = ref(null);
  const pagination = ref({ // 如果需要分页，可以添加分页信息
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // --- Getters ---
  const merchantId = computed(() => {
    const merchantStore = useMerchantStore();
    return merchantStore.currentMerchant?.id;
  });

  // --- Actions ---

  // 获取当前商家的 Magic Bags
  const fetchMyMagicBags = async () => {
    const merchantStore = useMerchantStore();
    if (!merchantStore.currentMerchant?.id) {
        error.value = "Merchant ID not available. Fetch merchant profile first.";
        console.error("[MagicBagStore] " + error.value);
        magicBags.value = []; // Clear bags if no merchant ID
        return;
    }
    const currentMerchantId = merchantStore.currentMerchant.id;

    isLoading.value = true;
    error.value = null;
    try {
      // [FIXED] 修正 API 路径：根据 API 文档，应为 /api/product/merchant/{id}
      const response = await api.get(`/api/product/merchant/${currentMerchantId}`); 
      // [FIXED] 修正成功 code 检查 (1 或 20000)
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode && Array.isArray(response.data?.data)) { 
        magicBags.value = response.data.data;
        console.log(`[MagicBagStore] Fetched ${magicBags.value.length} magic bags for merchant ${currentMerchantId}`);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch magic bags.');
      }
    } catch (err) {
      console.error('[MagicBagStore] Error fetching magic bags:', err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      magicBags.value = []; // Clear bags on error
    } finally {
      isLoading.value = false;
    }
  };

  // 创建 Magic Bag
  const createMagicBag = async (bagData) => {
    const merchantStore = useMerchantStore();
     if (!merchantStore.currentMerchant?.id) {
        throw new Error("Cannot create bag: Merchant ID not available.");
    }
    const dataToSubmit = { 
        ...bagData, 
        merchantId: merchantStore.currentMerchant.id 
    };

    isLoading.value = true; 
    error.value = null;
    try {
      // [FIXED] 修正 API 路径：根据 API 文档，应为 /api/product
      const response = await api.post('/api/product', dataToSubmit); 
      // [FIXED] 修正成功 code 检查 (1 或 20000)
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode && response.data?.data) { 
        console.log("[MagicBagStore] Magic Bag created successfully:", response.data.data);
        await fetchMyMagicBags(); 
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data?.message || 'Failed to create magic bag.');
      }
    } catch (err) {
      console.error('[MagicBagStore] Error creating magic bag:', err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      return { success: false, message: error.value };
    } finally {
       isLoading.value = false; 
    }
  };

  // 更新 Magic Bag
  const updateMagicBag = async (bagId, bagData) => {
    isLoading.value = true; 
    error.value = null;
     try {
      // [FIXED] 修正 API 路径：根据 API 文档，应为 /api/product/{id}
      const response = await api.put(`/api/product/${bagId}`, bagData); 
      // [FIXED] 修正成功 code 检查 (1 或 20000)
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode && response.data?.data) { 
        console.log(`[MagicBagStore] Magic Bag ${bagId} updated successfully:`, response.data.data);
        await fetchMyMagicBags();
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data?.message || `Failed to update magic bag ${bagId}.`);
      }
    } catch (err) {
      console.error(`[MagicBagStore] Error updating magic bag ${bagId}:`, err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      return { success: false, message: error.value };
    } finally {
       isLoading.value = false; 
    }
  };

  // 删除 Magic Bag (软删除)
  const deleteMagicBag = async (bagId) => {
    isLoading.value = true; 
    error.value = null;
     try {
      // [FIXED] 修正 API 路径：根据 API 文档，应为 /api/product/{id}
      const response = await api.delete(`/api/product/${bagId}`); 
      // [FIXED] 修正成功 code 检查 (1 或 20000)
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      // 检查后端是否成功
      if (response.status === 200 || response.status === 204 || successCode) { 
        console.log(`[MagicBagStore] Magic Bag ${bagId} deleted successfully.`);
        await fetchMyMagicBags();
        return { success: true };
      } else {
        throw new Error(response.data?.message || `Failed to delete magic bag ${bagId}.`);
      }
    } catch (err) {
      console.error(`[MagicBagStore] Error deleting magic bag ${bagId}:`, err);
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
      return { success: false, message: error.value };
    } finally {
       isLoading.value = false; 
    }
  };

  // 获取所有 Magic Bags (用于 HomeView)
  const fetchAllMagicBags = async (page = 1, size = 999) => {
    isLoading.value = true;
    error.value = null;
    try {
        // [FIXED] 修正 API 路径：根据 API 文档，应为 /api/product
        const response = await api.get('/api/product', { params: { page, size } }); 
        // [FIXED] 修正成功 code 检查 (1 或 20000)
        const successCode = response.data?.code == 1 || response.data?.code == 20000;
        
        // [FIXED] 修正数据结构检查
        const productsData = response.data?.data;
        let magicBagsList = [];

        if (successCode) {
          if (Array.isArray(productsData)) {
            magicBagsList = productsData;
          } else if (productsData?.magicBags && Array.isArray(productsData.magicBags)) {
            magicBagsList = productsData.magicBags;
          }
          console.log(`[MagicBagStore] Fetched all magic bags (page ${page}, size ${size})`);
          return magicBagsList;

        } else {
            throw new Error(response.data?.message || 'Failed to fetch all magic bags.');
        }
    } catch (err) {
         console.error('[MagicBagStore] Error fetching all magic bags:', err);
         error.value = err.response?.data?.message || err.message || 'An unknown error occurred.';
         return []; // 返回空数组表示失败
    } finally {
         isLoading.value = false; 
  S }
  };


  return {
    magicBags,
    isLoading,
    error,
    pagination,
    merchantId, 
    fetchMyMagicBags,
    createMagicBag,
    updateMagicBag,
    deleteMagicBag,
    fetchAllMagicBags, 
  };
});

