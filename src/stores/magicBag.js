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
      // 调用 GET /api/product/magic-bags/merchant/{merchantId}
      const response = await api.get(`/api/product/magic-bags/merchant/${currentMerchantId}`);
      if (response.data?.code === 20000 && Array.isArray(response.data?.data)) {
        magicBags.value = response.data.data;
        console.log(`[MagicBagStore] Fetched ${magicBags.value.length} magic bags for merchant ${currentMerchantId}`);
        // TODO: 如果后端支持分页，这里需要处理分页信息
        // pagination.value = ...
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
    // 确保提交的数据包含 merchantId
    const dataToSubmit = { 
        ...bagData, 
        merchantId: merchantStore.currentMerchant.id 
    };

    isLoading.value = true; // 可以为创建操作设置单独的 loading 状态
    error.value = null;
    try {
      // 调用 POST /api/product/magic-bags
      const response = await api.post('/api/product/magic-bags', dataToSubmit);
      if (response.data?.code === 20000 && response.data?.data) {
        console.log("[MagicBagStore] Magic Bag created successfully:", response.data.data);
        // 创建成功后，重新获取列表以显示新项
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
       isLoading.value = false; // 结束 loading
    }
  };

  // 更新 Magic Bag
  const updateMagicBag = async (bagId, bagData) => {
    isLoading.value = true; // 可以为更新操作设置单独的 loading 状态
    error.value = null;
     try {
      // 调用 PUT /api/product/magic-bags/{id}
      const response = await api.put(`/api/product/magic-bags/${bagId}`, bagData);
      if (response.data?.code === 20000 && response.data?.data) {
        console.log(`[MagicBagStore] Magic Bag ${bagId} updated successfully:`, response.data.data);
        // 更新成功后，重新获取列表以显示更改
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
       isLoading.value = false; // 结束 loading
    }
  };

  // 删除 Magic Bag (软删除)
  const deleteMagicBag = async (bagId) => {
    isLoading.value = true; // 可以为删除操作设置单独的 loading 状态
    error.value = null;
     try {
      // 调用 DELETE /api/product/magic-bags/{id}
      const response = await api.delete(`/api/product/magic-bags/${bagId}`);
      // 检查后端是否成功 (通常 DELETE 成功返回 200 或 204)
       if (response.status === 200 || response.status === 204 || response.data?.code === 20000) {
        console.log(`[MagicBagStore] Magic Bag ${bagId} deleted successfully.`);
        // 删除成功后，重新获取列表以移除该项
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
       isLoading.value = false; // 结束 loading
    }
  };

  return {
    magicBags,
    isLoading,
    error,
    pagination,
    merchantId, // 暴露 merchantId getter
    fetchMyMagicBags,
    createMagicBag,
    updateMagicBag,
    deleteMagicBag,
  };
});
