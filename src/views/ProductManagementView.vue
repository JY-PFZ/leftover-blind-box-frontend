<template>
  <div class="product-management">
    <header class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>商品管理</h1>
          <p>管理您的"魔法袋"商品</p>
        </div>
        <button @click="goBackToDashboard" class="back-btn">
          ← 返回仪表板
        </button>
      </div>
    </header>

    <!-- 添加商品按钮 -->
    <div class="action-bar">
      <button @click="showAddModal = true" class="add-product-btn">
        ➕ 添加新商品
      </button>
      <div class="stats">
        <span class="stat-item">总商品: {{ merchantStore.totalProducts }}</span>
        <span class="stat-item">售罄: {{ merchantStore.soldOutCount }}</span>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="products-grid">
      <div 
        v-for="product in merchantStore.products" 
        :key="product.id" 
        class="product-card"
        :class="{ 'sold-out': product.soldOut }"
      >
        <div class="product-image">
          <img :src="product.cover" :alt="product.title" />
          <div v-if="product.soldOut" class="sold-out-badge">售罄</div>
        </div>
        
        <div class="product-info">
          <h3>{{ product.title }}</h3>
          <p class="category">{{ getCategoryName(product.category) }}</p>
          <p class="price">¥{{ product.price.toFixed(2) }}</p>
        </div>

        <div class="product-actions">
          <div class="price-edit">
            <input 
              v-model="editPrices[product.id]" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="新价格"
              class="price-input"
            />
            <button 
              @click="updateProductPrice(product.id)"
              class="update-price-btn"
              :disabled="!editPrices[product.id]"
            >
              更新价格
            </button>
          </div>
          
          <div class="toggle-actions">
            <button 
              @click="toggleSoldOut(product.id)"
              :class="product.soldOut ? 'restock-btn' : 'sold-out-btn'"
            >
              {{ product.soldOut ? '重新上架' : '标记售罄' }}
            </button>
            <button @click="deleteProduct(product.id)" class="delete-btn">
              删除商品
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加商品模态框 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal">
        <h2>添加新商品</h2>
        <form @submit.prevent="addNewProduct" class="add-product-form">
          <div class="form-group">
            <label>商品名称</label>
            <input v-model="newProduct.title" type="text" required placeholder="例如：法式面包" />
          </div>
          
          <div class="form-group">
            <label>价格 (¥)</label>
            <input v-model="newProduct.price" type="number" step="0.01" min="0" required placeholder="0.00" />
          </div>
          
          <div class="form-group">
            <label>商品类别</label>
            <select v-model="newProduct.category" required>
              <option value="bread">面包</option>
              <option value="drink">饮品</option>
              <option value="dessert">甜品</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>商品图片URL</label>
            <input v-model="newProduct.cover" type="url" placeholder="https://example.com/image.jpg" />
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn">添加商品</button>
            <button type="button" @click="closeAddModal" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMerchantStore } from '@/stores/merchant'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const merchantStore = useMerchantStore()
const router = useRouter()
const showAddModal = ref(false)
const editPrices = ref({})

const newProduct = reactive({
  title: '',
  price: 0,
  category: 'bread',
  cover: ''
})

const categoryNames = {
  bread: '面包',
  drink: '饮品', 
  dessert: '甜品',
  other: '其他'
}

const getCategoryName = (category) => {
  return categoryNames[category] || '其他'
}

const updateProductPrice = async (productId) => {
  const newPrice = parseFloat(editPrices.value[productId])
  if (newPrice >= 0) {
    try {
      await merchantStore.updatePrice(productId, newPrice)
      editPrices.value[productId] = ''
      alert('价格更新成功！')
    } catch (error) {
      alert('价格更新失败: ' + error.message)
    }
  } else {
    alert('请输入有效的价格')
  }
}

const toggleSoldOut = async (productId) => {
  const product = merchantStore.products.find(p => p.id === productId)
  if (product) {
    try {
      await merchantStore.toggleSoldOut(productId)
      alert(product.soldOut ? '商品已重新上架' : '商品已标记为售罄')
    } catch (error) {
      alert('更新售罄状态失败: ' + error.message)
    }
  }
}

const deleteProduct = async (productId) => {
  if (confirm('确定要删除这个商品吗？此操作不可撤销。')) {
    try {
      await merchantStore.removeProduct(productId)
      alert('商品已删除')
    } catch (error) {
      alert('删除商品失败: ' + error.message)
    }
  }
}

const addNewProduct = async () => {
  if (!newProduct.title.trim()) {
    alert('请输入商品名称')
    return
  }
  
  if (newProduct.price <= 0) {
    alert('请输入有效的价格')
    return
  }

  try {
    await merchantStore.addProduct({
      ...newProduct,
      title: newProduct.title.trim()
    })
    
    // 重置表单
    Object.assign(newProduct, {
      title: '',
      price: 0,
      category: 'bread',
      cover: ''
    })
    
    closeAddModal()
    alert('商品添加成功！')
  } catch (error) {
    alert('添加商品失败: ' + error.message)
  }
}

const closeAddModal = () => {
  showAddModal.value = false
}

const goBackToDashboard = () => {
  router.push('/merchant/dashboard')
}

onMounted(async () => {
  // 初始化时加载商品数据
  try {
    // 获取当前用户的merchantId
    const userStore = useUserStore()
    
    // 临时解决方案：使用硬编码的用户ID
    // TODO: 需要从后端API获取真实的用户ID
    const merchantId = 19 // 从后端测试得知用户ID是19
    
    console.log('🔄 加载商家商品，merchantId:', merchantId)
    await merchantStore.loadProducts(merchantId)
  } catch (error) {
    console.error('❌ 加载商品失败:', error)
    alert('加载商品失败: ' + error.message)
  }
})
</script>

<style scoped>
.product-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e1e5e9;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text {
  text-align: left;
}

.back-btn {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4);
}

.page-header h1 {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
}

.page-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.add-product-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-product-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.product-card.sold-out {
  opacity: 0.7;
  border-color: #e74c3c;
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #e74c3c;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.category {
  margin: 0 0 8px;
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price {
  margin: 0;
  color: #27ae60;
  font-size: 1.5rem;
  font-weight: 700;
}

.product-actions {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-edit {
  display: flex;
  gap: 8px;
  align-items: center;
}

.price-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.update-price-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.update-price-btn:hover:not(:disabled) {
  background: #2980b9;
}

.update-price-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.toggle-actions {
  display: flex;
  gap: 8px;
}

.restock-btn, .sold-out-btn, .delete-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.restock-btn {
  background: #27ae60;
  color: white;
}

.restock-btn:hover {
  background: #229954;
}

.sold-out-btn {
  background: #f39c12;
  color: white;
}

.sold-out-btn:hover {
  background: #e67e22;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin: 0 0 20px;
  color: #2c3e50;
  text-align: center;
}

.add-product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #34495e;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.submit-btn {
  flex: 1;
  background: #27ae60;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #229954;
}

.cancel-btn {
  flex: 1;
  background: #95a5a6;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #7f8c8d;
}
</style>
