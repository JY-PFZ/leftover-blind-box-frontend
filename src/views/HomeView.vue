<template>
  <section class="wrap">
    <div class="title-row">
      <h1>All Products</h1>
      <div v-if="!isLoading" class="sub">Items: {{ products.length }}</div>
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
        <!-- ... 排序 UI 保持不变 ... -->
      </div>

      <div class="product-grid">
        <ProductCard
          v-for="p in sortedProducts"
          :key="p.id"
          :product="p"
          :require-login="true"
          @add="cart.add(p)"
          @open="openProduct(p)"
        />
      </div>
    </div>

    <!-- Modals -->
    <ProductModal
      v-if="selected"
      :open="showProduct"
      :product="selected"
      @close="() => { showProduct = false; selected = null }"
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
import { ref, computed, onMounted } from 'vue';
import { api } from '@/utils/api'; // **步骤 1: 引入 api**
// 不再需要 mock data
// import { mockProducts, mockMerchants } from '@/mocks/data.js'; 
import ProductCard from '@/components/ProductCard.vue';
import ProductModal from '@/components/ProductModal.vue';
import MerchantModal from '@/components/MerchantModal.vue';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { sortMerchantsByDistance } from '@/utils/geoUtils';

const cart = useCartStore();
const user = useUserStore();
const { userLocation } = storeToRefs(user);

const products = ref([]); // **步骤 2: 创建用于存储 API 数据的 ref**
const merchants = ref([]); // (如果需要的话)
const isLoading = ref(true); // 加载状态
const error = ref(null);     // 错误状态

const sortBy = ref('default');
const showProduct = ref(false);
const selected = ref(null);
const showMerchant = ref(false);
const selectedMerchant = ref(null);
const merchantProducts = ref([]);

// **步骤 3: 创建从 API 获取数据的方法**
const fetchProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // 根据你的 MagicBagController，获取所有商品的接口是 GET /api/magic-bags
    // 它返回一个包含 items 数组的 MagicBagListResponse 对象
    const response = await api.get('/magic-bags');
    products.value = response.data.data.items; // 将获取到的商品列表存入 ref
  } catch (err) {
    error.value = err.message || 'An unknown error occurred';
    console.error("Failed to fetch products:", err);
  } finally {
    isLoading.value = false;
  }
};

// **步骤 4: 在组件挂载时调用该方法**
onMounted(() => {
  fetchProducts();
});


// **步骤 5: 修改排序逻辑，使其基于从 API 获取的数据**
const sortedProducts = computed(() => {
  // 创建一个可变副本进行排序，避免直接修改原始 ref
  const productsToSort = [...products.value];

  if (sortBy.value === 'price-asc') {
    return productsToSort.sort((a, b) => a.price - b.price);
  }
  if (sortBy.value === 'price-desc') {
    return productsToSort.sort((a, b) => b.price - a.price);
  }
  
  // 距离排序逻辑需要更复杂的数据结构，暂时保持原样或后续优化
  // 注意：距离排序需要 merchants 数据，你也需要从 API 获取
  // if ((sortBy.value === 'distance-near' || sortBy.value === 'distance-far') && userLocation.value) {
  //   // ... 此处需要先从 API 获取商家列表并计算距离
  // }
  
  return products.value; // 默认返回原始顺序
});


// --- 其他方法 (changeSort, openProduct, 等) 保持不变 ---

const changeSort = () => {
  const modes = ['default', 'price-asc', 'price-desc']; // 简化的排序循环
  const currentIndex = modes.indexOf(sortBy.value);
  const nextIndex = (currentIndex + 1) % modes.length;
  sortBy.value = modes[nextIndex];
};

const getSortText = () => {
  const texts = {
    'default': 'Default Sort',
    'price-asc': 'Price (Low to High)',
    'price-desc': 'Price (High to Low)',
  };
  return texts[sortBy.value] || 'Sort';
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
  // 注意：这里也应该从 API 获取商家产品，而不是从 mock 数据中过滤
  merchantProducts.value = products.value.filter(x => x.merchant?.id === m.id);
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
</style>

