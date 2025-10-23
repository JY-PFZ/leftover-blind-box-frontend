<template>
  <div class="order-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="icon">📋</span>
        我的订单
      </h1>
      <div class="user-info">
        <span class="user-role">{{ userRole }}</span>
        <span class="user-name">{{ userStore.userProfile?.username || userStore.userProfile?.email }}</span>
      </div>
    </div>

    <!-- 订单状态筛选 -->
    <div class="filter-tabs">
      <button 
        class="tab-btn"
        :class="{ active: currentFilter === 'all' }"
        @click="currentFilter = 'all'"
      >
        全部订单 ({{ orders.length }})
      </button>
      <button 
        class="tab-btn"
        :class="{ active: currentFilter === 'pending' }"
        @click="currentFilter = 'pending'"
      >
        等待取货 ({{ pendingOrders.length }})
      </button>
      <button 
        class="tab-btn"
        :class="{ active: currentFilter === 'completed' }"
        @click="currentFilter = 'completed'"
      >
        已完成 ({{ completedOrders.length }})
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="orderStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>加载订单中...</p>
    </div>

    <!-- 订单列表 -->
    <div v-else-if="filteredOrders.length > 0" class="orders-container">
      <div 
        v-for="order in filteredOrders" 
        :key="order.id"
        class="order-card"
      >
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单号: {{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.orderDate) }}</span>
          </div>
          <div class="order-status">
            <span 
              class="status-badge"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="product-info">
          <div class="product-details">
            <h3 class="product-title">{{ order.productTitle }}</h3>
            <p class="product-price">¥{{ order.productPrice }}</p>
            <p class="product-quantity">数量: {{ order.quantity }}</p>
          </div>
          <div class="total-amount">
            <span class="total-label">总计</span>
            <span class="total-value">¥{{ order.totalAmount }}</span>
          </div>
        </div>

        <!-- 取货信息 -->
        <div class="pickup-info">
          <div class="pickup-time">
            <span class="label">取货时间:</span>
            <span class="value">{{ order.pickupTime }} - {{ order.pickupEndTime }}</span>
          </div>
          <div v-if="order.pickupLocation" class="pickup-location">
            <span class="label">取货地点:</span>
            <span class="value">{{ order.pickupLocation }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="order-actions">
          <!-- 客户操作 -->
          <template v-if="isCustomer">
            <button 
              v-if="order.status === 'pending'"
              class="btn btn-secondary"
              @click="contactMerchant(order)"
            >
              联系商家
            </button>
            <button 
              class="btn btn-primary"
              @click="viewOrderDetails(order)"
            >
              查看详情
            </button>
          </template>

          <!-- 商家操作 -->
          <template v-if="isMerchant">
            <button 
              v-if="order.status === 'pending'"
              class="btn btn-success"
              @click="completeOrder(order.id)"
            >
              标记完成
            </button>
            <button 
              v-if="order.status === 'completed'"
              class="btn btn-secondary"
              @click="markOrderPending(order.id)"
            >
              标记待取货
            </button>
            <button 
              class="btn btn-primary"
              @click="viewOrderDetails(order)"
            >
              查看详情
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>暂无订单</h3>
      <p>{{ getEmptyMessage() }}</p>
      <button 
        v-if="isCustomer"
        class="btn btn-primary"
        @click="goToProducts"
      >
        去下单
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const currentFilter = ref('all')

// 计算属性
const isCustomer = computed(() => userStore.userRole === 'customer')
const isMerchant = computed(() => userStore.userRole === 'merchant')

const orders = computed(() => {
  if (isCustomer.value) {
    return orderStore.customerOrders
  } else if (isMerchant.value) {
    return orderStore.merchantOrders
  }
  return []
})

const pendingOrders = computed(() => orders.value.filter(order => order.status === 'pending'))
const completedOrders = computed(() => orders.value.filter(order => order.status === 'completed'))

const filteredOrders = computed(() => {
  switch (currentFilter.value) {
    case 'pending':
      return pendingOrders.value
    case 'completed':
      return completedOrders.value
    default:
      return orders.value
  }
})

const userRole = computed(() => {
  return isCustomer.value ? '客户' : isMerchant.value ? '商家' : '用户'
})

// 方法
async function loadOrders() {
  if (isCustomer.value) {
    await orderStore.loadCustomerOrders()
  } else if (isMerchant.value) {
    await orderStore.loadMerchantOrders()
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'completed':
      return 'status-completed'
    default:
      return 'status-default'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'pending':
      return '等待取货'
    case 'completed':
      return '已完成'
    default:
      return '未知状态'
  }
}

async function completeOrder(orderId) {
  try {
    const result = await orderStore.completeOrder(orderId)
    if (result.success) {
      alert('订单已标记为完成')
    } else {
      alert('操作失败：' + result.error)
    }
  } catch (error) {
    console.error('❌ 完成订单失败:', error)
    alert('操作失败，请重试')
  }
}

async function markOrderPending(orderId) {
  try {
    const result = await orderStore.markOrderPending(orderId)
    if (result.success) {
      alert('订单已标记为等待取货')
    } else {
      alert('操作失败：' + result.error)
    }
  } catch (error) {
    console.error('❌ 标记订单失败:', error)
    alert('操作失败，请重试')
  }
}

function contactMerchant(order) {
  alert(`联系商家功能待实现\n商家ID: ${order.merchantId}`)
}

function viewOrderDetails(order) {
  alert(`订单详情功能待实现\n订单ID: ${order.id}`)
}

function getEmptyMessage() {
  if (isCustomer.value) {
    return '您还没有任何订单，快去下单吧！'
  } else if (isMerchant.value) {
    return '还没有客户下单，等待订单中...'
  }
  return '暂无订单'
}

function goToProducts() {
  router.push('/')
}

// 生命周期
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.icon {
  font-size: 32px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.user-role {
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.user-name {
  color: #666;
  font-size: 14px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-btn:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.tab-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-id {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.status-pending {
  background: #FFF3CD;
  color: #856404;
  border: 1px solid #FFEAA7;
}

.status-completed {
  background: #D4EDDA;
  color: #155724;
  border: 1px solid #C3E6CB;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.product-details h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.product-price {
  color: #4CAF50;
  font-weight: bold;
  font-size: 16px;
  margin: 0 0 5px 0;
}

.product-quantity {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.total-amount {
  text-align: right;
}

.total-label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.total-value {
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
}

.pickup-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pickup-time, .pickup-location {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pickup-time:last-child, .pickup-location:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  font-weight: 500;
}

.order-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
}
</style>

