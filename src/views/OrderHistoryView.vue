<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
    <div class="main-container max-w-6xl mx-auto p-4 sm:p-6">
      <!-- Back Button -->
      <div class="mb-8">
        <button @click="$router.push('/')" class="back-button group flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl text-gray-700 hover:text-gray-900 transition-all duration-300 border border-gray-200">
          <div class="back-button-icon w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <span class="font-bold text-lg" aria-hidden="true">&larr;</span>
          </div>
          <span class="font-semibold text-lg">Back to Home</span>
        </button>
      </div>

      <!-- Order History Panel -->
      <div class="order-history-panel bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <!-- Top Decor Bar -->
        <div class="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

        <div class="p-6 md:p-8">
          <!-- Page Title -->
          <div class="text-center mb-10">
            <h1 class="text-4xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order History
            </h1>
            <p class="text-gray-500 text-lg mt-2">View all your past orders</p>
          </div>

          <!-- Loading State -->
          <div v-if="orderStore.isLoading" class="text-center py-16">
            <div class="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-600 text-xl">Loading order history...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="orderStore.error" class="error-state text-center py-16 bg-red-50 p-10 rounded-2xl">
            <h3 class="text-2xl font-bold text-red-700 mb-4 mt-6">Failed to Load</h3>
            <p class="text-red-600 text-lg mb-8">{{ orderStore.error || "Could not load order history. Please try again later." }}</p>
            <button @click="loadOrders" class="action-button px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Reload
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="orders.length === 0" class="empty-state text-center py-16 bg-gray-50 p-10 rounded-2xl">
            <h3 class="text-2xl font-bold text-gray-800 mb-4 mt-6">No Orders Yet</h3>
            <p class="text-gray-600 text-lg mb-8">You haven't placed any orders yet.</p>
            <button @click="$router.push('/')" class="action-button px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Shop Now
            </button>
          </div>

          <!-- Orders List -->
          <div v-else class="space-y-8">
            <div v-for="order in orders" :key="order.id" class="order-card bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
              <!-- Order Header -->
              <div class="order-card-header bg-gray-50 p-4 sm:p-5 border-b border-gray-200">
                <div class="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div class="mb-2 sm:mb-0">
                    <h3 class="text-xl font-bold text-gray-800">Order {{ order.orderNo }}</h3>
                    <p class="text-gray-500 text-sm">{{ formatDate(order.createdAt) }}</p>
                  </div>
                  <div :class="['status-badge px-4 py-2 rounded-full font-bold text-sm', getStatusClass(order.status)]">
                    {{ formatStatus(order.status) }}
                  </div>
                </div>
              </div>
              
              <div class="p-5 md:p-6">
                <!-- Order Details Grid -->
                <div class="order-details-grid grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
                  <div>
                    <p class="detail-label text-xs text-gray-500 uppercase font-semibold">Merchant</p>
                    <p class="detail-value text-gray-800 font-medium text-lg">{{ order.merchantName || 'N/A' }}</p>
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
                    v-if="order.status === 'pending'"
                    @click="confirmPayment(order.id)"
                    class="action-button-confirm px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                  >
                    Confirm Payment
                  </button>
                  <button
                    v-if="order.status === 'paid'"
                    @click="cancelOrder(order.id)"
                    class="action-button-cancel px-5 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 border border-red-200 transition-all duration-200 text-sm"
                  >
                    Cancel Order
                  </button>
                  <button
                    v-if="order.status === 'completed'"
                    class="action-button-review px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                  >
                    Leave a Review
                  </button>
                  <span v-if="order.status === 'pending'" class="px-4 py-2 text-sm text-gray-500">
                    Awaiting payment confirmation...
                  </span>
                </div>
              </div>
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
import { api } from '@/utils/api';

// --- Use the new Store ---
const orderStore = useOrderStore();
const orders = computed(() => orderStore.orders);

// --- METHODS ---
const loadOrders = async () => {
  // Call the action from the store
  await orderStore.fetchOrders({ pageNum: 1, pageSize: 20 });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      // Use en-US locale for English formatting
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
  if (lowerStatus === 'paid') return 'status-paid'; // Style for paid status
  return 'status-pending'; // Includes pending
};

const formatStatus = (status) => {
    if (!status) return 'Pending';
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
        // Return English status labels
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        case 'paid': return 'Ready for Pickup'; // Display 'paid' as Ready for Pickup
        case 'pending': return 'Pending Payment'; // Display 'pending' as Pending Payment
        default: return status; // Fallback
    }
};

/*
const handleMockPayment = async (orderId) => {
  console.log(`TODO: Mock payment for order ${orderId}`);
  alert(`(功能待开发) 模拟支付订单 ${orderId}。\n在真实流程中，这将调用支付网关，成功后后端会将状态更新为 'paid'。`);
  
  // 仅为演示：我们可以调用 updateOrderStatus 来模拟支付成功
  // await orderStore.updateStatus(orderId, 'paid');
  // orderStore.fetchOrders({ pageNum: 1, pageSize: 20 });
};
*/

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

const confirmPayment = async (orderId) => {
  try {
    // 调用 Stripe 支付接口
    const response = await api.post('/api/payment/checkout', null, {
      params: { orderId }
    });
    
    if (response.data?.success && response.data?.checkoutUrl) {
      // 跳转到 Stripe 支付页面
      window.location.href = response.data.checkoutUrl;
    } else {
      alert(`Failed to create payment session: ${response.data?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert(`Payment error: ${error.response?.data?.message || error.message}`);
  }
};


// --- LIFECYCLE ---
onMounted(() => {
  // Call the store action when component mounts
  loadOrders();
});
</script>

<style scoped>
/* 手动添加的 CSS 样式，用于在 Tailwind 
  配置失效时提供基本布局。
*/

/* --- 基础布局 --- */
.main-container {
  max-width: 72rem; /* max-w-6xl */
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem; /* p-6 */
}

.order-history-panel {
  background-color: #ffffff;
  border-radius: 1.5rem; /* rounded-3xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
  overflow: hidden;
  border: 1px solid #f3f4f6; /* border-gray-100 */
}

.back-button {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
  border: 1px solid #e5e7eb; /* border-gray-200 */
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 */
}
.back-button-icon {
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  border-radius: 9999px; /* rounded-full */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-image: linear-gradient(to right, #3b82f6, #a855f7); /* from-blue-500 to-purple-500 */
}

h1 {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 900; /* font-black */
  background-image: linear-gradient(to right, #16a34a, #2563eb, #9333ea);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.text-center { text-align: center; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-2 { margin-top: 0.5rem; }
.text-gray-500 { color: #6b7280; }
.text-lg { font-size: 1.125rem; }

/* --- 状态 --- */
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.bg-red-50 { background-color: #fef2f2; }
.p-10 { padding: 2.5rem; }
.rounded-2xl { border-radius: 1rem; }
.text-red-700 { color: #b91c1c; }
.mb-4 { margin-bottom: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.text-red-600 { color: #dc2626; }
.mb-8 { margin-bottom: 2rem; }
.bg-gray-50 { background-color: #f9fafb; }
.text-gray-800 { color: #1f2937; }

/* --- 订单卡片 --- */
.space-y-8 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 2rem;
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
.text-xl { font-size: 1.25rem; }
.font-bold { font-weight: 700; }
.text-sm { font-size: 0.875rem; }

/* --- 订单详情 --- */
.p-5 { padding: 1.25rem; }
.md\:p-6 { padding: 1.5rem; }
.order-details-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem; /* gap-6 */
  margin-bottom: 1.25rem; /* mb-5 */
}
@media (min-width: 640px) {
  .order-details-grid {
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
.action-button, .action-button-review, .action-button-cancel, .action-button-confirm {
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.action-button, .action-button-review, .action-button-confirm {
  background-image: linear-gradient(to right, #2563eb, #9333ea);
  color: white;
  border-radius: 0.75rem; /* rounded-xl */
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.action-button {
  padding: 1rem 2rem; /* px-8 py-4 */
  font-size: 1.125rem; /* text-lg */
}
.action-button-review {
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  font-size: 0.875rem; /* text-sm */
}
.action-button-confirm {
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  font-size: 0.875rem; /* text-sm */
  background-image: linear-gradient(to right, #16a34a, #2563eb); /* green to blue */
}
.action-button-confirm:hover {
  background-image: linear-gradient(to right, #15803d, #1d4ed8); /* darker green to darker blue */
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

