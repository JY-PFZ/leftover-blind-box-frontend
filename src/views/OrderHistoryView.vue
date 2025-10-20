<!-- src/views/OrderHistoryView.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
    <div class="max-w-6xl mx-auto p-4 sm:p-6">
      <!-- 返回按钮 -->
      <div class="mb-8">
        <button @click="$router.push('/')" class="group flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl text-gray-700 hover:text-gray-900 transition-all duration-300 border border-gray-200">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <span class="text-lg">←</span>
          </div>
          <span class="font-semibold text-lg">返回首页</span>
          <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
        </button>
      </div>

      <!-- 订单历史面板 -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <!-- 顶部装饰条 -->
        <div class="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
        
        <div class="p-8">
          <!-- 页面标题 -->
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span class="text-white text-3xl">📦</span>
            </div>
            <h1 class="text-4xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              订单历史
            </h1>
            <p class="text-gray-500 text-lg mt-2">查看您的所有订单记录</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="text-center py-16">
            <div class="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-600 text-xl">正在加载订单历史...</p>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="error" class="text-center py-16">
            <div class="text-8xl mb-6">⚠️</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">加载失败</h3>
            <p class="text-gray-600 text-lg mb-8">无法加载订单历史，请稍后重试</p>
            <button @click="loadOrders" class="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              🔄 重新加载
            </button>
          </div>

          <!-- 空状态 -->
          <div v-else-if="orders.length === 0" class="text-center py-16">
            <div class="text-8xl mb-6">📦</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">暂无订单</h3>
            <p class="text-gray-600 text-lg mb-8">您还没有下过任何订单</p>
            <button @click="$router.push('/')" class="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              🛒 去购物
            </button>
          </div>

          <!-- 订单列表 -->
          <div v-else class="space-y-6">
            <div v-for="order in orders" :key="order.id" class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <!-- 订单头部 -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-white text-xl font-bold">#</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">订单 #{{ order.id }}</h3>
                    <p class="text-gray-500">{{ formatDate(order.createdAt) }}</p>
                  </div>
                </div>
                <div :class="['px-4 py-2 rounded-full font-bold text-sm', getStatusColor(order.status)]">
                  {{ getStatusText(order.status) }}
                </div>
              </div>
              
              <!-- 订单详情 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">👤</span>
                    <div>
                      <p class="text-sm text-gray-500">用户</p>
                      <p class="font-semibold text-gray-800">{{ order.userId }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">📧</span>
                    <div>
                      <p class="text-sm text-gray-500">邮箱</p>
                      <p class="font-semibold text-gray-800">{{ order.userEmail }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">💳</span>
                    <div>
                      <p class="text-sm text-gray-500">支付方式</p>
                      <p class="font-semibold text-gray-800">{{ order.paymentMethod }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🎁</span>
                    <div>
                      <p class="text-sm text-gray-500">商品数量</p>
                      <p class="font-semibold text-gray-800">{{ order.items.length }} 件商品</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">💰</span>
                    <div>
                      <p class="text-sm text-gray-500">总金额</p>
                      <p class="font-semibold text-gray-800">${{ order.totalAmount.toFixed(2) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">📅</span>
                    <div>
                      <p class="text-sm text-gray-500">更新时间</p>
                      <p class="font-semibold text-gray-800">{{ formatDate(order.updatedAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 商品列表 -->
              <div class="mt-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">商品详情</h4>
                <div class="space-y-2">
                  <div v-for="item in order.items" :key="item.productId" class="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span class="text-white text-sm">🍭</span>
                      </div>
                      <div>
                        <p class="font-semibold text-gray-800">{{ item.productName }}</p>
                        <p class="text-sm text-gray-500">数量: {{ item.quantity }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-800">${{ item.totalPrice.toFixed(2) }}</p>
                      <p class="text-sm text-gray-500">单价: ${{ item.productPrice.toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex justify-end gap-3">
                <button 
                  v-if="order.status === 'pending' || order.status === 'confirmed'"
                  @click="cancelOrder(order.id)"
                  class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-lg">❌</span>
                    取消订单
                  </span>
                </button>
                <button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <span class="flex items-center gap-2">
                    <span class="text-lg">👁️</span>
                    查看详情
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const user = useUserStore()
const orderStore = useOrderStore()

// 状态
const isLoading = ref(false)
const error = ref(null)

// 计算属性
const orders = computed(() => {
  if (!user.isLoggedIn) return []
  return orderStore.getUserOrders(user.username)
})

const orderStats = computed(() => {
  if (!user.isLoggedIn) return null
  return orderStore.getOrderStats(user.username)
})

// 加载订单
const loadOrders = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // 初始化订单store
    orderStore.initialize()
    console.log('📦 订单历史加载完成:', orders.value.length, '个订单')
  } catch (err) {
    console.error('加载订单失败:', err)
    error.value = '加载订单失败'
  } finally {
    isLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-blue-600 bg-blue-100',
    shipped: 'text-purple-600 bg-purple-100',
    delivered: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100'
  }
  return colors[status] || 'text-gray-600 bg-gray-100'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待确认',
    confirmed: '已确认',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 取消订单
const cancelOrder = (orderId) => {
  if (confirm('确定要取消这个订单吗？')) {
    orderStore.cancelOrder(orderId)
  }
}

// 组件挂载时加载订单
onMounted(() => {
  loadOrders()
})
</script>

const getStatusClass = (status) => {
  if (!status) return 'pending';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'completed') return 'completed';
  if (lowerStatus === 'cancelled') return 'cancelled';
  return 'pending';
};

// --- LIFECYCLE ---
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
}
.order-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}
.state-message {
  text-align: center;
  padding: 40px;
  color: #777;
  font-size: 1.2rem;
}
.state-message.error {
  color: #e74c3c;
}

/* Orders List Styling */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.order-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.07);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
}
.order-id {
  font-weight: bold;
  color: #333;
}
.order-status {
  font-size: 0.8rem;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
  text-transform: uppercase;
}
.order-status.completed { background-color: #2ecc71; }
.order-status.pending { background-color: #f39c12; }
.order-status.cancelled { background-color: #e74c3c; }

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.order-details p {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #555;
}
.order-details p:last-child {
  margin-bottom: 0;
}
.order-details strong {
  color: #000;
}

.order-summary {
  text-align: right;
}
.order-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
  display: block;
  margin-bottom: 10px;
}
.btn-details {
  background-color: #3498db;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-details:hover {
  background-color: #2980b9;
}
</style>