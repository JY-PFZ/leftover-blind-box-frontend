<template>
  <section class="wrap">
    <div class="title-row">
      <h1>All Products</h1>
      <div class="sub">Items: {{ products.length }}</div>
    </div>

    <!-- 排序选项 -->
    <div class="sort-controls mb-8 p-6 bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl shadow-lg border border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <span class="text-white text-lg">🔀</span>
          </div>
          <span class="text-gray-700 font-bold text-lg">Sort By</span>
        </div>
        
        <div class="flex gap-3">
          <!-- ** 修复: 这是重写后的排序按钮，保证没有重复属性 ** -->
          <button
            @click="changeSort()"
            :class="sortButtonClass"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ sortIcon }}</span>
              <span>{{ sortText }}</span>
            </div>
            <div v-if="sortBy !== 'default'" class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </button>
        </div>
        
        <div v-if="isDistanceSort && userLocation" class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
          <span class="text-green-600 text-lg">🎯</span>
          <div class="text-sm">
            <span class="text-green-700 font-medium">Based on your location</span>
            <div class="text-green-600 font-mono text-xs">{{ userLocation.latitude.toFixed(4) }}, {{ userLocation.longitude.toFixed(4) }}</div>
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

    <!-- Modals -->
    <ProductModal
      v-if="selected"
      :open="showProduct"
      :product="selected"
      @close="() => { selected = false; null }"
      @open-merchant="m => openMerchant(m)"
    />
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
import { ref, computed } from 'vue'
import { mockProducts, mockMerchants } from '@/mocks/data.js'
import ProductCard from '@/components/ProductCard.vue'
import ProductModal from '@/components/ProductModal.vue'
import MerchantModal from '@/components/MerchantModal.vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { sortMerchantsByDistance } from '@/utils/geoUtils'

// --- 核心状态 ---
const cart = useCartStore()
const user = useUserStore()
const { userLocation } = storeToRefs(user)
const sortBy = ref('default')
const selected = ref(null)
const showProduct = ref(false)
const selectedMerchant = ref(null)
const showMerchant = ref(false)
const merchantProducts = ref([])

// --- 排序逻辑 ---
const SORT_MODES = ['default', 'distance-near', 'distance-far', 'price-asc', 'price-desc'];

const products = computed(() => {
  const baseProducts = [...mockProducts];

  switch (sortBy.value) {
    case 'price-asc':
      return baseProducts.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return baseProducts.sort((a, b) => b.price - a.price);
    case 'distance-near':
    case 'distance-far':
      if (!userLocation.value) return baseProducts;
      const sortedMerchants = sortMerchantsByDistance(mockMerchants, userLocation.value);
      if (sortBy.value === 'distance-far') sortedMerchants.reverse();
      
      const distanceSortedProducts = [];
      sortedMerchants.forEach(merchant => {
        const prods = baseProducts.filter(p => p.merchant && p.merchant.id === merchant.id);
        distanceSortedProducts.push(...prods);
      });
      return distanceSortedProducts;
    default:
      return baseProducts;
  }
});

const changeSort = () => {
  const currentIndex = SORT_MODES.indexOf(sortBy.value);
  const nextIndex = (currentIndex + 1) % SORT_MODES.length;
  sortBy.value = SORT_MODES[nextIndex];
};

// --- UI 计算属性 (Computed Properties for UI) ---
const isDistanceSort = computed(() => sortBy.value === 'distance-near' || sortBy.value === 'distance-far');

const sortButtonClass = computed(() => {
  const base = 'group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105';
  const styles = {
    'default': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200',
    'distance-near': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200',
    'distance-far': 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200',
    'price-asc': 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-200',
    'price-desc': 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-200',
  };
  return `${base} ${styles[sortBy.value]}`;
});

const sortIcon = computed(() => ({
  'default': '📋', 'distance-near': '📍', 'distance-far': '🔍', 'price-asc': '💰🔼', 'price-desc': '💰🔽'
}[sortBy.value]));

const sortText = computed(() => ({
  'default': 'Default Sort', 'distance-near': 'Distance (Near)', 'distance-far': 'Distance (Far)',
  'price-asc': 'Price (Low to High)', 'price-desc': 'Price (High to Low)'
}[sortBy.value]));

// --- 事件处理 ---
function openProduct(product) {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  selected.value = product;
  showProduct.value = true;
}

function openMerchant(merchant) {
  selectedMerchant.value = merchant;
  merchantProducts.value = mockProducts.filter(p => p.merchant.id === merchant.id);
  showMerchant.value = true;
}
</script>

<style scoped>
.wrap { max-width: 1200px; margin: 0 auto; padding: 24px; }
.title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
.title-row h1 { font-size: 22px; font-weight: 800; }
.title-row .sub { color:#666; font-size:13px; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.sort-controls { margin-bottom: 2rem; padding: 1.5rem; background-color: #f8f9fa; border-radius: 1rem; }
</style>

