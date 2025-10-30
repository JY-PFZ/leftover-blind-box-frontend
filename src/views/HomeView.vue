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
              <span class="text-white text-lg" aria-hidden="true">🔀</span>
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
              :disabled="!userLocation || isDistanceLoading">
              {{ isDistanceLoading ? 'Locating...' : 'Distance (Near)' }}
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
      @close="closeProductModal"
      @open-merchant="m => openMerchant(m)"
      @add-to-cart="handleModalAddToCart"
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

const products = ref([]);
const sortedMerchants = ref([]);
const isLoading = ref(true);
const isDistanceLoading = ref(false);
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
    const response = await api.get('/api/product', { params: { page: 1, size: 999 } });
    console.log('[HomeView] Fetch products response:', response.data);
    
    const successCode = response.data?.code == 1 || response.data?.code == 20000;

    if (successCode && response.data?.data) {
      if (Array.isArray(response.data.data)) {
        products.value = response.data.data;
      } else if (response.data.data.records && Array.isArray(response.data.data.records)) {
        products.value = response.data.data.records;
      } else if (response.data.data.magicBags && Array.isArray(response.data.data.magicBags)) {
        products.value = response.data.data.magicBags;
      } else {
        products.value = [];
        console.warn('[HomeView] Data received but structure is not recognized (expected .data or .data.records)');
      }
    } else {
      console.warn('[HomeView] Unexpected response structure or non-success code:', response.data);
      products.value = [];
      error.value = response.data?.message || 'Invalid data structure or non-success code received';
    }
  } catch (err) {
    console.error('[HomeView] Error fetching products:', err);
    console.error('[HomeView] Error response:', err.response?.data);
    error.value = err.response?.data?.message || err.message || 'An unknown error occurred';
    products.value = [];
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
    const orderedProducts = [];
    const groupedByMerchant = productsToSort.reduce((acc, product) => {
      const merchantId = product.merchantId;
      if (!acc[merchantId]) {
        acc[merchantId] = [];
      }
      acc[merchantId].push(product);
      return acc;
    }, {});

    sortedMerchants.value.forEach(merchant => {
      if (merchant && merchant.id !== undefined && groupedByMerchant[merchant.id]) {
        orderedProducts.push(...groupedByMerchant[merchant.id]);
        delete groupedByMerchant[merchant.id];
      }
    });
    
    Object.values(groupedByMerchant).forEach(group => orderedProducts.push(...group));

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
    distanceSortError.value = "Your location is not available. Please allow location access.";
    return;
  }
  
  isDistanceLoading.value = true;
  distanceSortError.value = null;
  try {
    const response = await api.get('/api/merchant/nearby', {
      params: {
        lat: userLocation.value.latitude,
        lon: userLocation.value.longitude,
        radius: 50
      }
    });
    
    const successCode = response.data?.code == 1 || response.data?.code == 20000;
    if (successCode && Array.isArray(response.data?.data)) {
      sortedMerchants.value = response.data.data;
      if (sortedMerchants.value.length === 0) {
        distanceSortError.value = "No merchants found nearby.";
      } else {
        console.log('[HomeView] Fetched nearby merchants:', sortedMerchants.value);
      }
    } else {
      throw new Error(response.data?.message || 'Failed to fetch nearby merchants');
    }
  } catch (err) {
    distanceSortError.value = err.response?.data?.message || err.message || "Failed to fetch nearby merchants.";
    console.error('[HomeView] Error fetching nearby merchants:', err);
    sortedMerchants.value = [];
  } finally {
    isDistanceLoading.value = false;
  }
};

const changeSort = (mode) => {
  sortBy.value = mode;
  if (mode === 'distance-near') {
    if (sortedMerchants.value.length === 0 && !distanceSortError.value) {
      fetchSortedByDistance();
    }
  } else {
    distanceSortError.value = null;
  }
};

const sortButtonClass = (mode) => {
  const baseClass = 'group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed';
  let activeClass = '';

  if (sortBy.value === mode) {
    switch (mode) {
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
    user.showLoginModal = true;
    return;
  }
  selected.value = p;
  showProduct.value = true;
}

function closeProductModal() {
  selected.value = null;
  showProduct.value = false;
}

function handleModalAddToCart(product, quantity) {
  console.log(`[HomeView] Adding ${quantity} of ${product.title} to cart.`);
  cart.addItemToCart(product, quantity);
  window.dispatchEvent(new Event('cart-item-added'));
  closeProductModal();
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
.title-row h1 {
  font-size: 22px;
  font-weight: 800;
}
.title-row .sub {
  color: #666;
  font-size: 13px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
}
.error-state button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.error-state button:hover {
  background-color: #f0f0f0;
}
.sort-controls {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-image: linear-gradient(to right, white, #EFF6FF, #F3E8FF);
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}
.sort-controls .flex {
  display: flex;
}
.sort-controls .flex-col {
  flex-direction: column;
}
.sort-controls .items-start {
  align-items: flex-start;
}
.sort-controls .gap-4 {
  gap: 1rem;
}
.sort-controls .items-center {
  align-items: center;
}
.sort-controls .gap-3 {
  gap: 0.75rem;
}
.sort-controls .w-10 {
  width: 2.5rem;
}
.sort-controls .h-10 {
  height: 2.5rem;
}
.sort-controls .rounded-xl {
  border-radius: 0.75rem;
}
.sort-controls .justify-center {
  justify-content: center;
}
.sort-controls .shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.sort-controls .text-white {
  color: #fff;
}
.sort-controls .text-lg {
  font-size: 1.125rem;
}
.sort-controls .text-gray-700 {
  color: #374151;
}
.sort-controls .font-bold {
  font-weight: 700;
}
.sort-controls .flex-wrap {
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .sort-controls .sm\:flex-row {
    flex-direction: row;
  }
  .sort-controls .sm\:items-center {
    align-items: center;
  }
}

.text-red-500 {
  color: #ef4444;
}
.text-sm {
  font-size: 0.875rem;
}

.sort-controls button {
  position: relative;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  border: none;
  cursor: pointer;
}
.sort-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.sort-controls button.active-distance {
  background-image: linear-gradient(to right, #22c55e, #10b981);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.1);
}
.sort-controls button.active-default {
  background-image: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(37, 99, 235, 0.1);
}

.sort-controls button.inactive {
  background-color: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.sort-controls button.inactive:hover:not(:disabled) {
  background-color: #EFF6FF;
  color: #2563eb;
  border-color: #BFDBFE;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: scale(1.05);
}
</style>