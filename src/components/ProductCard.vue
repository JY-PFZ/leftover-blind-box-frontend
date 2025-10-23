<template>
  <div class="card">
    <!-- 产品图片区：适配 imageUrl 并提供 fallback -->
    <div class="thumb relative overflow-hidden">
      <img 
        v-if="product.imageUrl" 
        :src="product.imageUrl" 
        :alt="product.title" 
        class="w-full h-120 object-cover transition-transform duration-500 hover:scale-105"
      />
      <div v-else class="thumb-fallback w-full h-120 bg-gradient-to-r from-cream-200 to-pink-200 flex items-center justify-center">
        <span class="text-gray-500 text-sm">No Image</span>
      </div>
    </div>

    <!-- 产品信息区：优雅处理 null 价格 -->
    <div class="content p-4">
      <h3 class="title font-bold text-lg text-gray-800 mb-2 line-clamp-1">{{ product.title }}</h3>
      <div class="price-row flex justify-between items-center mb-3">
        <!-- **核心修复**: 检查 price 是否为 null -->
        <span v-if="product.price !== null" class="text-red-600 font-bold text-lg">${{ product.price.toFixed(2) }}</span>
        <span v-else class="text-gray-400 text-sm">Price not set</span>
      </div>
      <p class="description text-gray-500 text-sm mb-4 line-clamp-2">{{ product.description || 'Delicious item made with premium ingredients.' }}</p>
      
      <!-- 操作按钮区 -->
      <div class="actions flex gap-2">
        <button 
          class="btn add flex-1" 
          @click="handleOrder"
          :disabled="product.soldOut"
        >
          {{ product.soldOut ? '已售罄' : '立即下单' }}
        </button>
        <button 
          class="btn view" 
          @click="handleView"
        >
          <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span>View</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useOrderStore } from '@/stores/order';
// **注意**: 距离计算暂时无法工作，因为商品数据中缺少完整的商家信息
// import { getMerchantDistance, formatDistance } from '@/utils/geoUtils';

const props = defineProps({ 
  product: { type: Object, required: true },
  requireLogin: { type: Boolean, default: true }
});

const user = useUserStore();
const orderStore = useOrderStore();
const isLoggedIn = computed(() => user.isLoggedIn);

const emit = defineEmits(['add', 'open', 'order']);

function handleAdd() {
  if (props.requireLogin && !isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  emit('add', props.product);
  window.dispatchEvent(new Event('cart-item-added'));
}

async function handleOrder() {
  if (props.requireLogin && !isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  
  if (props.product.soldOut) {
    alert('商品已售罄，无法下单');
    return;
  }
  
  try {
    // 准备订单数据 - 前端价格计算
    const unitPrice = Number(props.product.price || 0);
    const quantity = 1;
    const totalAmount = Number((unitPrice * quantity).toFixed(2));
    
    console.log('💰 商品卡片价格计算:', {
      productId: props.product.id,
      productTitle: props.product.title,
      unitPrice: unitPrice,
      quantity: quantity,
      totalAmount: totalAmount,
      calculation: `${unitPrice} × ${quantity} = ${totalAmount}`
    });
    
    const orderData = {
      productId: props.product.id,
      merchantId: props.product.merchantId,
      customerId: user.userProfile?.id,
      productTitle: props.product.title,
      productPrice: unitPrice,
      quantity: quantity,
      totalAmount: totalAmount,
      status: 'pending',
      orderDate: new Date().toISOString(),
      pickupTime: props.product.pickupStartTime || '09:00:00',
      pickupEndTime: props.product.pickupEndTime || '18:00:00'
    };
    
    console.log('🔄 准备创建订单:', orderData);
    
    const result = await orderStore.createOrder(orderData);
    
    if (result.success) {
      // 不再显示"下单成功"，因为这只是加到购物车
      // alert('下单成功！订单号：' + result.data.id);
      emit('order', result.data);
      window.dispatchEvent(new Event('order-created'));
    } else {
      alert('添加到购物车失败：' + result.error);
    }
  } catch (error) {
    console.error('❌ 下单失败:', error);
    alert('下单失败，请重试');
  }
}

function handleView() {
  if (props.requireLogin && !isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  emit('open', props.product);
}
</script>

<style scoped>
/* 自定义颜色 */
:root {
  --cream-200: #fee8d2;
  --pink-200: #ffd1dc;
}

/* 卡片基础样式 */
.card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

/* 图片区 */
.thumb {
  height: 120px;
}
.thumb-fallback {
  background: linear-gradient(135deg, var(--cream-200), var(--pink-200));
}

/* 信息区 */
.content {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.title {
  font-size: 16px;
  margin: 4px 0 6px;
}
.description {
  margin-bottom: 10px;
  flex-grow: 1; /* 让描述占据多余空间 */
}

/* 按钮样式 */
.actions {
  display: flex;
  gap: 8px;
  margin-top: auto; /* 将按钮推到底部 */
}
.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  transition: all 0.2s ease;
}
.btn.add {
  padding: 8px 12px;
  background: #22c55e;
  color: #fff;
  flex: 1;
}
.btn.add:hover {
  background: #16a34a;
}
.btn.view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #eef2ff;
  color: #4338ca;
  justify-content: center;
}
.btn.view .i {
  width: 14px;
  height: 14px;
}
.btn.view:hover {
  background: #e0e7ff;
}
</style>
