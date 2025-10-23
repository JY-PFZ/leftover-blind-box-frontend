<template>
  <div class="cart-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1>🛒 Shopping Cart</h1>
        <!-- 使用 items.length 而不是 count -->
        <p v-if="cart.items && cart.items.length > 0" class="cart-summary">
          {{ cart.items.length }} items • Total: ${{ (cart.total || 0).toFixed(2) }}
        </p>
        <p v-else class="cart-summary">Your cart is empty</p>
      </div>
    </div>

    <!-- 购物车内容 -->
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="cart.isLoading && (!cart.items || cart.items.length === 0)" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your cart...</p>
      </div>


      <!-- 空购物车状态 -->
      <div v-else-if="!cart.items || cart.items.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious treats to get started!</p>
        <RouterLink to="/" class="btn-primary">
          Continue Shopping
        </RouterLink>
      </div>

      <!-- 购物车商品列表 -->
      <!-- 使用 lastUpdated 作为 key 来强制刷新 -->
      <div v-else class="cart-content" :key="cart.lastUpdated">
        <div class="cart-items">
          <!-- 使用 item.magicbagId 作为 key，更稳定 -->
          <div
            v-for="(item, index) in cart.items"
            :key="item.magicbagId || index"
            class="cart-item"
          >
            <!-- 商品图片 -->
            <div class="item-image">
              <div class="image-placeholder">
                🍭
              </div>
            </div>

            <!-- 商品信息 -->
            <div class="item-info">
              <!-- 使用 bagName -->
              <h3 class="item-title">{{ item.bagName }}</h3>
              <p class="item-price">${{ (item.price || 0).toFixed(2) }}</p>
              <p v-if="item.magicbagId" class="item-merchant">
                MagicBag ID: {{ item.magicbagId }}
              </p>
              <!-- 显示 invalid 警告 -->
              <p v-if="!item.magicbagId" class="item-invalid-warning">
                ⚠️ Item data is invalid.
              </p>
            </div>

            <!-- 数量控制 -->
            <div class="item-controls">
              <div class="quantity-control">
                <button
                  class="qty-btn"
                  @click="updateQuantity(item.magicbagId, item.quantity - 1)"
                  :disabled="cart.isLoading || !item.magicbagId || item.quantity <= 1"
                >
                  −
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  @click="updateQuantity(item.magicbagId, item.quantity + 1)"
                  :disabled="cart.isLoading || !item.magicbagId"
                >
                  +
                </button>
              </div>

              <!-- 删除按钮 -->
              <button
                class="remove-btn"
                @click="removeItem(item.magicbagId)"
                :disabled="cart.isLoading || !item.magicbagId"
                title="Remove item"
              >
                🗑️ Remove
              </button>
            </div>

            <!-- 小计 -->
            <div class="item-subtotal">
              <!-- 使用 subtotal -->
              ${{ (item.subtotal || 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- 购物车总结 -->
        <div class="cart-summary-section">
          <div class="summary-card">
            <h3>Order Summary</h3>

            <div class="summary-row">
              <!-- 使用 items.length -->
              <span>Subtotal ({{ cart.items.length }} items):</span>
              <span>${{ (cart.total || 0).toFixed(2) }}</span>
            </div>

            <div class="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>

            <div class="summary-row total-row">
              <span>Total:</span>
              <span>${{ (cart.total || 0).toFixed(2) }}</span>
            </div>

            <div class="checkout-actions">
              <button class="btn-secondary" @click="clearCart" :disabled="cart.isLoading || !cart.items || cart.items.length === 0">
                Clear Cart
              </button>
              <button class="btn-primary" @click="checkout" :disabled="cart.isLoading || !cart.items || cart.items.length === 0">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 支付模态框 (保持不变) -->
  <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="closePaymentModal">
    <div class="payment-modal">
      <div class="payment-header">
        <h2>💳 Choose Payment Method</h2>
        <button class="close-btn" @click="closePaymentModal">×</button>
      </div>

      <div class="payment-content">
        <!-- 订单摘要 -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="summary-items">
            <!-- 使用 item.magicbagId 作为 key -->
            <div v-for="item in cart.items" :key="item.magicbagId" class="summary-item">
              <!-- 使用 bagName -->
              <span class="item-name">{{ item.bagName }}</span>
              <span class="item-qty">×{{ item.quantity }}</span>
              <!-- 使用 subtotal -->
              <span class="item-price">${{ (item.subtotal || 0).toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-total">
            <span>Total: ${{ (cart.total || 0).toFixed(2) }}</span>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="payment-methods">
          <h3>Select Payment Method</h3>
          <div class="payment-options">
            <label class="payment-option" :class="{ active: selectedPayment === 'mock' }">
              <input type="radio" v-model="selectedPayment" value="mock" />
              <div class="payment-info">
                <div class="payment-icon">🧪</div>
                <div class="payment-details">
                  <div class="payment-name">Mock Pay (For Testing)</div>
                  <div class="payment-desc">Simulate payment for testing purposes</div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- 支付按钮 -->
      <div class="payment-actions">
        <button class="btn-cancel" @click="closePaymentModal" :disabled="isProcessing">
          Cancel
        </button>
        <button
          class="btn-pay"
          @click="processPayment"
          :disabled="!selectedPayment || isProcessing"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Pay ${{ (cart.total || 0).toFixed(2) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue' // 导入 watch 和 nextTick
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { api } from '@/utils/api' // 确保导入 api

const cart = useCartStore()
const user = useUserStore()
const router = useRouter()

// Debug: 添加 Watcher 监听 cart.items 的变化，并在 nextTick 中读取
watch(() => cart.items, (newItems) => {
  console.log('[CartView Debug] cart.items changed!');
  // 使用 nextTick 确保在 DOM 更新后读取状态
  nextTick(() => {
    console.log('[CartView Debug] Reading items in nextTick:', JSON.parse(JSON.stringify(cart.items)));
    // 检查新数组中每个 item 是否包含 magicbagId
    if (Array.isArray(cart.items)) {
      cart.items.forEach((item, index) => {
        console.log(`[CartView Debug] Item ${index} (in nextTick):`, JSON.parse(JSON.stringify(item)), 'Has magicbagId:', item && item.hasOwnProperty('magicbagId'), 'Value:', item ? item.magicbagId : 'item is null/undefined');
      });
    }
  });
}, { deep: true, immediate: true }); // 使用 immediate: true 确保初始加载也触发


// 页面加载时自动获取购物车
onMounted(() => {
  if (user.isLoggedIn) {
    cart.fetchCart()
  }
})

// 更新商品数量
async function updateQuantity(magicbagId, newQty) {
  if (!magicbagId) {
    console.error("updateQuantity called with invalid magicbagId:", magicbagId);
    return;
  }
  // 调用 store 中的异步 action
  await cart.updateItemQuantity(magicbagId, newQty);
}

// 删除商品 (移除 confirm)
async function removeItem(magicbagId) {
  if (!magicbagId) {
    console.error("removeItem called with invalid magicbagId:", magicbagId);
    return;
  }
  // 调用 store 中的异步 action
  await cart.removeItemFromCart(magicbagId);
}

// 清空购物车 (移除 confirm)
async function clearCart() {
  // 调用 store 中的异步 action
  await cart.clearServerCart();
}

// --- 结算与支付 ---

const showPaymentModal = ref(false)
const selectedPayment = ref('mock') // 默认选中 mock 支付
const isProcessing = ref(false)

function checkout() {
  if (!user.isLoggedIn) {
    // 如果用户未登录，触发全局事件打开登录弹窗
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  if (!cart.items || cart.items.length === 0) { // 检查 items 是否存在且不为空
    console.warn('Cart is empty, cannot proceed to checkout.');
    alert('Your cart is empty!'); // 添加用户提示
    return;
  }
  showPaymentModal.value = true;
}


function closePaymentModal() {
  showPaymentModal.value = false
  isProcessing.value = false
}

// 处理支付并创建订单
async function processPayment() {
  if (!selectedPayment.value) return;

  isProcessing.value = true;

  try {
    // 1. (可选) 模拟支付延迟
    console.log("Simulating payment processing...");
    await new Promise(resolve => setTimeout(resolve, 500)); // 缩短延迟
    console.log("Mock payment successful.");

    // 2. 调用后端 API 创建订单
    console.log("Attempting to create order from cart via API...");
    const response = await api.post('/orders/from-cart'); // 调用后端接口

    // 3. 处理后端响应
    // 🟢 修正：后端成功 code 是 20000
    if (response.data?.code === 20000 && response.data?.data) {
      const newOrder = response.data.data;
      console.log("✅ Order created successfully via API:", newOrder);

      // 4. 订单创建成功后，刷新购物车状态（后端应该已清空）
      await cart.fetchCart(); // 重新获取购物车，确认是否为空

      // 5. 关闭模态框并跳转
      closePaymentModal();
      router.push('/order-history'); // 跳转到订单历史页面

    } else {
      // API 返回失败或无效数据
      console.error("❌ Failed to create order via API:", response.data);
      // 显示错误信息给用户
      alert(`Failed to create order: ${response.data?.message || 'Unknown error from server'}`);
    }

  } catch (error) {
    console.error('❌ Error during payment processing or order creation:', error);
    // 处理网络错误或其他异常
    alert(`An error occurred: ${error.response?.data?.message || error.message || 'Please try again.'}`);
  } finally {
    isProcessing.value = false;
  }
}
</script>

<style scoped>
/* --- 省略样式 --- */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.spinner {
  border: 4px solid rgba(0,0,0,0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f; /* 或其他主题色 */
  animation: spin 1s ease infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.item-invalid-warning { /* Renamed from item-error-notice for clarity */
  color: #e74c3c;
  font-size: 0.9em; /* Slightly larger */
  margin-top: 4px;
  font-weight: 500;
}


.cart-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 40px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  color: #333;
}

.cart-summary {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-cart h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.empty-cart p {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 16px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
  margin-bottom: 40px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.item-image {
  width: 100px;
  height: 100px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff9a9e, #fecfef); /* 示例渐变 */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.item-info {
  min-width: 0; /* Prevents overflow */
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  /* Optional: prevent long titles from breaking layout */
  /* white-space: nowrap; */
  /* overflow: hidden; */
  /* text-overflow: ellipsis; */
}

.item-price {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #e74c3c; /* Red color for price */
  font-weight: 600;
}

.item-merchant {
  margin: 0;
  font-size: 14px;
  color: #666;
}


.item-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 6px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #e9ecef;
  transform: scale(1.05);
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
}

.remove-btn {
  padding: 8px 16px;
  border: none;
  background: #ff6b6b; /* Softer red */
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: scale(1.02);
}
.remove-btn:disabled {
  background: #f8d7da; /* Slightly lighter red when disabled */
  cursor: not-allowed;
  opacity: 0.7;
}


.item-subtotal {
  font-weight: bold;
  color: #333;
  font-size: 18px;
  text-align: right;
  min-width: 100px;
}

.cart-summary-section {
  position: sticky;
  top: 20px; /* Adjust as needed for header height */
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.summary-card h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
}

.total-row {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c; /* Match item price color */
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 12px;
}

.checkout-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
  text-decoration: none;
  text-align: center;
  display: inline-block; /* Or block if they should take full width */
}

.btn-primary {
  background: #22c55e; /* Green */
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #16a34a; /* Darker green */
  transform: translateY(-1px);
}
.btn-primary:disabled {
    background-color: #a7f3d0; /* Lighter green */
    cursor: not-allowed;
    opacity: 0.7;
}

.btn-secondary {
  background: #6b7280; /* Gray */
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563; /* Darker gray */
  transform: translateY(-1px);
}
.btn-secondary:disabled {
    background-color: #d1d5db; /* Lighter gray */
    cursor: not-allowed;
    opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .cart-item {
    grid-template-columns: 80px 1fr; /* Image, Info */
    gap: 16px;
  }

  /* Make controls and subtotal span full width below info */
  .item-controls {
    grid-column: 1 / -1; /* Span all columns */
    flex-direction: row;
    justify-content: space-between;
    margin-top: 12px;
  }

  .item-subtotal {
    grid-column: 1 / -1; /* Span all columns */
    text-align: left;
    margin-top: 12px;
    font-size: 16px; /* Slightly smaller on mobile */
  }

  .checkout-actions {
    flex-direction: column;
  }
}

/* Payment Modal Styles */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.payment-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px; /* Adjusted padding */
  border-bottom: 1px solid #eee;
  /* margin-bottom: 24px; Removed margin, use padding on content */
}

.payment-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px; /* Fixed size */
  height: 32px; /* Fixed size */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.payment-content {
  padding: 24px; /* Added padding */
}

.order-summary {
  margin-bottom: 32px;
}

.order-summary h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.summary-items {
  background: #f8f9fa; /* Light gray background */
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.summary-item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1; /* Allow name to take up space */
  font-weight: 500;
  padding-right: 8px; /* Add space before qty */
}

.item-qty {
  color: #666;
  margin: 0 12px;
}

.item-price {
  font-weight: 600;
  color: #e74c3c; /* Red price */
}

.summary-total {
  text-align: right;
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c; /* Red total price */
}

.payment-methods h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.payment-option:hover {
  border-color: #007bff; /* Blue border on hover */
  background: #f8f9ff; /* Light blue background */
}

.payment-option.active {
  border-color: #007bff; /* Blue border when active */
  background: #e3f2fd; /* Lighter blue background when active */
}

.payment-option input[type="radio"] {
  margin-right: 16px;
  transform: scale(1.2); /* Make radio button slightly larger */
}

.payment-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.payment-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 40px; /* Fixed width */
  text-align: center;
}

.payment-details {
  flex: 1;
}

.payment-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.payment-desc {
  font-size: 14px;
  color: #666;
}

.payment-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
  margin-top: 24px; /* Ensure space above actions */
}

.btn-cancel, .btn-pay {
  flex: 1; /* Make buttons take equal space */
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #6c757d; /* Gray */
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #5a6268; /* Darker gray */
}

.btn-pay {
  background: #28a745; /* Green */
  color: white;
}

.btn-pay:hover:not(:disabled) {
  background: #218838; /* Darker green */
}

.btn-cancel:disabled, .btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design for Modal */
@media (max-width: 768px) {
  .payment-modal {
    width: 95%;
    margin: 20px; /* Add margin */
  }

  .payment-header {
    padding: 20px 20px 12px; /* Adjust padding */
  }

  .payment-content {
    padding: 20px; /* Adjust padding */
  }

  .payment-actions {
    padding: 20px; /* Adjust padding */
    flex-direction: column; /* Stack buttons */
  }

  .btn-cancel, .btn-pay {
    width: 100%; /* Make buttons full width */
  }
}
</style>
