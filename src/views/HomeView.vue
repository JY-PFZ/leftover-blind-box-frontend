<template>
  <div class="relative">
    <!-- Section 1: Hero (Full Screen) -->
    <section 
      ref="heroSection"
      class="h-screen w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-white via-orange-50/30 to-white"
    >
      <!-- Subtle background pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(249,115,22,0.15) 1px, transparent 0); background-size: 40px 40px;"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div 
          class="space-y-8"
          :class="{ 'animate-fade-in-up': heroVisible }"
        >
          <!-- Main Title - Apple Style -->
          <h1 class="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black leading-[0.9] tracking-tight">
            <span class="block text-ink-900">Magic</span>
            <span class="block text-brand mt-2">Bag</span>
          </h1>
          
          <!-- Subtitle - Apple Style -->
          <p class="text-2xl sm:text-3xl md:text-4xl text-ink-700 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Reduce Waste.<br>Discover Magic.
          </p>

          <!-- CTA Button - Apple Style -->
          <div class="pt-8">
            <RouterLink 
              to="/shop" 
              class="inline-block px-10 py-4 bg-ink-900 text-white rounded-full text-lg font-medium hover:bg-ink-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse All Products
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div 
        class="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
        @click="scrollToSection('values')"
      >
        <div class="flex flex-col items-center gap-2 text-ink-500 hover:text-ink-700 transition-colors">
          <span class="text-sm font-medium">Scroll</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>

    <!-- Section 2: Value Propositions (Full Screen) -->
    <section 
      ref="valuesSection"
      class="min-h-screen w-full relative bg-white flex items-center py-32"
    >
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div 
          class="transition-all duration-1000"
          :class="{ 'opacity-100 translate-y-0': valuesVisible, 'opacity-0 translate-y-10': !valuesVisible }"
        >
          <!-- Section Title -->
          <div class="text-center mb-20">
            <h2 class="text-6xl sm:text-7xl md:text-8xl font-black text-ink-900 mb-6 leading-tight">
              Why Magic Bag?
            </h2>
            <p class="text-xl sm:text-2xl text-ink-600 font-light max-w-2xl mx-auto">
              A simple idea. A powerful impact.
            </p>
          </div>

          <!-- Value Cards - Apple Style -->
          <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div
              v-for="(value, index) in values"
              :key="index"
              class="group text-center p-8 lg:p-12 rounded-3xl transition-all duration-500 hover:bg-ink-50/50"
              :class="{ 'opacity-100 translate-y-0': valueVisible[index], 'opacity-0 translate-y-8': !valueVisible[index] }"
              :style="{ transitionDelay: `${index * 150}ms` }"
            >
              <!-- Large Icon -->
              <div class="mb-6 flex justify-center">
                <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                  <component :is="value.icon" class="w-10 h-10 lg:w-12 lg:h-12 text-brand" />
                </div>
              </div>
              
              <!-- Title -->
              <h3 class="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
                {{ value.title }}
              </h3>
              
              <!-- Description -->
              <p class="text-lg sm:text-xl text-ink-600 font-light leading-relaxed">
                {{ value.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Featured Products (Full Screen) -->
    <section 
      ref="productsSection"
      class="min-h-screen w-full relative bg-gradient-to-b from-white to-ink-50/30 flex items-center py-32"
    >
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div 
          class="transition-all duration-1000"
          :class="{ 'opacity-100 translate-y-0': productsVisible, 'opacity-0 translate-y-10': !productsVisible }"
        >
          <!-- Section Title -->
          <div class="text-center mb-20">
            <h2 class="text-6xl sm:text-7xl md:text-8xl font-black text-ink-900 mb-6 leading-tight">
              Featured Products
            </h2>
            <p class="text-xl sm:text-2xl text-ink-600 font-light max-w-2xl mx-auto">
              Discover amazing deals waiting for you
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-20">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
            <p class="mt-6 text-ink-600 text-lg">Loading products...</p>
          </div>

          <!-- Error State -->
          <div v-if="error" class="text-center py-20">
            <p class="text-red-600 mb-4">{{ error }}</p>
            <button 
              @click="fetchFeaturedProducts"
              class="px-6 py-3 bg-brand text-white rounded-full font-medium hover:bg-brand-600 transition-colors"
            >
              Try Again
            </button>
          </div>

          <!-- Featured Products Grid - Apple Style -->
          <div v-if="!isLoading && !error && featuredProducts.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            <div
              v-for="(product, index) in featuredProducts"
              :key="product.id"
              class="group cursor-pointer"
              :class="{ 'opacity-100 translate-y-0': productVisible[index], 'opacity-0 translate-y-8': !productVisible[index] }"
              :style="{ transitionDelay: `${index * 100}ms` }"
              @click="openProduct(product)"
            >
              <!-- Product Card - Apple Style -->
              <div class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <!-- Product Image -->
                <div class="aspect-square bg-gradient-to-br from-orange-100 to-pink-100 relative overflow-hidden">
                  <img 
                    v-if="product.image" 
                    :src="product.image" 
                    :alt="product.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-ink-400 text-4xl">
                    🎁
                  </div>
                </div>
                
                <!-- Product Info -->
                <div class="p-6">
                  <h3 class="text-xl font-semibold text-ink-900 mb-2 line-clamp-2">
                    {{ product.title }}
                  </h3>
                  <p class="text-2xl font-bold text-brand mb-1">
                    ${{ (product.price || 0).toFixed(2) }}
                  </p>
                  <p v-if="product.originalPrice && product.originalPrice > product.price" class="text-sm text-ink-500 line-through">
                    ${{ product.originalPrice.toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!isLoading && !error && featuredProducts.length === 0" class="text-center py-20">
            <p class="text-ink-600 text-lg">No featured products available at the moment.</p>
          </div>

          <!-- CTA Button -->
          <div v-if="!isLoading && !error" class="text-center">
            <RouterLink 
              to="/shop" 
              class="inline-block px-10 py-4 bg-ink-900 text-white rounded-full text-lg font-medium hover:bg-ink-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View All Products
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Brand Story (Full Screen) -->
    <section 
      ref="storySection"
      class="min-h-screen w-full relative bg-white flex items-center py-32"
    >
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div 
          class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          :class="{ 'opacity-100 translate-y-0': storyVisible, 'opacity-0 translate-y-10': !storyVisible }"
        >
          <!-- Left: Text Content -->
          <div class="space-y-8">
            <h2 class="text-6xl sm:text-7xl md:text-8xl font-black text-ink-900 leading-tight">
              Our Story
            </h2>
            <p class="text-xl sm:text-2xl text-ink-700 font-light leading-relaxed">
              At Magic Bag, we believe that good food shouldn't go to waste. Every purchase helps reduce food waste while giving you amazing deals.
            </p>
            <p class="text-lg sm:text-xl text-ink-600 font-light leading-relaxed">
              Join thousands of customers who are making a difference, one Magic Bag at a time.
            </p>
            <div class="pt-4">
              <RouterLink 
                to="/about" 
                class="inline-flex items-center gap-2 text-lg font-medium text-brand hover:text-brand-600 transition-colors"
              >
                Learn More
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </RouterLink>
            </div>
          </div>

          <!-- Right: Visual Element -->
          <div class="relative">
            <div class="aspect-square rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 overflow-hidden shadow-2xl">
              <!-- Decorative Pattern -->
              <div class="absolute inset-0 opacity-20">
                <div 
                  v-for="i in 20" 
                  :key="i"
                  class="absolute w-32 h-32 rounded-full blur-2xl"
                  :style="{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)`,
                    animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }"
                ></div>
              </div>
              <!-- Center Content -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="text-8xl mb-4">🎁</div>
                  <p class="text-2xl font-light">Magic Happens Here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Recycle, DollarSign, Heart } from 'lucide-vue-next';
import { api } from '@/utils/api';
import ProductModal from '@/components/ProductModal.vue';
import MerchantModal from '@/components/MerchantModal.vue';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';

const cart = useCartStore();
const user = useUserStore();

// Value propositions data
const values = [
  {
    icon: Recycle,
    title: 'Reduce Waste',
    description: 'Help local merchants reduce food waste while getting amazing deals.'
  },
  {
    icon: DollarSign,
    title: 'Save Money',
    description: 'Discover quality products at unbeatable prices in every Magic Bag.'
  },
  {
    icon: Heart,
    title: 'Support Local',
    description: 'Connect with local merchants and support your community.'
  }
];

// Animation states
const heroVisible = ref(false);
const valuesVisible = ref(false);
const productsVisible = ref(false);
const storyVisible = ref(false);
const valueVisible = ref({});
const productVisible = ref({});

// Products
const featuredProducts = ref([]);
const isLoading = ref(false);
const error = ref(null);

const showProduct = ref(false);
const selected = ref(null);
const showMerchant = ref(false);
const selectedMerchant = ref(null);
const merchantProducts = ref([]);

// Refs for sections
const heroSection = ref(null);
const valuesSection = ref(null);
const productsSection = ref(null);
const storySection = ref(null);

// Fetch featured products (limit to 8)
const fetchFeaturedProducts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/product', { params: { page: 1, size: 8 } });
    console.log('[HomeView] Fetch featured products response:', response.data);
    
    const successCode = response.data?.code == 1 || response.data?.code == 20000;

    if (successCode && response.data?.data) {
      let products = [];
      if (Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (response.data.data.records && Array.isArray(response.data.data.records)) {
        products = response.data.data.records;
      } else if (response.data.data.magicBags && Array.isArray(response.data.data.magicBags)) {
        products = response.data.data.magicBags;
      }
      
      // Take first 8 products as featured
      featuredProducts.value = products.slice(0, 8);
      
      // Animate products
      setTimeout(() => {
        featuredProducts.value.forEach((_, index) => {
          setTimeout(() => {
            productVisible.value[index] = true;
          }, index * 100);
        });
      }, 100);
    } else {
      featuredProducts.value = [];
      error.value = response.data?.message || 'Failed to load products';
    }
  } catch (err) {
    console.error('[HomeView] Error fetching featured products:', err);
    error.value = err.response?.data?.message || err.message || 'An unknown error occurred';
    featuredProducts.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Scroll to section
const scrollToSection = (sectionName) => {
  const sectionMap = {
    'values': valuesSection.value,
    'products': productsSection.value,
    'story': storySection.value
  };
  const section = sectionMap[sectionName];
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

// Intersection Observer for scroll animations
const setupIntersectionObserver = () => {
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === valuesSection.value) {
          valuesVisible.value = true;
          // Animate value cards
          setTimeout(() => {
            values.forEach((_, index) => {
              setTimeout(() => {
                valueVisible.value[index] = true;
              }, index * 150);
            });
          }, 100);
        } else if (entry.target === productsSection.value) {
          productsVisible.value = true;
        } else if (entry.target === storySection.value) {
          storyVisible.value = true;
        }
      }
    });
  }, observerOptions);

  if (valuesSection.value) observer.observe(valuesSection.value);
  if (productsSection.value) observer.observe(productsSection.value);
  if (storySection.value) observer.observe(storySection.value);
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
  merchantProducts.value = featuredProducts.value.filter(x => x.merchantId === m.id);
  showMerchant.value = true;
}

onMounted(() => {
  heroVisible.value = true;
  fetchFeaturedProducts();
  setTimeout(() => {
    setupIntersectionObserver();
  }, 500);
});

onUnmounted(() => {
  // Cleanup if needed
});
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
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
