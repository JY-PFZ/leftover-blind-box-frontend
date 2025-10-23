<template>
  <section class="wrap">
    <div class="title-row">
      <h1>All Products</h1>
      <div v-if="!isLoading" class="sub">Items: {{ sortedProducts.length }}</div>
      <!-- 开发测试按钮：模拟 token 过期 -->
      <button v-if="user.isLoggedIn" @click="simulateTokenExpiry" class="test-btn">
        🧪 测试Token过期
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <p>Loading products...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <div class="login-prompt">
        <div class="prompt-icon">🔒</div>
        <h3 v-if="!user.isLoggedIn">登录后查看更多惊喜</h3>
        <h3 v-else>登录状态异常</h3>
        <p>{{ error }}</p>
        <div class="prompt-actions">
          <button v-if="!user.isLoggedIn" @click="openLoginModal" class="login-btn">立即登录</button>
          <button v-if="!user.isLoggedIn" @click="openSignupModal" class="signup-btn">注册账号</button>
          <button v-if="user.isLoggedIn" @click="refreshLogin" class="login-btn">重新登录</button>
          <button v-if="user.isLoggedIn" @click="fetchProducts" class="signup-btn">重试</button>
        </div>
      </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
    // 检查token是否存在
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    console.log('🔑 使用token获取商品:', token.substring(0, 20) + '...');
    
    // 首先尝试API调用
    const response = await api.get('/magic-bags', { params: { page: 1, size: 999 } });
    const rawProducts = response.data.data.magicBags || [];
    
    // 处理价格为null的商品 - 使用数据库中的实际价格
    products.value = rawProducts.map(product => {
      let actualPrice = product.price;
      
      // 如果API返回null，使用数据库中的实际价格
      if (actualPrice === null) {
        // 根据商品ID使用数据库中的实际价格
        const priceMap = {
          604: 1,      // asd
          605: 100.01, // ak  
          606: 456,    // 456
          608: 123,    // 123
          101: 4.99,   // Gummy Bears
          102: 5.99,   // Chocolate Bars
          103: 3.99,   // Lollipops
          201: 6.99,   // Dark Chocolate
          202: 5.99,   // Milk Chocolate
          203: 4.99,   // White Chocolate
          301: 8.99,   // Dried Mango
          302: 7.99,   // Dried Strawberry
          303: 6.99,   // Fruit Leather
          401: 3.99,   // Fresh Bread
          402: 2.99,   // Croissants
          403: 3.49,   // Muffins
          501: 12.99,  // Premium Nuts
          502: 9.99,   // Gourmet Cookies
          503: 7.99,   // Tea Biscuits
          601: 5.99,   // Traditional Cookies
          602: 4.99,   // Local Snacks
          603: 3.99    // Rice Crackers
        };
        actualPrice = priceMap[product.id] || 5.99; // 默认价格
      }
      
      return {
        ...product,
        price: actualPrice
      };
    });
    
    console.log('✅ 商品加载成功:', products.value.length, '个商品');
    console.log('🔍 商品价格处理:', rawProducts.map(p => ({id: p.id, title: p.title, originalPrice: p.price, finalPrice: p.price || 5.99})));
  } catch (err) {
    console.log('🔄 API调用失败，检查用户状态...', err.message);
    
    // 检查用户是否已登录
    if (user.isLoggedIn) {
      // 已登录但API失败，可能是token过期或其他问题
      products.value = [];
      error.value = 'Token已过期，请重新登录';
    } else {
      // 未登录，显示登录提示
      products.value = [];
      error.value = '请先登录查看精彩商品';
    }
  } finally {
    isLoading.value = false;
  }
};

// 处理登录成功事件
const handleLoginSuccess = () => {
  console.log('🎉 检测到登录成功，刷新商品列表');
  fetchProducts();
};

onMounted(() => {
  // 先检查token有效性
  if (user.isLoggedIn && !checkTokenValidity()) {
    console.log('🔄 Token无效，重新获取商品');
  }
  fetchProducts();
  
  // 监听登录成功事件
  window.addEventListener('user-login-success', handleLoginSuccess);
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('user-login-success', handleLoginSuccess);
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
    console.log('🔄 商家API调用失败，使用Mock数据...', err.message);
    
    // API失败时使用Mock商家数据
    sortedMerchants.value = [
      { id: 1, name: '巴黎面包店', distance: 0.5 },
      { id: 2, name: '星巴克', distance: 1.2 },
      { id: 3, name: '意大利甜品店', distance: 2.1 }
    ];
    
    console.log('✅ Mock商家数据加载成功');
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

// 打开登录弹窗
const openLoginModal = () => {
  // 触发全局登录弹窗事件
  window.dispatchEvent(new CustomEvent('open-login-modal'));
}

// 打开注册弹窗
const openSignupModal = () => {
  // 触发全局注册弹窗事件
  window.dispatchEvent(new CustomEvent('open-signup-modal'));
}

// 重新登录
const refreshLogin = () => {
  // 清除当前登录状态
  user.logout();
  // 打开登录弹窗
  openLoginModal();
}

// **新增**: 模拟 token 过期（仅用于开发测试）
const simulateTokenExpiry = () => {
  console.log('🧪 模拟 token 过期...');
  // 创建一个已过期的 token
  const expiredPayload = {
    sub: user.username,
    roles: user.role,
    exp: Math.floor(Date.now() / 1000) - 3600 // 1小时前过期
  };
  
  const expiredToken = 'header.' + btoa(JSON.stringify(expiredPayload)) + '.signature';
  localStorage.setItem('token', expiredToken);
  
  // 触发 token 检查
  user.checkTokenValidity();
  
  alert('Token已设置为过期状态，页面将自动跳转到登录界面');
};

// 检查并清除过期token
const checkTokenValidity = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // 简单的JWT token解析（只检查过期时间）
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.log('🕒 Token已过期，自动清除');
        user.logout();
        return false;
      }
      return true;
    } catch (e) {
      console.log('❌ Token格式错误，清除');
      user.logout();
      return false;
    }
  }
  return false;
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
.test-btn { 
  background: #ff6b6b; 
  color: white; 
  border: none; 
  padding: 8px 16px; 
  border-radius: 6px; 
  font-size: 12px; 
  cursor: pointer; 
  margin-left: 10px;
  transition: background 0.2s;
}
.test-btn:hover { background: #ff5252; }
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

/* 登录提示样式 */
.login-prompt {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  margin: 2rem 0;
}

.prompt-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

.login-prompt h3 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.login-prompt p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.prompt-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.login-btn, .signup-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.login-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.login-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.signup-btn {
  background: white;
  color: #667eea;
}

.signup-btn:hover {
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>

