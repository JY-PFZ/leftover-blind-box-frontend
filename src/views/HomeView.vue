<template>
  <section class="wrap">
    <div class="title-row">
      <h1>All Products</h1>
      <div class="sub">Items: {{ products.length }}</div>
    </div>

    <!-- 排序选项 - 美化设计 -->
    <div class="sort-controls mb-8 p-6 bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl shadow-lg border border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- 标题区域 -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <span class="text-white text-lg">🔀</span>
          </div>
          <span class="text-gray-700 font-bold text-lg">排序方式</span>
        </div>
        
        <!-- 排序按钮组 -->
        <div class="flex gap-3">
          <button 
            @click="changeSort()"
            :class="[
              'group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105',
              sortBy === 'default' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                : sortBy === 'distance-near'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200'
                : sortBy === 'distance-far'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200'
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
            ]"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ getSortIcon() }}</span>
              <span>{{ getSortText() }}</span>
            </div>
            <div v-if="sortBy !== 'default'" class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </button>
        </div>
        
        <!-- 位置信息 -->
        <div v-if="(sortBy === 'distance-near' || sortBy === 'distance-far') && userLocation" class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
          <span class="text-green-600 text-lg">🎯</span>
          <div class="text-sm">
            <span class="text-green-700 font-medium">基于您的位置</span>
            <div class="text-green-600 font-mono text-xs">{{ userLocation.latitude.toFixed(4) }}, {{ userLocation.longitude.toFixed(4) }}</div>
            <div v-if="userLocation.accuracy" class="text-xs text-gray-500">精度: {{ Math.round(userLocation.accuracy) }}m</div>
          </div>
        </div>
      </div>
    </div>

    <div class="product-grid">
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
        :require-login="true"
        @add="cart.add(p)"
        @open="openProduct(p)"
      />
    </div>

    <!-- 产品弹窗 -->
    <ProductModal
      v-if="selected"
      :open="showProduct"
      :product="selected"
      @close="() => { showProduct = false; selected = null }"
      @open-merchant="m => openMerchant(m)"
    />

    <!-- 商家弹窗 -->
    <MerchantModal
      :open="showMerchant"
      :merchant="selectedMerchant"
      :products="merchantProducts"
      @close="() => { showMerchant = false; selectedMerchant = null; merchantProducts = [] }"
      @open-product="p => { selected = p; showProduct = true }"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockProducts, mockMerchants } from '@/mocks/data.js'
import ProductCard from '@/components/ProductCard.vue'
import ProductModal from '@/components/ProductModal.vue'
import MerchantModal from '@/components/MerchantModal.vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { sortMerchantsByDistance } from '@/utils/geoUtils'

const cart = useCartStore()
const user = useUserStore()
const { userLocation } = storeToRefs(user)

const sortBy = ref('default') // 'default', 'distance-near', 'distance-far'
const showProduct = ref(false)
const selected = ref(null)
const showMerchant = ref(false)
const selectedMerchant = ref(null)
const merchantProducts = ref([])

// 按距离排序的商家列表
const sortedMerchants = computed(() => {
  if ((sortBy.value === 'distance-near' || sortBy.value === 'distance-far') && userLocation.value) {
    const sorted = sortMerchantsByDistance(mockMerchants, userLocation.value)
    // 如果是远距离排序，反转数组
    return sortBy.value === 'distance-far' ? sorted.reverse() : sorted
  }
  return mockMerchants
})

// 产品列表 - 根据排序方式返回不同结果
const products = computed(() => {
  console.log('Products computed:', {
    sortBy: sortBy.value,
    hasUserLocation: !!userLocation.value,
    userLocation: userLocation.value
  })
  
  if ((sortBy.value === 'distance-near' || sortBy.value === 'distance-far') && userLocation.value) {
    console.log('Using distance sorting, sortedMerchants:', sortedMerchants.value.map(m => ({
      name: m.name,
      distance: m.distance
    })))
    
    // 按距离排序产品
    const sortedProductsList = []
    sortedMerchants.value.forEach(merchant => {
      const merchantProducts = mockProducts.filter(p => p.merchant && p.merchant.id === merchant.id)
      sortedProductsList.push(...merchantProducts)
    })
    
    console.log('Sorted products list:', sortedProductsList.map(p => ({
      name: p.title,
      merchant: p.merchant.name
    })))
    
    return sortedProductsList
  }
  
  console.log('Using default products')
  return mockProducts
})

// 切换排序方式 - 三态循环：默认 -> 近距离 -> 远距离 -> 默认
const changeSort = () => {
  if (sortBy.value === 'default') {
    sortBy.value = 'distance-near'
  } else if (sortBy.value === 'distance-near') {
    sortBy.value = 'distance-far'
  } else {
    sortBy.value = 'default'
  }
  console.log('排序方式切换为:', sortBy.value)
}

// 获取排序图标
const getSortIcon = () => {
  switch (sortBy.value) {
    case 'default': return '📋'
    case 'distance-near': return '📍'
    case 'distance-far': return '🔍'
    default: return '📋'
  }
}

// 获取排序文本
const getSortText = () => {
  switch (sortBy.value) {
    case 'default': return '默认排序'
    case 'distance-near': return '按距离排序 (近)'
    case 'distance-far': return '按距离排序 (远)'
    default: return '默认排序'
  }
}

// 打开产品详情
function openProduct(p) {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  selected.value = p
  showProduct.value = true
}

// 打开商家详情
function openMerchant(m) {
  selectedMerchant.value = m
  merchantProducts.value = mockProducts.filter(x => x.merchant.id === m.id)
  showMerchant.value = true
}


// 初始化
onMounted(() => {
  console.log('HomeView mounted successfully')
})
</script>

<style scoped>
.wrap{
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.title-row{
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom: 16px;
}
.title-row h1{ font-size: 22px; font-weight: 800; }
.title-row .sub{ color:#666; font-size:13px; }

/* 纯 CSS 网格：自动多列，小卡片 */
.product-grid{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
@media (min-width: 1400px){
  .product-grid{ grid-template-columns: repeat(6, minmax(0,1fr)); }
}
</style>
