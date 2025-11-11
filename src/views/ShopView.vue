<template>
  <div class="relative min-h-screen">
    <!-- Animated Gradient Background -->
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50">
      <div class="absolute inset-0 opacity-30">
        <div 
          v-for="i in 15" 
          :key="i"
          class="absolute w-96 h-96 rounded-full blur-3xl"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)`,
            animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }"
        ></div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div 
          class="text-center space-y-6"
          :class="{ 'animate-fade-in-up': heroVisible }"
        >
          <h1 class="text-5xl sm:text-6xl md:text-7xl font-black text-ink-900 leading-tight">
            Discover <span class="text-brand">Magic Bags</span>
          </h1>
          <p class="text-xl sm:text-2xl text-ink-700 max-w-2xl mx-auto font-light">
            Surprise yourself with amazing deals while reducing food waste
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <!-- Filter Bar with Glassmorphism -->
      <div 
        class="sticky top-20 z-20 mb-8 rounded-2xl bg-white/70 backdrop-blur-md border border-white/20 shadow-lg p-4"
        :class="{ 'animate-fade-in-up': filterVisible }"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-ink-900">All Products</h2>
            <p v-if="!isLoading" class="mt-1 text-sm text-ink-600">Items: {{ sortedProducts.length }}</p>
          </div>
          <SortBar 
            v-if="!isLoading && !error"
            :sort="currentSort" 
            :onChange="changeSort"
            :isDistanceLoading="isDistanceLoading"
            :userLocation="userLocation"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mt-12 rounded-2xl border border-dashed border-ink-300/70 bg-white/50 backdrop-blur-sm p-10 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p class="mt-4 text-ink-700">Loading products...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mt-12 rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-6 text-center">
        <p class="text-red-700 mb-4">Failed to load products: {{ error }}</p>
        <button 
          @click="fetchProducts"
          class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Products Grid -->
      <div v-if="!isLoading && !error">
        <!-- Distance Sort Error -->
        <div v-if="isDistanceSortActive && distanceSortError" class="mb-4 rounded-lg border border-red-200 bg-red-50/80 backdrop-blur-sm p-3 text-sm text-red-700">
          {{ distanceSortError }}
        </div>

        <!-- Responsive Grid with Animation -->
        <div
          class="grid gap-6
                 sm:grid-cols-2
                 md:grid-cols-3
                 lg:grid-cols-4
                 xl:grid-cols-5"
        >
          <div
            v-for="(p, index) in sortedProducts"
            :key="p.id"
            class="transition-all duration-700"
            :class="{ 
              'opacity-100 translate-y-0': cardVisible[index],
              'opacity-0 translate-y-8': !cardVisible[index]
            }"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <ProductCardNew
              :product="p"
              :require-login="true"
              @add="cart.addItemToCart(p)"
              @open="openProduct(p)"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="sortedProducts.length === 0" class="mt-12 rounded-2xl border border-dashed border-ink-300/70 bg-white/50 backdrop-blur-sm p-10 text-center">
          <p class="text-ink-700">No items found.</p>
          <p class="text-sm text-ink-500 mt-2">Try adjusting your filters or check again later.</p>
        </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { api } from '@/utils/api';
import ProductCardNew from '@/components/ProductCardNew.vue';
import SortBar from '@/components/SortBar.vue';
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

// Animation states
const heroVisible = ref(false);
const filterVisible = ref(false);
const cardVisible = ref({});

const isDistanceSortActive = computed(() => sortBy.value === 'distance-near');

const fetchProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/product', { params: { page: 1, size: 999 } });
    console.log('[ShopView] Fetch products response:', response.data);
    
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
        console.warn('[ShopView] Data received but structure is not recognized (expected .data or .data.records)');
      }
    } else {
      console.warn('[ShopView] Unexpected response structure or non-success code:', response.data);
      products.value = [];
      error.value = response.data?.message || 'Invalid data structure or non-success code received';
    }
  } catch (err) {
    console.error('[ShopView] Error fetching products:', err);
    console.error('[ShopView] Error response:', err.response?.data);
    console.error('[ShopView] Error status:', err.response?.status);
    console.error('[ShopView] Error config:', err.config);
    
    if (err.response?.status === 500) {
      error.value = `Backend server error (500). Please check:
1. Is backend server running on http://localhost:10015?
2. Check backend logs for details.
Error: ${err.response?.data?.message || err.message || 'Unknown error'}`;
    } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
      error.value = `Cannot connect to backend server. Please check:
1. Is backend server running on http://localhost:10015?
2. Check vite.config.js proxy target configuration.`;
    } else {
      error.value = err.response?.data?.message || err.message || 'An unknown error occurred';
    }
    products.value = [];
  } finally {
    isLoading.value = false;
    // Trigger animations after loading
    setTimeout(() => {
      heroVisible.value = true;
      filterVisible.value = true;
      animateCards();
    }, 100);
  }
};

const animateCards = () => {
  sortedProducts.value.forEach((_, index) => {
    setTimeout(() => {
      cardVisible.value[index] = true;
    }, index * 50);
  });
};

const handleScroll = () => {
  const scrollY = window.scrollY;
  if (scrollY > 50 && !heroVisible.value) {
    heroVisible.value = true;
  }
  if (scrollY > 200 && !filterVisible.value) {
    filterVisible.value = true;
  }
};

onMounted(() => {
  fetchProducts();
  window.addEventListener('scroll', handleScroll);
  heroVisible.value = true;
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
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

// Watch sortedProducts to re-animate when sort changes
watch(sortedProducts, () => {
  cardVisible.value = {};
  setTimeout(() => {
    animateCards();
  }, 100);
});

const fetchSortedByDistance = async () => {
  if (!userLocation.value) {
    distanceSortError.value = "Your location is not available. Please allow location access.";
    return;
  }
  
  isDistanceLoading.value = true;
  distanceSortError.value = null;
  try {
    const baseParams = {
      // 兼容后端不同命名：lat/latitude、lon/lng/longitude
      lat: userLocation.value.latitude,
      latitude: userLocation.value.latitude,
      lon: userLocation.value.longitude,
      lng: userLocation.value.longitude,
      longitude: userLocation.value.longitude,
      radius: 100
    };

    console.log('[ShopView] Requesting nearby merchants with params:', baseParams);
    let response = await api.get('/api/merchant/nearby', { params: baseParams });
    
    const successCode = response.data?.code == 1 || response.data?.code == 20000;
    if (successCode && Array.isArray(response.data?.data)) {
      sortedMerchants.value = response.data.data;
      if (sortedMerchants.value.length === 0) {
        // 若 100 范围内为空，自动扩大范围再试一次
        const retryParams = { ...baseParams, radius: 1000 };
        console.warn('[ShopView] No merchants within 100. Retrying with larger radius:', retryParams.radius);
        response = await api.get('/api/merchant/nearby', { params: retryParams });
        if ((response.data?.code == 1 || response.data?.code == 20000) && Array.isArray(response.data?.data)) {
          sortedMerchants.value = response.data.data;
        }
        if (sortedMerchants.value.length === 0) {
          distanceSortError.value = "No merchants found nearby.";
        }
      } else {
        console.log('[ShopView] Fetched nearby merchants:', sortedMerchants.value);
      }
    } else {
      throw new Error(response.data?.message || 'Failed to fetch nearby merchants');
    }
  } catch (err) {
    distanceSortError.value = err.response?.data?.message || err.message || "Failed to fetch nearby merchants.";
    console.error('[ShopView] Error fetching nearby merchants:', err);
    sortedMerchants.value = [];
  } finally {
    isDistanceLoading.value = false;
  }
};

const changeSort = (mode) => {
  const modeMap = {
    'default': 'default',
    'priceAsc': 'price-asc',
    'priceDesc': 'price-desc',
    // 启用真实“距离排序”
    'distance': 'distance-near'
  };
  const oldMode = modeMap[mode] || mode;
  console.log('[ShopView] changeSort called with mode =', mode, 'mapped =', oldMode);
  sortBy.value = oldMode;
  if (oldMode === 'distance-near') {
    if (sortedMerchants.value.length === 0 && !isDistanceLoading.value) {
      fetchSortedByDistance();
    }
  } else {
    distanceSortError.value = null; // 清空距离错误
  }
};

const currentSort = computed(() => {
  const map = {
    'default': 'default',
    'price-asc': 'priceAsc',
    'price-desc': 'priceDesc',
    'distance-near': 'distance'
  };
  return map[sortBy.value] || 'default';
});

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
  console.log(`[ShopView] Adding ${quantity} of ${product.title} to cart.`);
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
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
    opacity: 0.5;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>






