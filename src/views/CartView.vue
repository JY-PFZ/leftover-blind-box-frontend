<template>
  <div class="cart-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1>🛒 Shopping Cart</h1>
        <p v-if="cart.count > 0" class="cart-summary">
          {{ cart.count }} items • Total: ${{ cart.total.toFixed(2) }}
        </p>
        <p v-else class="cart-summary">Your cart is empty</p>
      </div>
    </div>

    <!-- 购物车内容 -->
    <div class="container">
      <!-- 空购物车状态 -->
      <div v-if="cart.items.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious treats to get started!</p>
        <RouterLink to="/" class="btn-primary">
          Continue Shopping
        </RouterLink>
      </div>

      <!-- 购物车商品列表 -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cart.items" 
            :key="item.id" 
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
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-price">${{ item.price.toFixed(2) }}</p>
              <p v-if="item.merchantId" class="item-merchant">
                Merchant ID: {{ item.merchantId }}
              </p>
            </div>

            <!-- 数量控制 -->
            <div class="item-controls">
              <div class="quantity-control">
                <button 
                  class="qty-btn" 
                  @click="updateQuantity(item.id, item.qty - 1)"
                  :disabled="item.qty <= 1"
                >
                  −
                </button>
                <span class="quantity">{{ item.qty }}</span>
                <button 
                  class="qty-btn" 
                  @click="updateQuantity(item.id, item.qty + 1)"
                >
                  +
                </button>
              </div>
              
              <!-- 删除按钮 -->
              <button 
                class="remove-btn" 
                @click="removeItem(item.id)"
                title="Remove item"
              >
                🗑️ Remove
              </button>
            </div>

            <!-- 小计 -->
            <div class="item-subtotal">
              ${{ (item.price * item.qty).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- 购物车总结 -->
        <div class="cart-summary-section">
          <div class="summary-card">
            <h3>Order Summary</h3>
            
            <div class="summary-row">
              <span>Subtotal ({{ cart.count }} items):</span>
              <span>${{ cart.total.toFixed(2) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            
            <div class="summary-row total-row">
              <span>Total:</span>
              <span>${{ cart.total.toFixed(2) }}</span>
            </div>

            <div class="checkout-actions">
              <button class="btn-secondary" @click="clearCart">
                Clear Cart
              </button>
              <button class="btn-primary" @click="showPaymentModal = true">
                💳 Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付模态框 -->
    <div v-if="showPaymentModal" class="payment-modal-overlay" @click="closePaymentModal">
      <div class="payment-modal" @click.stop>
        <div class="payment-header">
          <h2>💳 选择支付方式</h2>
          <button class="close-btn" @click="closePaymentModal">×</button>
        </div>
        
        <div class="payment-content">
          <div class="order-summary">
            <h3>订单详情</h3>
            <div class="order-items">
              <div v-for="item in cart.items" :key="item.id" class="order-item">
                <span>{{ item.title }} × {{ item.qty }}</span>
                <span>${{ (item.price * item.qty).toFixed(2) }}</span>
              </div>
            </div>
            <div class="order-total">
              <span>总计: ${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <div class="payment-methods">
            <h3>支付方式</h3>
            <div class="payment-options">
              <button 
                class="payment-option" 
                :class="{ active: selectedPayment === 'paypal' }"
                @click="selectedPayment = 'paypal'"
              >
                <div class="payment-icon">💳</div>
                <div class="payment-info">
                  <div class="payment-name">PayPal</div>
                  <div class="payment-desc">国际通用支付</div>
                </div>
              </button>

              <button 
                class="payment-option" 
                :class="{ active: selectedPayment === 'wechat' }"
                @click="selectedPayment = 'wechat'"
              >
                <div class="payment-icon">💚</div>
                <div class="payment-info">
                  <div class="payment-name">微信支付</div>
                  <div class="payment-desc">扫码支付</div>
                </div>
              </button>

              <button 
                class="payment-option" 
                :class="{ active: selectedPayment === 'alipay' }"
                @click="selectedPayment = 'alipay'"
              >
                <div class="payment-icon">🔵</div>
                <div class="payment-info">
                  <div class="payment-name">支付宝</div>
                  <div class="payment-desc">扫码支付</div>
                </div>
              </button>

              <button 
                class="payment-option" 
                :class="{ active: selectedPayment === 'mock' }"
                @click="selectedPayment = 'mock'"
              >
                <div class="payment-icon">🧪</div>
                <div class="payment-info">
                  <div class="payment-name">模拟支付</div>
                  <div class="payment-desc">测试用</div>
                </div>
              </button>
            </div>
          </div>

          <div class="payment-actions">
            <button class="btn-secondary" @click="closePaymentModal">
              取消
            </button>
            <button 
              class="btn-primary" 
              @click="processPayment"
              :disabled="!selectedPayment"
            >
              {{ selectedPayment ? `使用${getPaymentName(selectedPayment)}支付` : '请选择支付方式' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const cart = useCartStore()
const user = useUserStore()

// 支付相关状态
const showPaymentModal = ref(false)
const selectedPayment = ref('')
const isProcessing = ref(false)

// 更新商品数量
function updateQuantity(id, newQty) {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  if (newQty <= 0) {
    cart.remove(id)
  } else {
    // 找到商品并更新数量
    const itemIndex = cart.items.findIndex(i => i.id === id)
    if (itemIndex >= 0) {
      cart.items[itemIndex].qty = newQty
    }
  }
}

// 删除商品
function removeItem(id) {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  if (confirm('Are you sure you want to remove this item?')) {
    cart.remove(id)
  }
}

// 清空购物车
function clearCart() {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  if (confirm('Are you sure you want to clear your cart?')) {
    cart.clear()
  }
}

// 关闭支付模态框
function closePaymentModal() {
  showPaymentModal.value = false
  selectedPayment.value = ''
  isProcessing.value = false
}

// 获取支付方式名称
function getPaymentName(paymentType) {
  const names = {
    paypal: 'PayPal',
    wechat: '微信支付',
    alipay: '支付宝',
    mock: '模拟支付'
  }
  return names[paymentType] || '未知'
}

// 处理支付
async function processPayment() {
  if (!selectedPayment.value) {
    alert('请选择支付方式')
    return
  }

  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'))
    return
  }

  isProcessing.value = true

  try {
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 创建订单数据
    const orderData = {
      id: Date.now().toString(),
      userId: user.username,
      items: cart.items.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.qty,
        merchantId: item.merchantId
      })),
      total: cart.total,
      paymentMethod: selectedPayment.value,
      status: 'completed',
      createdAt: new Date().toISOString()
    }

    // 这里可以调用后端API保存订单
    // await api.post('/orders', orderData)
    
    console.log('订单创建成功:', orderData)

    // 显示成功消息
    alert(`🎉 支付成功！\n\n订单号: ${orderData.id}\n支付方式: ${getPaymentName(selectedPayment.value)}\n金额: $${cart.total.toFixed(2)}\n\n感谢您的购买！`)

    // 清空购物车
    cart.clear()
    
    // 关闭模态框
    closePaymentModal()

    // 跳转到订单历史页面
    // router.push('/order-history')

  } catch (error) {
    console.error('支付失败:', error)
    alert('支付失败，请重试')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
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
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.item-info {
  min-width: 0;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.item-price {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #e74c3c;
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
  background: #ff6b6b;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ff5252;
  transform: scale(1.02);
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
  top: 20px;
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
  color: #e74c3c;
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
  display: inline-block;
}

.btn-primary {
  background: #22c55e;
  color: white;
}

.btn-primary:hover {
  background: #16a34a;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 16px;
  }
  
  .item-controls {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .item-subtotal {
    grid-column: 1 / -1;
    text-align: left;
    margin-top: 12px;
  }
  
  .checkout-actions {
    flex-direction: column;
  }
}

/* 支付模态框样式 */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.payment-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.payment-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e5e5;
  transform: scale(1.1);
}

.payment-content {
  padding: 0 24px 24px 24px;
}

.order-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.order-summary h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.order-items {
  margin-bottom: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
  border-top: 1px solid #ddd;
  padding-top: 12px;
}

.payment-methods h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.payment-option:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.payment-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.payment-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
}

.payment-info {
  flex: 1;
}

.payment-name {
  font-size: 16px;
  font-weight: 600;
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
  justify-content: flex-end;
}

.payment-actions .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-modal {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .payment-options {
    grid-template-columns: 1fr;
  }
  
  .payment-actions {
    flex-direction: column;
  }
}
</style>
