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
       // 🔴 使用正确的 API 路径
       const response = await api.get('/orders', { params: queryParams });

       // 后端返回的数据结构是 Result<IPage<OrderDto>>
       // 🔴 假设成功时 code 为 1
       if (response.data?.code === 1 && response.data?.data) {
           const pageData = response.data.data;
           if (pageData && Array.isArray(pageData.records)) {
             orders.value = pageData.records;
             pagination.value = {
               currentPage: pageData.current,
               pageSize: pageData.size,
               totalItems: pageData.total,
               totalPages: pageData.pages,
             };
             console.log("[OrderStore] Orders fetched successfully:", orders.value.length, "orders");
             console.log("[OrderStore] Pagination updated:", pagination.value);
           } else {
             console.warn("[OrderStore] Invalid data structure in pageData:", pageData);
             orders.value = [];
             error.value = "Invalid data structure received";
           }
       } else {
           console.warn("[OrderStore] API request failed or returned invalid data:", response.data);
           orders.value = [];
           error.value = response.data?.message || "Failed to fetch orders or invalid data returned";
       }


     } catch (err) {
       console.error("[OrderStore] Fetch orders failed:", err);
       error.value = err.response?.data?.message || err.message || "Failed to load orders";
       orders.value = []; // 出错时清空
     } finally {
       isLoading.value = false;
     }
   }

   // --- Getters (如果需要可以添加) ---
   // const completedOrders = computed(() => orders.value.filter(o => o.status === 'COMPLETED'));

   return {
     orders,
     pagination,
     isLoading,
     error,
     fetchOrders,
   };
 });

