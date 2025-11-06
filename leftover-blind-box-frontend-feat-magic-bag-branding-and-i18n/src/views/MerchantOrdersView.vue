<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-4 md:p-8">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Manage Orders</h1>

      <!-- Loading State -->
      <div v-if="orderStore.isLoading" class="text-center py-10">
        <p class="text-gray-600">Loading orders...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="orderStore.error" class="p-6 bg-red-100 text-red-700 rounded-lg shadow-md">
        <p class="font-semibold">Failed to load orders:</p>
        <p>{{ orderStore.error }}</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="p-12 text-center bg-white rounded-lg shadow-md border border-gray-200">
        <h3 class="text-xl font-semibold text-gray-700 mt-4">No Orders Found</h3>
        <p class="text-gray-500 mt-2">When customers place orders, they will appear here.</p>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-6">
        <div v-for="order in orders" :key="order.id" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          
          <!-- Order Header -->
          <div class="bg-gray-50 p-4 sm:p-5 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center">
              <div class="mb-2 sm:mb-0">
                <h3 class="text-xl font-bold text-gray-800">Order {{ order.orderNo }}</h3>
                <p class="text-gray-500 text-sm">Placed: {{ formatDate(order.createdAt) }}</p>
              </div>
              <div :class="['status-badge px-4 py-2 rounded-full font-bold text-sm', getStatusClass(order.status)]">
                {{ formatStatus(order.status) }}
              </div>
            </div>
          </div>
          
          <div class="p-5 md:p-6">
            <!-- Order Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
              <div>
                <p class="detail-label text-xs text-gray-500 uppercase font-semibold">Customer</p>
                <p class="detail-value text-gray-800 font-medium text-lg">{{ order.userName || 'N/A' }}</p>
              </div>
              
              <div>
                <p class="detail-label text-xs text-gray-500 uppercase font-semibold">Total Amount</p>
                <p class="detail-value-price text-green-600 font-bold text-3xl">¥{{ order.totalPrice.toFixed(2) }}</p>
              </div>
              
              <div v-if="order.status === 'paid' || order.status === 'completed'">
                <p class="detail-label text-xs text-gray-500 uppercase font-semibold">Pickup Code</p>
                <p class="detail-value-code text-blue-600 font-mono text-3xl font-bold tracking-widest">{{ order.pickupCode }}</p>
              </div>
            </div>

            <!-- Item List -->
            <div class="item-list-container border-t border-gray-200 pt-5">
              <p class="text-sm font-semibold text-gray-700 mb-3">Items in this order:</p>
              
              <!-- 单个商品订单 -->
              <div v-if="order.orderType === 'single'" class="space-y-3">
                <div class="order-item-single flex items-center space-x-4 bg-gray-100 rounded-lg p-3">
                  <img :src="order.bagImageUrl || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=Item'" 
                       alt="Item Image" 
                       class="item-image w-16 h-16 rounded-md object-cover bg-gray-200 flex-shrink-0"
                       onerror="this.src='https://placehold.co/64x64/e2e8f0/94a3b8?text=Error'">
                  <div class="flex-1">
                    <p class="font-medium text-gray-800">{{ order.bagTitle }}</p>
                    <p class="text-sm text-gray-500">Quantity: {{ order.quantity }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 购物车订单 (修复) -->
              <div v-else-if="order.orderType === 'cart' && order.orderItems" class="space-y-3">
                <ul class="space-y-3">
                  <li v-for="item in order.orderItems" :key="item.id" class="order-item-li flex items-center space-x-4 bg-gray-100 rounded-lg p-3">
                    <img :src="item.magicBagImageUrl || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=Item'" 
                         alt="Item Image" 
                         class="item-image w-16 h-16 rounded-md object-cover bg-gray-200 flex-shrink-0"
                         onerror="this.src='https://placehold.co/64x64/e2e8f0/94a3b8?text=Error'">
                    <div class="flex-1">
                      <p class="font-medium text-gray-800">{{ item.magicBagTitle }}</p>
                      <p class="text-sm text-gray-500">Qty: {{ item.quantity }} &times; ¥{{ item.unitPrice.toFixed(2) }}</p>
                    </div>
                    <p class="text-base font-medium text-gray-900">¥{{ (item.quantity * item.unitPrice).toFixed(2) }}</p>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons-container border-t border-gray-200 pt-4 mt-4 flex flex-wrap gap-3 justify-end">
              <button
                v-if="order.status === 'paid'"
                @click="verifyOrder(order)"
                class="action-button-verify px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
              >
                Verify & Complete Order
              </button>
              <button
                v-if="order.status === 'pending'"
                @click="updateOrderStatus(order.id, 'paid')"
                class="action-button-confirm-payment px-5 py-2 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 border border-green-200 transition-all duration-200 text-sm"
              >
                Confirm Payment
              </button>
              <button
                v-if="['pending', 'paid'].includes(order.status)"
                @click="cancelOrder(order.id)"
                class="action-button-cancel px-5 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 border border-red-200 transition-all duration-200 text-sm"
              >
                Cancel Order
              </button>
              <span v-if="order.status === 'completed'" class="px-4 py-2 text-sm font-medium text-green-600">
                Order Completed
              </span>
              <span v-if="order.status === 'cancelled'" class="px-4 py-2 text-sm font-medium text-gray-500">
                Order Cancelled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useOrderStore } from '@/stores/order.js';

const orderStore = useOrderStore();
const orders = computed(() => orderStore.orders);

// --- METHODS ---
const loadOrders = async () => {
  // 商家加载订单，后端会自动根据角色 (MERCHANT) 过滤
  await orderStore.fetchOrders({ pageNum: 1, pageSize: 20 });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
  }
};

const getStatusClass = (status) => {
  if (!status) return 'status-pending'; // Default
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'completed') return 'status-completed';
  if (lowerStatus === 'cancelled') return 'status-cancelled';
  if (lowerStatus === 'paid') return 'status-paid';
  return 'status-pending';
};

const formatStatus = (status) => {
    if (!status) return 'Pending';
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        case 'paid': return 'Ready for Pickup';
        case 'pending': return 'Pending Payment';
        default: return status;
    }
};

// --- 订单操作 ---

const verifyOrder = async (order) => {
  // 弹出模态框，要求输入取货码
  const inputCode = prompt(`Please enter the 4-digit pickup code for order ${order.orderNo}:`);
  if (inputCode === order.pickupCode) {
    // 验证取货码成功后，调用核销接口
    const result = await orderStore.verifyOrder(order.id, {
      location: 'Store Front',
      verifierName: 'Merchant'
    });
    
    if (result.success) {
      alert(`Order ${order.orderNo} verified successfully!`);
    } else {
      alert(`Failed to verify order: ${result.message}`);
    }
  } else if (inputCode) {
    alert('Invalid code. Please try again.');
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  const result = await orderStore.updateOrderStatus(orderId, newStatus);
  
  if (result.success) {
    alert(`Order ${orderId} updated to '${newStatus}' successfully!`);
  } else {
    alert(`Failed to update order: ${result.message}`);
  }
};

const cancelOrder = async (orderId) => {
  if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
    const result = await orderStore.cancelOrder(orderId);
    
    if (result.success) {
      alert(`Order ${orderId} cancelled successfully!`);
    } else {
      alert(`Failed to cancel order: ${result.message}`);
    }
  }
};


// --- LIFECYCLE ---
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
/* 手动添加的 CSS 样式，用于在 Tailwind 
  配置失效时提供基本布局。
*/

/* --- 基础布局 --- */
.main-container {
  max-width: 80rem; /* max-w-7xl */
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem; /* p-6 */
}

h1 {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 900; /* font-extrabold */
  color: #111827; /* text-gray-900 */
  margin-bottom: 2rem; /* mb-8 */
  letter-spacing: -0.025em; /* tracking-tight */
}
.text-center { text-align: center; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.text-gray-600 { color: #4b5563; }
.p-6 { padding: 1.5rem; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-700 { color: #b91c1c; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.p-12 { padding: 3rem; }
.bg-white { background-color: #ffffff; }
.border { border-width: 1px; }
.border-gray-200 { border-color: #e5e7eb; }
.text-xl { font-size: 1.25rem; }
.font-semibold { font-weight: 600; }
.text-gray-700 { color: #374151; }
.mt-4 { margin-top: 1rem; }
.text-gray-500 { color: #6b7280; }
.mt-2 { margin-top: 0.5rem; }

/* --- 订单卡片 --- */
.space-y-6 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1.5rem;
}
.order-card {
  background-color: #ffffff;
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-xl */
  overflow: hidden;
  border: 1px solid #f3f4f6; /* border-gray-100 */
}
.order-card-header {
  background-color: #f9fafb; /* bg-gray-50 */
  padding: 1.25rem; /* p-5 */
  border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.font-bold { font-weight: 700; }
.text-sm { font-size: 0.875rem; }

/* --- 订单详情 --- */
.p-5 { padding: 1.25rem; }
.md\:p-6 { padding: 1.5rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-6 { gap: 1.5rem; }
.mb-5 { margin-bottom: 1.25rem; }

@media (min-width: 640px) {
  .sm\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.detail-label {
  font-size: 0.75rem; /* text-xs */
  color: #6b7280; /* text-gray-500 */
  text-transform: uppercase;
  font-weight: 600; /* font-semibold */
}
.detail-value {
  font-weight: 500; /* font-medium */
  font-size: 1.125rem; /* text-lg */
  color: #1f2937; /* text-gray-800 */
}
.detail-value-price {
  color: #16a34a; /* text-green-600 */
  font-weight: 700; /* font-bold */
  font-size: 1.875rem; /* text-3xl */
}
.detail-value-code {
  color: #2563eb; /* text-blue-600 */
  font-family: monospace;
  font-size: 1.875rem; /* text-3xl */
  font-weight: 700; /* font-bold */
  letter-spacing: 0.1em; /* tracking-widest */
}

/* --- 商品列表 --- */
.item-list-container {
  border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
  padding-top: 1.25rem; /* pt-5 */
}
.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.75rem;
}
.order-item-li, .order-item-single {
  display: flex;
  align-items: center;
  gap: 1rem; /* space-x-4 */
  background-color: #f3f4f6; /* bg-gray-100 */
  border-radius: 0.5rem; /* rounded-lg */
  padding: 0.75rem; /* p-3 */
}
.item-image {
  width: 4rem; /* w-16 */
  height: 4rem; /* h-16 */
  border-radius: 0.375rem; /* rounded-md */
  object-fit: cover;
  background-color: #e5e7eb; /* bg-gray-200 */
  flex-shrink: 0;
}
.flex-1 { flex: 1 1 0%; }
.font-medium { font-weight: 500; }
.text-base { font-size: 1rem; }
.text-gray-900 { color: #111827; }

/* --- 按钮 --- */
.action-buttons-container {
  border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
  padding-top: 1rem; /* pt-4 */
  margin-top: 1rem; /* mt-4 */
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem; /* gap-3 */
  justify-content: flex-end;
}
.action-button-verify, .action-button-confirm-payment, .action-button-cancel {
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.action-button-verify {
  background-image: linear-gradient(to right, #2563eb, #9333ea);
  color: white;
  border-radius: 0.75rem; /* rounded-xl */
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  font-size: 0.875rem; /* text-sm */
}
.action-button-confirm-payment {
  padding: 0.5rem 1.25rem; /* px-5 py-2 */
  background-color: #dcfce7; /* bg-green-100 */
  color: #166534; /* text-green-700 */
  border-radius: 0.75rem; /* rounded-xl */
  font-weight: 600; /* font-semibold */
  border: 1px solid #bbf7d0; /* border-green-200 */
  font-size: 0.875rem; /* text-sm */
}
.action-button-confirm-payment:hover {
  background-color: #bbf7d0; /* hover:bg-green-200 */
}
.action-button-cancel {
  padding: 0.5rem 1.25rem; /* px-5 py-2 */
  background-color: #fef2f2; /* bg-red-100 */
  color: #b91c1c; /* text-red-700 */
  border-radius: 0.75rem; /* rounded-xl */
  font-weight: 600; /* font-semibold */
  border: 1px solid #fecaca; /* border-red-200 */
  font-size: 0.875rem; /* text-sm */
}
.action-button-cancel:hover {
  background-color: #fee2e2; /* hover:bg-red-200 */
}


/* --- 状态徽章 --- */
.status-badge {
  border-radius: 9999px; /* rounded-full */
  font-weight: 700; /* font-bold */
  font-size: 0.875rem; /* text-sm */
  padding: 0.5rem 1rem; /* px-4 py-2 */
}
.status-completed { background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; } /* Green */
.status-paid { background-color: #e0f2fe; color: #0284c7; border: 1px solid #7dd3fc; } /* Light Blue */
.status-cancelled { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; } /* Red */
.status-pending { background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; } /* Yellow */

/* --- 加载动画 --- */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin { 
  animation: spin 1s linear infinite;
  width: 4rem; /* w-16 */
  height: 4rem; /* h-16 */
  border-width: 4px;
  border-color: #22c55e; /* border-green-500 */
  border-top-color: transparent;
  border-radius: 9999px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
}
</style>

