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
      // 使用正确的 API 路径
      const response = await api.get('/orders', { params: queryParams });

      // 后端返回的数据结构是 Result<IPage<OrderDto>>
      // 🟢 修正：使用宽松相等 (==) 检查 code，以兼容数字或字符串形式的 20000
      if (response.data?.code == 20000 && response.data?.data) { 
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
          // 处理后端返回错误码或 code 不是 20000 的情况
          console.warn("[OrderStore] API request failed or returned non-success code:", response.data);
          orders.value = [];
          // 🟢 即使 message 是 "SUCCESS"，也将其视为错误，因为 code 不匹配或 data 缺失
          error.value = response.data?.message || "Failed to fetch orders or received invalid response"; 
      }


    } catch (err) {
      console.error("[OrderStore] Fetch orders failed:", err);
      error.value = err.response?.data?.message || err.message || "Failed to load orders";
      orders.value = []; // 出错时清空
    } finally {
      isLoading.value = false;
    }
  }

  // --- 其他 Actions (例如更新状态、取消订单等，后续添加) ---
  
  // async function updateStatus(orderId, status) { ... }
  // async function cancelOrder(orderId) { ... }
  // async function verifyOrder(orderId, verificationData) { ... }


  return {
    orders,
    pagination,
    isLoading,
    error,
    fetchOrders,
    // 其他需要暴露的 actions
  };
});

