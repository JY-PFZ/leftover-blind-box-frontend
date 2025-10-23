<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Merchant Dashboard</h1>
      <p>Welcome back, {{ userStore.username }}!</p>
    </header>
    
    <main class="dashboard-main">
      <div class="dashboard-card">
        <h2>Order Management</h2>
        <p>View and process orders for your store.</p>
        <button @click="goToOrderManagement">Manage Orders</button>
      </div>
      
      <div class="dashboard-card">
        <h2>Product Management</h2>
        <p>Manage your "Magic Bag" listings.</p>
        <button @click="goToProductManagement">Manage Products</button>
      </div>

      <div class="dashboard-card">
        <h2>Store Profile</h2>
        <p>Update your store details and business hours.</p>
        <button @click="goToProfileManagement">Edit Profile</button>
      </div>
    </main>

    <!-- 快速操作按钮 -->
    <div class="quick-actions">
      <button @click="quickAddProduct" class="quick-btn add-btn">
        ➕ 快速添加商品
      </button>
      <button @click="viewAllProducts" class="quick-btn view-btn">
        📋 查看所有商品
      </button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// These functions are placeholders for future navigation
const goToOrderManagement = () => {
  console.log('Navigating to Order Management...')
  router.push('/orders') 
}

const goToProductManagement = () => {
  console.log('Navigating to Product Management...')
  router.push('/merchant/products')
}

const goToProfileManagement = () => {
  console.log('Navigating to Store Profile...')
  // router.push('/merchant/profile')
}

// 快速操作按钮功能
const quickAddProduct = () => {
  console.log('快速添加商品...')
  router.push('/merchant/products')
  // 可以在这里添加逻辑，比如直接打开添加商品的模态框
}

const viewAllProducts = () => {
  console.log('查看所有商品...')
  router.push('/merchant/products')
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dashboard-header h1 {
  margin: 0 0 15px;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dashboard-header p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.dashboard-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.dashboard-card h2 {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.dashboard-card p {
  color: #7f8c8d;
  margin: 0 0 20px;
  line-height: 1.6;
}

button {
  width: 100%;
  padding: 14px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

/* 快速操作按钮样式 */
.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  padding: 20px;
}

.quick-btn {
  flex: 1;
  max-width: 200px;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.add-btn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.add-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
}

.view-btn {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.view-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
}

.quick-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.quick-btn:hover::before {
  left: 100%;
}
</style>

