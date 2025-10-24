<template>
  <section class="wrap">
    <div class="title-row">
      <h1>All Products</h1>
      <div v-if="!isLoading" class="sub">Items: {{ sortedProducts.length }}</div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <p>Loading products...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <p>Failed to load products: {{ error }}</p>
      <button @click="fetchProducts">Try Again</button>
    </div>

    <!-- 成功加载后的内容 -->
    <div v-if="!isLoading && !error">
      <!-- 排序选项 -->
      <div class="sort-controls mb-8 p-6 bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl shadow-lg border border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <span class="text-white text-lg">🔀</span>
            </div>
            <span class="text-gray-700 font-bold text-lg">Sort By</span>
          </div>
          
          <div class="flex flex-wrap gap-3">
            <button 
              @click="changeSort('default')" 
              :class="sortButtonClass('default')">
              Default
            </button>
            <button 
              @click="changeSort('price-asc')" 
              :class="sortButtonClass('price-asc')">
              Price Low-High
            </button>
            <button 
              @click="changeSort('price-desc')" 
              :class="sortButtonClass('price-desc')">
              Price High-Low
            </button>
            <button 
              @click="changeSort('distance-near')" 
              :class="sortButtonClass('distance-near')"
              :disabled="!userLocation">
              Distance (Near)
            </button>
          </div>
          
          <div v-if="isDistanceSortActive && distanceSortError" class="text-red-500 text-sm">
            {{ distanceSortError }}
          </div>
        </div>
      </div>

      <div class="product-grid">
        <ProductCard
          v-for="p in sortedProducts"
          :key="p.id"
          :product="p"
          :require-login="true"
          @add="cart.addItemToCart(p)"
          @open="openProduct(p)"
        />
      </div>
    </div>

    <!-- Modals -->
    <ProductModal
      v-if="selected"
      :open="showProduct"
      :product="selected"
      @close="() => { selected = null; showProduct = false; }"
      @open-merchant="m => openMerchant(m)"
    />
    <MerchantModal
      :open="showMerchant"
      :merchant="selectedMerchant"
      :products="merchantProducts"
      @close="() => { showMerchant = false; selectedMerchant = null; merchantProducts = []; }"
      @open-product="p => { selected = p; showProduct = true; }"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '@/utils/api';
import ProductCard from '@/components/ProductCard.vue';
import ProductModal from '@/components/ProductModal.vue';
import MerchantModal from '@/components/MerchantModal.vue';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const cart = useCartStore();
const user = useUserStore();
const { userLocation } = storeToRefs(user);

const products = ref([]); // 存储所有商品
const sortedMerchants = ref([]); // 存储按距离排好序的商家
const isLoading = ref(true);
const error = ref(null);
const distanceSortError = ref(null);
const sortBy = ref('default');

const showProduct = ref(false);
const selected = ref(null);
const showMerchant = ref(false);
const selectedMerchant = ref(null);
const merchantProducts = ref([]);

const isDistanceSortActive = computed(() => sortBy.value === 'distance-near');

const fetchProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/product/magic-bags', { params: { page: 1, size: 999 } });
    console.log('[HomeView] Fetch products response:', response.data);
    products.value = response.data.data.magicBags || [];
  } catch (err) {
    console.error('[HomeView] Error fetching products:', err);
    console.error('[HomeView] Error response:', err.response?.data);
    error.value = err.message || 'An unknown error occurred';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

const sortedProducts = computed(() => {
  const productsToSort = [...products.value];
  
  if (sortBy.value === 'distance-near' && sortedMerchants.value.length > 0) {
    // 根据已排序的商家列表，重新排列商品
    const orderedProducts = [];
    const productMap = new Map(productsToSort.map(p => [p.id, p]));
    
    sortedMerchants.value.forEach(merchant => {
      productsToSort.forEach(product => {
        if (product.merchantId === parseInt(merchant.id)) {
            orderedProducts.push(product);
        }
      });
    });
    return orderedProducts;
  }

  switch (sortBy.value) {
    case 'price-asc':
      return productsToSort.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc':
      return productsToSort.sort((a, b) => (b.price || 0) - (a.price || 0));
    default:
      return productsToSort;
  }
});

const fetchSortedByDistance = async () => {
  if (!userLocation.value) {
    distanceSortError.value = "Your location is not available.";
    return;
  }
  
  isLoading.value = true;
  distanceSortError.value = null;
  try {
    const response = await api.get('/merchants/nearby', {
      params: {
        lat: userLocation.value.latitude,
        lon: userLocation.value.longitude,
      }
    });
    sortedMerchants.value = response.data.data || [];
    if(sortedMerchants.value.length === 0){
      distanceSortError.value = "No merchants found nearby.";
    }
  } catch (err) {
    distanceSortError.value = "Failed to fetch nearby merchants.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const changeSort = (mode) => {
  sortBy.value = mode;
  if (mode === 'distance-near') {
    fetchSortedByDistance();
  }
};

const sortButtonClass = (mode) => {
  const baseClass = 'group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105';
  let activeClass = '';

  if (sortBy.value === mode) {
    switch(mode) {
      case 'distance-near':
        activeClass = 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200';
        break;
      default:
        activeClass = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200';
    }
    return `${baseClass} ${activeClass}`;
  }
  return `${baseClass} bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md`;
};

function openProduct(p) {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  selected.value = p;
  showProduct.value = true;
}

function openMerchant(m) {
  selectedMerchant.value = m;
  merchantProducts.value = products.value.filter(x => x.merchantId === m.id);
  showMerchant.value = true;
}
</script>

<style scoped>
.wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.title-row h1 { font-size: 22px; font-weight: 800; }
.title-row .sub { color: #666; font-size: 13px; }
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
}
.sort-controls {
  margin-bottom: 2rem;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
