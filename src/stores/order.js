import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';
import { useUserStore } from '@/stores/user';

export const useOrderStore = defineStore('order', () => {
  // --- 状态 (State) ---
  const orders = ref([]); // 订单列表
  const pagination = ref({ // 分页信息
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const isLoading = ref(false); // 是否正在加载
  const error = ref(null); // 错误信息

  // --- Actions ---

  /**
   * 获取订单列表
   * @param {object} params - 查询参数，例如 { pageNum: 1, pageSize: 10, status: 'paid' }
   */
  async function fetchOrders(params = {}) {
    const userStore = useUserStore();
    // 确保在检查 isLoggedIn 前 userStore 已初始化
    if (!userStore.isInitialized) {
        await userStore.initialize();
    }

    if (!userStore.isLoggedIn) {
      console.warn("[OrderStore] User not logged in, skipping fetchOrders.");
      orders.value = []; // 清空订单
      error.value = "User not logged in";
      return;
    }

    isLoading.value = true;
    error.value = null;

    // 准备查询参数，合并默认分页和传入的参数
    const queryParams = {
      pageNum: params.pageNum || pagination.value.currentPage,
      pageSize: params.pageSize || pagination.value.pageSize,
      ...params, // 包含 status, startDate, endDate 等
    };

    try {
      console.log("[OrderStore] Fetching orders with params:", queryParams);
      // 🟢 修正：统一使用 /api/order 路径获取列表
      const response = await api.get('/api/order', { params: queryParams }); 

      // 后端返回的数据结构是 Result<IPage<OrderDto>>
      // 使用宽松相等 (==) 检查 code，以兼容数字或字符串形式的 20000 (或其他成功码如 1)
      const successCode = response.data?.code == 1 || response.data?.code == 20000; 
      if (successCode && response.data?.data) { 
          const pageData = response.data.data;
          // 添加更健壮的检查，确保 records 存在且是数组
          if (pageData && Array.isArray(pageData.records)) {
            orders.value = pageData.records;
            pagination.value = {
              currentPage: pageData.current ?? 1, 
              pageSize: pageData.size ?? 10,
              totalItems: pageData.total ?? 0,
              totalPages: pageData.pages ?? 1,
            };
            console.log("[OrderStore] Orders fetched successfully:", orders.value.length, "orders");
            console.log("[OrderStore] Pagination updated:", pagination.value);
          } else {
            console.warn("[OrderStore] Invalid data structure in pageData (missing records array):", pageData);
            orders.value = [];
            error.value = "Invalid data structure received";
          }
      } else {
          // 处理后端返回错误码或 code 不匹配的情况
          console.warn("[OrderStore] API request failed or returned non-success code:", response.data);
          orders.value = [];
          error.value = response.data?.message || "Failed to fetch orders or received invalid response"; 
      }


    } catch (err) {
      console.error("[OrderStore] Fetch orders failed:", err);
      // 如果是 404 错误，给出更明确的提示
      if (err.response?.status === 404) {
           error.value = "Order API endpoint not found (404). Please check gateway routing for /api/order."; // 更新提示信息
      } else {
           error.value = err.response?.data?.message || err.message || "Failed to load orders";
      }
      orders.value = []; // 出错时清空
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 更新订单状态
   * @param {number} orderId - 订单ID
   * @param {string} status - 新状态 (pending, paid, completed, cancelled)
   * @param {string} remark - 备注（可选）
   */
  async function updateOrderStatus(orderId, status, remark = '') {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log(`[OrderStore] Updating order ${orderId} to status: ${status}`);
      // 使用 /api/order/ 路径
      const response = await api.put(`/api/order/${orderId}/status`, { 
        status: status,
        remark: remark
      });
      
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode) {
        console.log(`[OrderStore] Order ${orderId} updated successfully`);
        // 重新获取订单列表以更新显示
        await fetchOrders();
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error(`[OrderStore] Error updating order ${orderId}:`, err);
      error.value = err.response?.data?.message || err.message || 'Failed to update order status';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   */
  async function cancelOrder(orderId) {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log(`[OrderStore] Cancelling order ${orderId}`);
       // 使用 /api/order/ 路径
      const response = await api.put(`/api/order/${orderId}/cancel`); 
      
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode) {
        console.log(`[OrderStore] Order ${orderId} cancelled successfully`);
        // 重新获取订单列表以更新显示
        await fetchOrders();
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(`[OrderStore] Error cancelling order ${orderId}:`, err);
      error.value = err.response?.data?.message || err.message || 'Failed to cancel order';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 核销订单（商家使用）
   * @param {number} orderId - 订单ID
   * @param {object} verificationData - 核销数据 { location } (根据 OrderVerificationDto 调整)
   */
  async function verifyOrder(orderId, verificationData = {}) {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log(`[OrderStore] Verifying order ${orderId}`, verificationData);
       // 使用 /api/order/ 路径
      const response = await api.post(`/api/order/${orderId}/verify`, { 
        // 🔴 根据 OrderVerificationDto，Body 只需要 location
        location: verificationData.location || 'Store Front', 
        // orderId: orderId, // 这个通常从 URL Path 获取
        // verifierName: verificationData.verifierName || 'Merchant' // 这个应该由后端从 currentUser 获取
      });
      
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      if (successCode) {
        console.log(`[OrderStore] Order ${orderId} verified successfully`);
        // 重新获取订单列表以更新显示
        await fetchOrders();
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to verify order');
      }
    } catch (err) {
      console.error(`[OrderStore] Error verifying order ${orderId}:`, err);
      error.value = err.response?.data?.message || err.message || 'Failed to verify order';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    orders,
    pagination,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
    verifyOrder,
  };
});

