<template>
  <main class="home">
    <div class="hero">
      <h1>Welcome to Magic Bag</h1>
      <p>The sweetest candies & desserts in town</p>
      <button>Shop Now</button>
    </div>

    <!-- 排序与筛选控件 -->
    <div class="controls-container">
      <!-- 品类筛选 -->
      <div class="filter-controls">
        <span class="control-label">品类:</span>
        <button @click="activeCategory = 'all'" :class="{ active: activeCategory === 'all' }">显示全部</button>
        <button @click="activeCategory = '面包'" :class="{ active: activeCategory === '面包' }">面包</button>
        <button @click="activeCategory = '甜甜圈'" :class="{ active: activeCategory === '甜甜圈' }">甜甜圈</button>
        <button @click="activeCategory = '蛋糕'" :class="{ active: activeCategory === '蛋糕' }">蛋糕</button>
      </div>
      
      <!-- 价格排序 -->
      <div class="sort-controls">
        <span class="control-label">排序:</span>
        <select v-model="sortOrder">
          <option value="default">默认排序</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
        </select>
      </div>
    </div>

    <!-- 商品展示区 -->
    <div v-if="loading" class="loading-state">
      <p>正在加载商品...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>加载商品失败: {{ error }}</p>
    </div>
    <div v-else class="products">
      <div class="product-card" v-for="bag in filteredAndSortedBags" :key="bag.id">
        <img :src="bag.imageUrl" :alt="bag.title" class="product-img"/>
        <h3>{{ bag.title }}</h3>
        <p>${{ bag.price }}</p>
        <button>Add to Cart</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchMagicBags } from '../services/magicBagService';

const magicBags = ref([]);
const loading = ref(true);
const error = ref(null);

// 新增：用于筛选和排序的状态
const activeCategory = ref('all');
const sortOrder = ref('default');

// 新增：计算属性，用于动态计算筛选和排序后的结果
const filteredAndSortedBags = computed(() => {
  let result = [...magicBags.value];

  // 1. 执行筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(bag => bag.category === activeCategory.value);
  }

  // 2. 执行排序
  if (sortOrder.value === 'price-asc') {
    result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortOrder.value === 'price-desc') {
    result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }

  return result;
});


onMounted(() => {
  
  // ===============================================================
  // 模式一：使用模拟数据 (当前启用)
  // ===============================================================
  console.log("正在使用模拟数据...");
  const mockMagicBags = [
    { id: 1, title: '面包盲盒', price: '9.99', category: '面包', imageUrl: 'https://placehold.co/400x300/f39c12/ffffff?text=%E9%9D%A2%E5%8C%85' },
    { id: 2, title: '甜甜圈惊喜', price: '12.5', category: '甜甜圈', imageUrl: 'https://placehold.co/400x300/e74c3c/ffffff?text=%E7%94%9C%E7%94%9C%E5%9C%88' },
    { id: 3, title: '蛋糕派对', price: '15.00', category: '蛋糕', imageUrl: 'https://placehold.co/400x300/9b59b6/ffffff?text=%E8%9B%8B%E7%B3%95' },
    { id: 4, title: '硬面包', price: '8.88', category: '面包', imageUrl: 'https://placehold.co/400x300/3498db/ffffff?text=%E7%A1%AC%E9%9D%A2%E5%8C%85' },
    { id: 5, title: '巧克力蛋糕', price: '18.9', category: '蛋糕', imageUrl: 'https://placehold.co/400x300/2ecc71/ffffff?text=%E5%B7%A7%E5%85%8B%E5%8A%9B%E8%9B%8B%E7%B3%95' },
    { id: 6, title: '神秘点心', price: '7.5', category: '其他', imageUrl: 'https://placehold.co/400x300/34495e/ffffff?text=%E7%A5%9E%E7%A7%98%E7%82%B9%E5%BF%83' }
  ];
  magicBags.value = mockMagicBags;
  loading.value = false;


  /*
  // ===============================================================
  // 模式二：调用真实 API (当前注释掉)
  // ===============================================================
  const loadRealData = async () => {
    try {
      console.log("正在请求真实 API 数据...");
      loading.value = true;
      error.value = null;
      const response = await fetchMagicBags();
      magicBags.value = response.data.records; 
    } catch (err) {
      console.error("API 请求失败:", err);
      error.value = "无法连接到服务器，请稍后再试。";
    } finally {
      loading.value = false;
    }
  };
  // loadRealData();
  */

});
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background: #fff3e6;
  border-radius: 12px;
  margin-bottom: 40px;
}
.hero h1 { font-size: 48px; color: #e74c3c; margin-bottom: 15px; }
.hero p { font-size: 20px; color: #555; margin-bottom: 30px; }
.hero button {
  background: #e74c3c;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.hero button:hover { background-color: #c0392b; }

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 40px;
  background-color: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 20px;
}
.control-label {
  font-weight: bold;
  margin-right: 15px;
  color: #555;
}
.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}
.filter-controls button.active, .filter-controls button:hover {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}
.sort-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
}

.loading-state, .error-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #555;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  text-align: center;
  padding-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.product-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin-bottom: 15px;
}

.product-card h3 {
  margin-bottom: 10px;
  color: #333;
  font-size: 1.2rem;
}

.product-card p {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.product-card button {
  background: #27ae60;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}
.product-card button:hover {
  background-color: #219d52;
}
</style>

