<template>
  <div class="home-container">
    <!-- Hero Section -->
    <div class="hero">
      <h1>Welcome to Magic Bag</h1>
      <p>Discover amazing food deals and rescue surplus meals!</p>
      <button>Shop Now</button>
    </div>

    <!-- Main Content Section -->
    <section class="products-section">
      <div class="title-row">
        <h1>All Products</h1>
        <div class="sub">Items: {{ displayedProducts.length }}</div>
      </div>

      <!-- Controls for filtering and sorting -->
      <div class="controls-container">
        <div class="filter-group">
          <span>Filter by Category:</span>
          <button @click="setActiveCategory('All')" :class="{ active: activeCategory === 'All' }">All</button>
          <button @click="setActiveCategory('Bakery')" :class="{ active: activeCategory === 'Bakery' }">Bakery</button>
          <button @click="setActiveCategory('Meals')" :class="{ active: activeCategory === 'Meals' }">Meals</button>
          <button @click="setActiveCategory('Produce')" :class="{ active: activeCategory === 'Produce' }">Produce</button>
        </div>
        <div class="sort-group">
          <span>Sort by:</span>
          <button @click="setSortBy('default')" :class="{ active: sortBy === 'default' }">Default</button>
          <button @click="setSortBy('price-asc')" :class="{ active: sortBy === 'price-asc' }">Price: Low to High</button>
          <button @click="setSortBy('price-desc')" :class="{ active: sortBy === 'price-desc' }">Price: High to Low</button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="isLoading && !USE_MOCK_DATA_OVERRIDE" class="loading-message">Loading products...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="displayedProducts.length === 0" class="empty-message">No products available in this category.</div>
      <div v-else class="product-grid">
        <!-- This now correctly uses the ProductCard component -->
        <ProductCard
          v-for="product in displayedProducts"
          :key="product.id"
          :product="product"
          @add="handleAddToCart"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/services/axiosConfig';
import { useCartStore } from '@/stores/cart';
import ProductCard from '@/components/ProductCard.vue'; // Ensures the component is used

// --- MOCK DATA CONTROL ---
// Set this to true to force the component to use mock data, perfect for UI testing.
const USE_MOCK_DATA_OVERRIDE = ref(true); // Let's turn this on by default for now

const cart = useCartStore();
const realProducts = ref([]);
const isLoading = ref(true);
const error = ref(null);
const activeCategory = ref('All');
const sortBy = ref('default');

const mockProducts = [
  { id: 1, title: 'Bakery Surprise Bag', price: 15.99, description: 'A delightful mix of yesterday\'s fresh bread and pastries.', category: 'Bakery' },
  { id: 2, title: 'Fresh Juice Medley', price: 12.50, description: 'Cold-pressed surplus fruits, full of vitamins.', category: 'Produce' },
  { id: 3, title: 'Sushi Platter', price: 25.00, description: 'Assorted sushi rolls nearing their best-by date.', category: 'Meals' },
  { id: 4, title: 'Vegan Salad Box', price: 18.00, description: 'A healthy and hearty vegan salad.', category: 'Meals' },
  { id: 5, title: 'Pastry Selection', price: 14.75, description: 'A sweet selection of croissants and muffins.', category: 'Bakery' },
  { id: 6, title: 'Dinner for Two', price: 35.00, description: 'A complete meal kit for a romantic dinner.', category: 'Meals' },
];

const baseProducts = computed(() => {
  const shouldUseMocks = USE_MOCK_DATA_OVERRIDE.value || (realProducts.value.length === 0 && !isLoading.value);
  const productsToFilter = shouldUseMocks ? mockProducts : realProducts.value;

  if (activeCategory.value === 'All') {
    return productsToFilter;
  }
  return productsToFilter.filter(p => p.category === activeCategory.value);
});

const displayedProducts = computed(() => {
  let products = [...baseProducts.value];
  if (sortBy.value === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  }
  return products;
});

const fetchProducts = async (category = 'All') => {
  if (USE_MOCK_DATA_OVERRIDE.value) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const url = category === 'All' ? '/magic-bags' : `/magic-bags/category/${category}`;
    const response = await apiClient.get(url);
    const bags = response.data?.data?.magicBags || response.data?.data || [];
    realProducts.value = bags;
  } catch (err) {
    error.value = 'Failed to load products. Please try again later.';
    console.error('Fetch products error:', err);
  } finally {
    isLoading.value = false;
  }
};

function setActiveCategory(category) {
  activeCategory.value = category;
  if (!USE_MOCK_DATA_OVERRIDE.value) {
     fetchProducts(category);
  }
}

function setSortBy(criteria) {
  sortBy.value = criteria;
}

function handleAddToCart(product) {
  console.log('Adding to cart:', product.title);
  cart.addToCart(product);
}

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.hero {
  text-align: center;
  padding: 50px 20px;
  background-color: #fff3e6;
  border-radius: 12px;
  margin-bottom: 30px;
}
.hero h1 { font-size: 42px; color: #e74c3c; margin-bottom: 15px; }
.hero p { font-size: 18px; color: #555; margin-bottom: 25px; }
.hero button { background: #e74c3c; color: white; padding: 12px 25px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }

.products-section { padding: 20px; }
.title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.title-row h1 { font-size: 24px; font-weight: 800; }
.title-row .sub { color: #666; font-size: 14px; }

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.filter-group, .sort-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.controls-container span { font-weight: 600; font-size: 14px; }
.controls-container button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.controls-container button.active {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.loading-message, .error-message, .empty-message { text-align: center; padding: 40px; color: #888; }
</style>

