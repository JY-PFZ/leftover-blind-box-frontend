<!-- src/views/CartView.vue -->
<template>
  <div class="cart-container">
    <h1>My Shopping Cart</h1>
    
    <div v-if="cart.isLoading" class="message-box">正在加载您的购物车...</div>
    <div v-else-if="cart.error" class="message-box error">{{ cart.error }}</div>
    <div v-else-if="cart.isEmpty" class="message-box">
      您的购物车是空的，快去逛逛吧！
    </div>
    
    <div v-else class="cart-content">
      <!-- 商品列表 -->
      <div class="cart-items-list">
        <div v-for="item in cart.items" :key="item.magicBagId" class="cart-item">
          <div class="item-info">
            <!-- 修正：确保从嵌套对象中取值 -->
            <h2 class="item-title">{{ item.magicBag?.title || '神秘惊喜盲盒' }}</h2>
            <p class="item-quantity">数量: {{ item.quantity }}</p>
          </div>
          <div class="item-actions">
            <p class="item-price">¥{{ (item.magicBag?.price * item.quantity).toFixed(2) }}</p>
            <!-- 修正：调用正确的移除函数 -->
            <button @click="handleRemove(item.magicBagId)" class="remove-btn">移除</button>
          </div>
        </div>
      </div>
      
      <!-- 购物车总结 -->
      <div class="cart-summary">
        <h2>购物车总结</h2>
        <div class="summary-row">
          <span>总计 ({{ cart.count }} 件)</span>
          <span>¥{{ cart.total.toFixed(2) }}</span>
        </div>
        <button class="checkout-btn">去结算</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();

const handleRemove = (magicBagId) => {
  if (confirm('您确定要移除这个商品吗？')) {
    cart.removeFromCart(magicBagId);
  }
};

// 组件加载时，调用 fetchCart。
// store 内部的 USE_MOCK_DATA 开关会决定是调用API还是直接返回。
onMounted(() => {
  cart.fetchCart();
});
</script>

<style scoped>
.cart-container {
  max-width: 960px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  color: #333;
}
.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
.cart-item:hover {
  transform: translateY(-3px);
}
.item-title { font-size: 1.2rem; font-weight: 600; margin: 0 0 5px 0; }
.item-quantity { color: #666; margin: 0; }
.item-actions { text-align: right; }
.item-price { font-weight: 600; margin-bottom: 10px; font-size: 1.1rem; color: #e74c3c; }
.remove-btn {
  background-color: #ffcccc;
  color: #e74c3c;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.remove-btn:hover {
  background-color: #ffb3b3;
}
.cart-summary {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  position: sticky;
  top: 120px;
}
.cart-summary h2 {
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 1.1rem;
}
.checkout-btn {
  width: 100%;
  padding: 15px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.checkout-btn:hover {
  background-color: #229954;
}
.message-box {
  text-align: center;
  padding: 50px;
  background: #fff;
  border-radius: 8px;
  color: #777;
  font-size: 1.2rem;
}
.message-box.error { color: #e74c3c; font-weight: 500; }
</style>