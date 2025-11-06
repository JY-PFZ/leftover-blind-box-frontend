<template>
  <div class="relative min-h-screen">
    <!-- Animated Gradient Background -->
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50">
      <div class="absolute inset-0 opacity-30">
        <div 
          v-for="i in 15" 
          :key="i"
          class="absolute w-96 h-96 rounded-full blur-3xl"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)`,
            animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }"
        ></div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div 
          class="text-center space-y-4"
          :class="{ 'animate-fade-in-up': heroVisible }"
        >
          <h1 class="text-5xl sm:text-6xl md:text-7xl font-black text-ink-900 leading-tight">
            Shopping <span class="text-brand">Cart</span>
          </h1>
          <p v-if="cart.items && cart.items.length > 0" class="text-xl sm:text-2xl text-ink-700 font-light">
            {{ cart.items.length }} items • Total: ${{ (cart.total || 0).toFixed(2) }}
          </p>
          <p v-else class="text-xl sm:text-2xl text-ink-700 font-light">
            Your cart is empty
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <!-- Loading State -->
      <div 
        v-if="cart.isLoading && (!cart.items || cart.items.length === 0)" 
        class="mt-12 rounded-2xl border border-dashed border-ink-300/70 bg-white/50 backdrop-blur-sm p-10 text-center"
      >
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p class="mt-4 text-ink-700">Loading your cart...</p>
      </div>

      <!-- Empty Cart State -->
      <div 
        v-else-if="!cart.items || cart.items.length === 0" 
        class="mt-12 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-soft p-16 text-center"
        :class="{ 'animate-fade-in-up': emptyVisible }"
      >
        <div class="text-8xl mb-6 animate-bounce-slow">🛒</div>
        <h2 class="text-3xl font-bold text-ink-900 mb-4">Your cart is empty</h2>
        <p class="text-lg text-ink-600 mb-8">Add some delicious treats to get started!</p>
        <RouterLink 
          to="/" 
          class="inline-block bg-brand text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-600 transition-all transform hover:scale-105 shadow-xl"
        >
          Continue Shopping
        </RouterLink>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid lg:grid-cols-3 gap-8 mt-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="(item, index) in cart.items"
            :key="item.magicbagId || index"
            class="group rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-soft p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1"
            :class="{ 
              'opacity-100 translate-y-0': cardVisible[index],
              'opacity-0 translate-y-8': !cardVisible[index]
            }"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex flex-col sm:flex-row gap-6">
              <!-- Item Image -->
              <div class="flex-shrink-0">
                <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-4xl sm:text-5xl shadow-soft overflow-hidden">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.bagName"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>🍭</span>
                </div>
              </div>

              <!-- Item Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold text-ink-900 mb-2 line-clamp-1">
                  {{ item.bagName }}
                </h3>
                <p class="text-2xl font-bold text-brand mb-2">
                  ${{ (item.price || 0).toFixed(2) }}
                </p>
                <p v-if="item.magicbagId" class="text-sm text-ink-500 mb-4">
                  MagicBag ID: {{ item.magicbagId }}
                </p>
                <p v-if="!item.magicbagId" class="text-sm text-red-600 font-medium mb-4">
                  ⚠️ Item data is invalid (Missing ID)
                </p>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-3 bg-ink-100 rounded-xl p-2">
                    <button
                      @click="updateQuantity(item.magicbagId, item.quantity - 1)"
                      :disabled="cart.isLoading || !item.magicbagId || item.quantity <= 1"
                      class="w-8 h-8 rounded-lg bg-white text-ink-700 font-bold text-lg flex items-center justify-center hover:bg-brand hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-110 active:scale-95"
                    >
                      −
                    </button>
                    <span class="w-8 text-center font-bold text-ink-900">{{ item.quantity }}</span>
                    <button
                      @click="updateQuantity(item.magicbagId, item.quantity + 1)"
                      :disabled="cart.isLoading || !item.magicbagId"
                      class="w-8 h-8 rounded-lg bg-white text-ink-700 font-bold text-lg flex items-center justify-center hover:bg-brand hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-110 active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  <!-- Subtotal -->
                  <div class="text-xl font-bold text-ink-900">
                    ${{ (item.subtotal || 0).toFixed(2) }}
                  </div>

                  <!-- Remove Button -->
                  <button
                    @click="removeItem(item.magicbagId)"
                    :disabled="cart.isLoading || !item.magicbagId"
                    class="ml-auto px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 sm:opacity-100"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Card (Sticky) -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 shadow-xl p-6"
               :class="{ 'animate-fade-in-up': summaryVisible }">
            <h3 class="text-2xl font-bold text-ink-900 mb-6">Order Summary</h3>

            <div class="space-y-4 mb-6">
              <div class="flex justify-between text-ink-700">
                <span>Subtotal ({{ cart.items.length }} items):</span>
                <span class="font-semibold">${{ (cart.total || 0).toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-ink-700">
                <span>Shipping:</span>
                <span class="font-semibold text-green-600">Free</span>
              </div>

              <div class="border-t border-ink-200 pt-4 flex justify-between">
                <span class="text-xl font-bold text-ink-900">Total:</span>
                <span class="text-2xl font-black text-brand">${{ (cart.total || 0).toFixed(2) }}</span>
              </div>
            </div>

            <div class="space-y-3">
              <button 
                @click="clearCart" 
                :disabled="cart.isLoading || !cart.items || cart.items.length === 0"
                class="w-full px-6 py-3 rounded-xl bg-ink-500 text-white font-semibold hover:bg-ink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
              >
                Clear Cart
              </button>
              <button 
                @click="checkout" 
                :disabled="cart.isLoading || !cart.items || cart.items.length === 0"
                class="w-full px-6 py-3 rounded-xl bg-brand text-white font-bold text-lg hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:scale-105 active:scale-95"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div 
      v-if="showPaymentModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closePaymentModal"
    >
      <div 
        class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-ink-200">
          <h2 class="text-2xl font-bold text-ink-900">💳 Choose Payment Method</h2>
          <button 
            @click="closePaymentModal" 
            class="w-10 h-10 rounded-full bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-ink-600 hover:text-ink-900 transition-all"
          >
            ×
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Order Summary -->
          <div>
            <h3 class="text-lg font-bold text-ink-900 mb-4">Order Summary</h3>
            <div class="bg-ink-50 rounded-xl p-4 space-y-3 mb-4">
              <div 
                v-for="item in cart.items" 
                :key="item.magicbagId" 
                class="flex justify-between items-center text-sm"
              >
                <span class="font-medium text-ink-900 flex-1">{{ item.bagName }}</span>
                <span class="text-ink-600 mx-4">×{{ item.quantity }}</span>
                <span class="font-semibold text-brand">${{ (item.subtotal || 0).toFixed(2) }}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xl font-black text-brand">Total: ${{ (cart.total || 0).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Payment Methods -->
          <div>
            <h3 class="text-lg font-bold text-ink-900 mb-4">Select Payment Method</h3>
            <div class="space-y-3">
              <label 
                class="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all"
                :class="selectedPayment === 'stripe' ? 'border-brand bg-brand-50' : 'border-ink-200 hover:border-brand-300 bg-white'"
              >
                <input 
                  type="radio" 
                  v-model="selectedPayment" 
                  value="stripe" 
                  class="mr-4 w-5 h-5 text-brand"
                />
                <div class="flex items-center gap-3 flex-1">
                  <div class="text-3xl">💳</div>
                  <div>
                    <div class="font-semibold text-ink-900">Stripe</div>
                    <div class="text-sm text-ink-600">Secure payment via Stripe</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="p-6 border-t border-ink-200 flex gap-3">
          <button 
            @click="closePaymentModal" 
            :disabled="isProcessing"
            class="flex-1 px-6 py-3 rounded-xl bg-ink-500 text-white font-semibold hover:bg-ink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            @click="processPayment"
            :disabled="!selectedPayment || isProcessing"
            class="flex-1 px-6 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:scale-105 active:scale-95"
          >
            <span v-if="isProcessing">Processing...</span>
            <span v-else>Pay ${{ (cart.total || 0).toFixed(2) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import { api } from '@/utils/api';

const cart = useCartStore();
const user = useUserStore();
const router = useRouter();

// Animation states
const heroVisible = ref(false);
const emptyVisible = ref(false);
const summaryVisible = ref(false);
const cardVisible = ref({});

// Debug Watcher
watch(() => cart.items, (newItems) => {
  console.log('[CartView Debug] cart.items changed!');
  nextTick(() => {
    console.log('[CartView Debug] Reading items in nextTick:', JSON.parse(JSON.stringify(cart.items)));
    if (Array.isArray(cart.items)) {
      cart.items.forEach((item, index) => {
        console.log(`[CartView Debug] Item ${index} (in nextTick):`, JSON.parse(JSON.stringify(item)), 'Has magicbagId (b):', item && item.hasOwnProperty('magicbagId'), 'Value (b):', item ? item.magicbagId : 'item is null/undefined');
      });
    }
  });
  
  // Trigger animations when items change
  if (newItems && newItems.length > 0) {
    animateCards();
  }
}, { deep: true, immediate: true });

const animateCards = () => {
  if (cart.items && cart.items.length > 0) {
    cart.items.forEach((_, index) => {
      setTimeout(() => {
        cardVisible.value[index] = true;
      }, index * 50);
    });
  }
};

onMounted(() => {
  if (user.isLoggedIn) {
    cart.fetchCart();
  }
  
  // Trigger animations
  setTimeout(() => {
    heroVisible.value = true;
    if (!cart.items || cart.items.length === 0) {
      emptyVisible.value = true;
    } else {
      summaryVisible.value = true;
      animateCards();
    }
  }, 100);
});

async function updateQuantity(magicbagId, newQty) {
  if (!magicbagId) {
    console.error("updateQuantity called with invalid magicbagId:", magicbagId);
    return;
  }
  await cart.updateItemQuantity(magicbagId, newQty);
}

async function removeItem(magicbagId) {
  if (!magicbagId) {
    console.error("removeItem called with invalid magicbagId:", magicbagId);
    return;
  }
  await cart.removeItemFromCart(magicbagId);
}

async function clearCart() {
  await cart.clearServerCart();
}

const showPaymentModal = ref(false);
const selectedPayment = ref('stripe');
const isProcessing = ref(false);

function checkout() {
  if (!user.isLoggedIn) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  if (!cart.items || cart.items.length === 0) {
    console.warn('Cart is empty, cannot proceed to checkout.');
    alert('Your cart is empty!');
    return;
  }
  showPaymentModal.value = true;
}

function closePaymentModal() {
  showPaymentModal.value = false;
  isProcessing.value = false;
}

async function processPayment() {
  if (!selectedPayment.value) return;

  isProcessing.value = true;

  try {
    console.log("[CartView] 步骤1: 创建订单...");
    const orderResponse = await api.post('/api/order/from-cart');

    if (orderResponse.data?.code != 20000 || !orderResponse.data?.data) {
      console.error("❌ Failed to create order:", orderResponse.data);
      alert(`创建订单失败: ${orderResponse.data?.message || 'Unknown error from server'}`);
      isProcessing.value = false;
      return;
    }

    const newOrder = orderResponse.data.data;
    const orderId = newOrder.id || newOrder.orderId;
    console.log("✅ Order created successfully:", newOrder);
    console.log("订单ID:", orderId);

    if (!orderId) {
      console.error("❌ Order ID is missing:", newOrder);
      alert('订单创建成功，但无法获取订单ID，请联系客服');
      isProcessing.value = false;
      return;
    }

    console.log("[CartView] 步骤2: 创建 Stripe Checkout Session...");
    const paymentResponse = await api.post('/api/payment/checkout', null, {
      params: { orderId: orderId }
    });

    console.log("[CartView] Payment checkout response:", paymentResponse.data);

    let checkoutUrl = null;
    let isSuccess = false;
    
    if (paymentResponse.data?.success === true) {
      isSuccess = true;
      checkoutUrl = paymentResponse.data?.checkoutUrl;
    }
    else if (paymentResponse.data?.code == 20000 || paymentResponse.data?.code == 1) {
      isSuccess = true;
      checkoutUrl = paymentResponse.data?.data?.checkoutUrl || paymentResponse.data?.checkoutUrl;
    }
    
    if (isSuccess && checkoutUrl) {
      console.log("✅ Stripe checkout session created, redirecting to:", checkoutUrl);
      
      const token = localStorage.getItem('token');
      if (token) {
        sessionStorage.setItem('payment_token', token);
        console.log("[CartView] Token saved to sessionStorage for payment verification");
      }
      
      await cart.fetchCart();
      closePaymentModal();
      window.location.href = checkoutUrl;
    } else {
      console.error("❌ Failed to create checkout session:", paymentResponse.data);
      console.error("响应详情:", {
        success: paymentResponse.data?.success,
        code: paymentResponse.data?.code,
        checkoutUrl: paymentResponse.data?.checkoutUrl || paymentResponse.data?.data?.checkoutUrl,
        message: paymentResponse.data?.message
      });
      alert(`创建支付会话失败: ${paymentResponse.data?.message || 'Unknown error'}`);
      isProcessing.value = false;
    }

  } catch (error) {
    console.error('❌ Error during payment processing:', error);
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    alert(`支付处理失败: ${error.response?.data?.message || error.message || 'Please try again.'}`);
    isProcessing.value = false;
  }
}
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
  animation: fadeInUp 0.8s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-bounce-slow {
  animation: bounceSlow 2s ease-in-out infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
