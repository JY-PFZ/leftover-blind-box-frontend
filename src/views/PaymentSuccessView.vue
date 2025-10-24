<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Success Header -->
      <div class="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
      
      <div class="p-8 text-center">
        <!-- Success Icon -->
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p class="text-gray-600 mb-8">Your order has been confirmed</p>

        <!-- Loading State -->
        <div v-if="isVerifying" class="mb-6">
          <div class="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-gray-600">Verifying payment...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isVerified" class="mb-6">
          <p class="text-green-600 font-semibold mb-4">✓ Payment verified successfully</p>
          <p class="text-gray-600 text-sm">Order #{{ orderId }} is now confirmed</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mb-6">
          <p class="text-red-600 font-semibold mb-4">✗ {{ error }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="goToOrderHistory"
            class="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            View Order History
          </button>
          <button
            @click="goToHome"
            class="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/utils/api';

const router = useRouter();
const route = useRoute();

const orderId = ref(null);
const sessionId = ref(null);
const isVerifying = ref(true);
const isVerified = ref(false);
const error = ref(null);

onMounted(async () => {
  // 从 URL 参数获取 orderId 和 sessionId
  orderId.value = route.query.orderId;
  sessionId.value = route.query.session_id;

  if (!orderId.value || !sessionId.value) {
    error.value = 'Missing payment information';
    isVerifying.value = false;
    return;
  }

  // 验证支付
  try {
    const response = await api.post('/api/payment/verify', null, {
      params: {
        orderId: orderId.value,
        sessionId: sessionId.value
      }
    });

    if (response.data?.success) {
      isVerified.value = true;
    } else {
      error.value = response.data?.message || 'Payment verification failed';
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    error.value = err.response?.data?.message || 'Failed to verify payment';
  } finally {
    isVerifying.value = false;
  }
});

const goToOrderHistory = () => {
  router.push('/order-history');
};

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* Styles are handled by Tailwind classes */
</style>


