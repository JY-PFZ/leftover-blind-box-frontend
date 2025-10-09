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
              <button class="btn-primary" @click="checkout">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

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

// 结算
function checkout() {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  alert('Checkout functionality coming soon!')
  // 这里可以跳转到结算页面或处理支付
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
</style>
