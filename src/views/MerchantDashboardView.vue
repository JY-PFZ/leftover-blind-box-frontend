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
  router.push('/merchant/orders')
}

const goToProductManagement = () => {
  console.log('Navigating to Product Management...')
  router.push('/merchant/products')
}

const goToProfileManagement = () => {
  console.log('Navigating to Store Profile...')
  router.push('/merchant/profile')
}
</script>

<style scoped>
.dashboard-container {
  max-width: 960px;
  margin: 20px auto;
  padding: 20px;
  font-family: sans-serif;
}

.dashboard-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  margin: 0 0 10px;
}

.dashboard-header p {
  margin: 0;
  color: #555;
}

.dashboard-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.dashboard-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,.05);
  background-color: #fff;
}

.dashboard-card h2 {
  margin-top: 0;
  color: #333;
}

.dashboard-card p {
    color: #666;
}

button {
  padding: 10px 15px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

button:hover {
  background-color: #0056b3;
}
</style>

