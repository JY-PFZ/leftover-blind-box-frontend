<template>
  <div class="card">
    <!-- 产品图片区：强化视觉焦点 + 标签 -->
    <div class="thumb relative overflow-hidden">
      <img 
        v-if="product.image" 
        :src="product.image" 
        :alt="product.title" 
        class="w-full h-120 object-cover transition-transform duration-500 hover:scale-105"
      />
      <div v-else class="thumb-fallback w-full h-120 bg-gradient-to-r from-cream-200 to-pink-200"></div>
      
      <!-- 产品标签（热销/新品等） -->
      <div v-if="product.tags && product.tags.length" class="absolute top-3 left-3 flex flex-wrap gap-1">
        <span 
          v-for="tag in product.tags.slice(0, 2)" 
          :key="tag" 
          class="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full shadow-sm"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 产品信息区：排版优化 + 价格对比 -->
    <div class="content p-4">
      <h3 class="title font-bold text-lg text-gray-800 mb-2 line-clamp-1">{{ product.title }}</h3>
      <div class="price-row flex justify-between items-center mb-3">
        <span class="text-red-600 font-bold text-lg">${{ product.price.toFixed(2) }}</span>
        <span v-if="product.originalPrice" class="text-gray-400 line-through text-sm">${{ product.originalPrice.toFixed(2) }}</span>
      </div>
      <p class="description text-gray-500 text-sm mb-4 line-clamp-2">{{ product.description || 'Delicious candy made with premium ingredients.' }}</p>
      
      <!-- 操作按钮区：明确交互 + 视觉层级 -->
      <div class="actions flex gap-2">
        <button 
          class="btn add flex-1" 
          @click="handleAdd"
          @mousedown="() => console.log('Add to Cart button mousedown')"
          @mouseup="() => console.log('Add to Cart button mouseup')"
        >
          Add to Cart
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
import { computed } from 'vue'
import { mockLogin as doMockLogin } from '@/mocks/data.js'
import { useUserStore } from '@/stores/user'

const props = defineProps({ 
  product: { type: Object, required: true },
  requireLogin: { type: Boolean, default: true }
})

const user = useUserStore()
const isLoggedIn = computed(() => user.isLoggedIn)
const emit = defineEmits(['add', 'open'])

function handleAdd() {
  console.log('Add to Cart clicked!', {
    requireLogin: props.requireLogin,
    isLoggedIn: isLoggedIn.value,
    product: props.product
  })
  
  if (props.requireLogin && !isLoggedIn.value) {
    console.log('User not logged in, opening login modal')
    window.dispatchEvent(new Event('open-login'))
    return
  }
  
  console.log('Adding product to cart:', props.product)
  emit('add', props.product)
}

function handleView() {
  if (props.requireLogin && !isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  emit('open', props.product)
}

function mockLogin() {
  doMockLogin(user)
}
</script>

<style scoped>
/* 自定义颜色：甜品店奶油色系 */
:root {
  --cream-200: #fee8d2;
  --pink-200: #ffd1dc;
}

/* 卡片基础样式：分层与 hover 动效 */
.card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

/* 图片区：渐变 fallback +  hover 缩放 */
.thumb {
  height: 120px;
}
.thumb-fallback {
  background: linear-gradient(135deg, var(--cream-200), var(--pink-200));
}
.thumb img {
  transition: transform 0.5s ease;
}

/* 信息区：排版与间距优化 */
.content {
  padding: 12px;
}
.title {
  font-size: 16px;
  margin: 4px 0 6px;
}
.price-row {
  margin-bottom: 8px;
}
.description {
  margin-bottom: 10px;
}

/* 按钮样式：明确交互反馈 */
.actions {
  display: flex;
  gap: 8px;
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
.btn:disabled{ opacity:.6; cursor:not-allowed; }

/* Add to Cart 按钮：突出视觉层级 */
.btn.add {
  padding: 8px 12px;
  background: #22c55e;
  color: #fff;
}
.btn.add:hover {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3);
}

/* View 按钮：图标+文字 统一风格 */
.btn.view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #eef2ff;
  color: #4338ca;
  min-width: 64px;
  justify-content: center;
}
.btn.view .i {
  width: 14px;
  height: 14px;
}
.btn.view:hover {
  background: #e0e7ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(67, 56, 202, 0.2);
}
</style>