<template>
  <div class="cart-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1>🛒 Shopping Cart</h1>
        <p v-if="cart.count > 0" class="cart-summary">
          {{ cart.count }} items • Total: ${{ (cart.total || 0).toFixed(2) }}
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
              <p class="item-price">${{ (item.price || 0).toFixed(2) }}</p>
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
              <button class="btn-secondary" @click="clearCart">
                Clear Cart
              </button>
              <button class="btn-primary" @click="checkout">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 支付模态框 -->
  <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="closePaymentModal">
    <div class="payment-modal">
      <div class="payment-header">
        <h2>💳 选择支付方式</h2>
        <button class="close-btn" @click="closePaymentModal">×</button>
      </div>
      
      <div class="payment-content">
        <!-- 订单摘要 -->
        <div class="order-summary">
          <h3>订单摘要</h3>
          <div class="summary-items">
            <div v-for="item in cart.items" :key="item.id" class="summary-item">
              <span class="item-name">{{ item.title }}</span>
              <span class="item-qty">×{{ item.qty }}</span>
              <span class="item-price">${{ ((item.price || 0) * item.qty).toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-total">
            <span>总计: ${{ (cart.total || 0).toFixed(2) }}</span>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="payment-methods">
          <h3>选择支付方式</h3>
          <div class="payment-options">
            <label class="payment-option" :class="{ active: selectedPayment === 'paypal' }">
              <input type="radio" v-model="selectedPayment" value="paypal" />
              <div class="payment-info">
                <div class="payment-icon">💳</div>
                <div class="payment-details">
                  <div class="payment-name">PayPal</div>
                  <div class="payment-desc">使用PayPal账户支付</div>
                </div>
              </div>
            </label>

            <label class="payment-option" :class="{ active: selectedPayment === 'wechat' }">
              <input type="radio" v-model="selectedPayment" value="wechat" />
              <div class="payment-info">
                <div class="payment-icon">💚</div>
                <div class="payment-details">
                  <div class="payment-name">微信支付</div>
                  <div class="payment-desc">使用微信扫码支付</div>
                </div>
              </div>
            </label>

            <label class="payment-option" :class="{ active: selectedPayment === 'alipay' }">
              <input type="radio" v-model="selectedPayment" value="alipay" />
              <div class="payment-info">
                <div class="payment-icon">🔵</div>
                <div class="payment-details">
                  <div class="payment-name">支付宝</div>
                  <div class="payment-desc">使用支付宝扫码支付</div>
                </div>
              </div>
            </label>

            <label class="payment-option" :class="{ active: selectedPayment === 'mock' }">
              <input type="radio" v-model="selectedPayment" value="mock" />
              <div class="payment-info">
                <div class="payment-icon">🧪</div>
                <div class="payment-details">
                  <div class="payment-name">Mock Pay (测试)</div>
                  <div class="payment-desc">模拟支付，用于测试</div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- 支付按钮 -->
      <div class="payment-actions">
        <button class="btn-cancel" @click="closePaymentModal" :disabled="isProcessing">
          取消
        </button>
        <button 
          class="btn-pay" 
          @click="processPayment" 
          :disabled="!selectedPayment || isProcessing"
        >
          <span v-if="isProcessing">处理中...</span>
          <span v-else>立即支付 ${{ (cart.total || 0).toFixed(2) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { api } from '@/utils/api'
const cart = useCartStore()
const user = useUserStore()

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
    const item = cart.items.find(i => i.id === id)
    if (item) {
      item.qty = newQty
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

// 结算相关状态
const showPaymentModal = ref(false)
const selectedPayment = ref('')
const isProcessing = ref(false)

// 结算
function checkout() {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  if (cart.items.length === 0) {
    alert('购物车为空，无法结算')
    return
  }
  showPaymentModal.value = true
}

// 关闭支付模态框
function closePaymentModal() {
  showPaymentModal.value = false
  selectedPayment.value = ''
  isProcessing.value = false
}

// 获取支付方式名称
function getPaymentName(payment) {
  const names = {
    'paypal': 'PayPal',
    'wechat': '微信支付',
    'alipay': '支付宝',
    'mock': 'Mock Pay (测试)'
  }
  return names[payment] || payment
}

// 处理支付
async function processPayment() {
  console.log('🚀 支付按钮被点击了！')
  console.log('🔍 支付状态检查:', {
    selectedPayment: selectedPayment.value,
    isProcessing: isProcessing.value,
    cartItems: cart.items.length
  })
  
  if (!selectedPayment.value) {
    alert('请选择支付方式')
    return
  }
  
  isProcessing.value = true
  console.log('⏳ 开始支付处理...')
  
  try {
    // 模拟支付处理（2秒延迟）
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 创建订单数据
    const orderData = {
      id: Date.now(),
      orderNo: `ORD${Date.now()}`,
      items: cart.items,
      total: cart.total,
      paymentMethod: selectedPayment.value,
      paymentName: getPaymentName(selectedPayment.value),
      status: 'completed',
      createdAt: new Date().toISOString(),
      customerId: user.userProfile?.id
    }
    
    console.log('🎉 支付成功，创建订单:', orderData)
    
    // 使用真正的订单创建API（本地后端有POST /api/orders端点）
    try {
      console.log('🔄 使用订单API保存订单数据...')
      
      // 为每个商品创建订单
      for (const item of cart.items) {
        // 前端价格计算：商品价格 × 数量 = 总价
        const unitPrice = Number(item.price || 0);
        const quantity = Number(item.qty || 1);
        const totalPrice = Number((unitPrice * quantity).toFixed(2));
        
        console.log('💰 购物车价格计算:', {
          productId: item.id,
          productTitle: item.title,
          unitPrice: unitPrice,
          quantity: quantity,
          totalPrice: totalPrice,
          calculation: `${unitPrice} × ${quantity} = ${totalPrice}`
        });
        
        const orderCreateData = {
          bagId: item.id,
          quantity: item.qty,
          totalPrice: totalPrice, // 保持为数字，让JSON序列化处理
          paymentMethod: selectedPayment.value,
          paymentName: getPaymentName(selectedPayment.value),
          pickupStartTime: '09:00:00',
          pickupEndTime: '18:00:00'
        }
        
        console.log('📤 发送订单数据:', orderCreateData)
        console.log('🔑 当前token:', localStorage.getItem('token'))
        
        const orderResponse = await api.post('/orders', orderCreateData)
        
        console.log('📥 订单API响应:', orderResponse)
        
        if (orderResponse.data && orderResponse.data.code === 1) {
          console.log('✅ 订单保存成功:', orderResponse.data.data)
        } else {
          console.error('❌ 订单保存失败:', orderResponse.data?.message || 'Unknown error')
        }
      }
      
      console.log('✅ 所有订单已保存到后端')
      
    } catch (orderError) {
      console.error('❌ 保存订单到后端失败:', orderError)
      console.error('❌ 错误详情:', {
        message: orderError.message,
        response: orderError.response?.data,
        status: orderError.response?.status,
        url: orderError.config?.url
      })
      
      // 后端保存失败，显示错误信息
      alert(`❌ 订单保存失败！\n\n错误: ${orderError.response?.data?.message || orderError.message}\n\n请重试或联系客服`)
      return; // 停止执行，不显示支付成功
    }
    
    console.log('✅ 前端订单处理完成，订单信息:', orderData)
    
    // 显示支付成功信息
    alert(`🎉 支付成功！\n\n订单号: ${orderData.orderNo}\n支付方式: ${orderData.paymentName}\n金额: $${(orderData.total || 0).toFixed(2)}\n状态: 已完成`)
    
    // 清空购物车
    cart.clear()
    
    // 关闭模态框
    closePaymentModal()
    
    // 触发订单创建成功事件
    window.dispatchEvent(new CustomEvent('order-payment-success', { 
      detail: orderData 
    }))
    
  } catch (error) {
    console.error('支付处理失败:', error)
    alert('支付处理失败，请稍后重试')
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
  padding: 24px 24px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
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
  width: 32px;
  height: 32px;
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
  padding: 0 24px;
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
  background: #f8f9fa;
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
  flex: 1;
  font-weight: 500;
}

.item-qty {
  color: #666;
  margin: 0 12px;
}

.item-price {
  font-weight: 600;
  color: #e74c3c;
}

.summary-total {
  text-align: right;
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
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
  border-color: #007bff;
  background: #f8f9ff;
}

.payment-option.active {
  border-color: #007bff;
  background: #e3f2fd;
}

.payment-option input[type="radio"] {
  margin-right: 16px;
  transform: scale(1.2);
}

.payment-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.payment-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 40px;
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
  margin-top: 24px;
}

.btn-cancel, .btn-pay {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #5a6268;
}

.btn-pay {
  background: #28a745;
  color: white;
}

.btn-pay:hover:not(:disabled) {
  background: #218838;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-modal {
    width: 95%;
    margin: 20px;
  }
  
  .payment-header {
    padding: 20px 20px 0;
  }
  
  .payment-content {
    padding: 0 20px;
  }
  
  .payment-actions {
    padding: 20px;
    flex-direction: column;
  }
  
  .btn-cancel, .btn-pay {
    width: 100%;
  }
}
</style>
