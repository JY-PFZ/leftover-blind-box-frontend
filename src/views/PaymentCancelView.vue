<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Cancel Header -->
      <div class="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
      
      <div class="p-8 text-center">
        <!-- Cancel Icon -->
        <div class="mb-6">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
        <p class="text-gray-600 mb-8">Your payment was not completed</p>

        <!-- Order Info -->
        <div v-if="orderId" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Order #{{ orderId }}</p>
        </div>

        <!-- Message -->
        <div class="mb-6">
          <p class="text-gray-600">No charges were made to your account.</p>
          <p class="text-gray-600 mt-2">You can try again or return to your cart.</p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="goToCart"
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Cart
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

const router = useRouter();
const route = useRoute();

const orderId = ref(null);

onMounted(() => {
  orderId.value = route.query.orderId;
});

const goToCart = () => {
  router.push('/cart');
};

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* Styles are handled by Tailwind classes */
</style>


