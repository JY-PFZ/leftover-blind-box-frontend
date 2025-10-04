<!-- src/views/OrderHistoryView.vue -->
<template>
  <div class="order-container">
    <div class="order-card">
      <h1>Order History</h1>

      <div v-if="isLoading" class="state-message">Loading your orders...</div>
      <div v-else-if="error" class="state-message error">Failed to load orders. Please try again later.</div>
      <div v-else-if="orders.length === 0" class="state-message">You haven't placed any orders yet.</div>

      <div v-else class="orders-list">
        <!-- Order Item Card -->
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <span class="order-id">Order #{{ order.orderNo }}</span>
            <span :class="['order-status', getStatusClass(order.status)]">{{ order.status }}</span>
          </div>
          <div class="order-body">
            <div class="order-details">
              <p><strong>Merchant:</strong> {{ order.merchantName }}</p>
              <p><strong>Bag:</strong> {{ order.bagTitle }}</p>
              <p><strong>Date:</strong> {{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-summary">
              <span class="order-price">${{ order.totalPrice.toFixed(2) }}</span>
              <button class="btn-details">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchOrders } from '@/services/orderService';

// --- CONFIG ---
// Set to `true` to use mock data, ideal for UI development without a real backend.
const USE_MOCK_DATA = ref(true);

// --- STATE ---
const orders = ref([]);
const isLoading = ref(true);
const error = ref(null);

// --- MOCK DATA ---
const mockOrders = [
  { id: 1, orderNo: 'ORD-001', status: 'COMPLETED', merchantName: 'The Corner Bakery', bagTitle: 'Morning Pastry Bag', createdAt: '2025-10-02T10:30:00Z', totalPrice: 15.99 },
  { id: 2, orderNo: 'ORD-002', status: 'PENDING', merchantName: 'Sushi World', bagTitle: 'Daily Sushi Special', createdAt: '2025-10-03T18:00:00Z', totalPrice: 25.00 },
  { id: 3, orderNo: 'ORD-003', status: 'CANCELLED', merchantName: 'Green Grocers', bagTitle: 'Fresh Fruit Box', createdAt: '2025-09-28T14:15:00Z', totalPrice: 18.50 },
];

// --- METHODS ---
const loadOrders = async () => {
  isLoading.value = true;
  error.value = null;

  if (USE_MOCK_DATA.value) {
    orders.value = mockOrders;
    isLoading.value = false;
    return;
  }

  try {
    const data = await fetchOrders({ pageNum: 1, pageSize: 20 }); // Fetch first 20 orders
    // The API response nests the list in a `records` property
    orders.value = data.records || [];
  } catch (err) {
    error.value = err;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusClass = (status) => {
  if (!status) return 'pending';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'completed') return 'completed';
  if (lowerStatus === 'cancelled') return 'cancelled';
  return 'pending';
};

// --- LIFECYCLE ---
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
}
.order-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}
.state-message {
  text-align: center;
  padding: 40px;
  color: #777;
  font-size: 1.2rem;
}
.state-message.error {
  color: #e74c3c;
}

/* Orders List Styling */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.order-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.07);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
}
.order-id {
  font-weight: bold;
  color: #333;
}
.order-status {
  font-size: 0.8rem;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
  text-transform: uppercase;
}
.order-status.completed { background-color: #2ecc71; }
.order-status.pending { background-color: #f39c12; }
.order-status.cancelled { background-color: #e74c3c; }

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.order-details p {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #555;
}
.order-details p:last-child {
  margin-bottom: 0;
}
.order-details strong {
  color: #000;
}

.order-summary {
  text-align: right;
}
.order-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
  display: block;
  margin-bottom: 10px;
}
.btn-details {
  background-color: #3498db;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-details:hover {
  background-color: #2980b9;
}
</style>