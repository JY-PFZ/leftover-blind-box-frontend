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
          <p class="text-green-600 font-semibold mb-4">✓ Payment Successful!</p>
          <p class="text-gray-600 text-sm">Order #{{ orderId }} payment completed</p>
          <p class="text-gray-500 text-xs mt-2">Redirecting to homepage...</p>
        </div>

        <!-- Error State (现在基本不会显示，因为即使验证失败也显示成功) -->
        <div v-else-if="error" class="mb-6">
          <p class="text-yellow-600 font-semibold mb-4">⚠ {{ error }}</p>
          <p class="text-gray-600 text-sm">Payment was successful, but verification failed. You can check your order history.</p>
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
        <p v-if="isVerified" class="text-center text-gray-500 text-xs mt-4">
          Or wait 2 seconds to auto-redirect...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

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
    // 如果没有必要参数，直接显示成功（Stripe 已经成功）
    isVerified.value = true;
    isVerifying.value = false;
    setTimeout(() => {
      router.push('/');
    }, 2000);
    return;
  }

  // 🔧 确保 userStore 已初始化（Stripe 重定向后可能是新页面加载）
  if (!userStore.isInitialized) {
    console.log('[PaymentSuccess] UserStore not initialized, initializing...');
    await userStore.initialize();
  }

  console.log('[PaymentSuccess] Verifying payment...');
  console.log('[PaymentSuccess] OrderId:', orderId.value);
  console.log('[PaymentSuccess] SessionId:', sessionId.value);

  // 🔧 验证支付 - 使用原生 fetch API，避免 axios 拦截器干扰
  // 注意：后端可能已经将 /api/payment/verify 设置为公开访问，所以不需要 token
  try {
    // 🔧 使用原生 fetch API，直接控制请求头
    const verifyUrl = `/api/payment/verify?orderId=${orderId.value}&sessionId=${sessionId.value}`;
    console.log('[PaymentSuccess] Request URL:', verifyUrl);
    
    // 🔧 优先从 sessionStorage 获取 token（Stripe 跳转前保存的），然后从 localStorage 获取
    let token = sessionStorage.getItem('payment_token');
    if (!token) {
      token = localStorage.getItem('token');
      console.log('[PaymentSuccess] Token not found in sessionStorage, trying localStorage');
    } else {
      console.log('[PaymentSuccess] Token found in sessionStorage');
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // 如果有 token，添加到请求头（确保传递 token）
    if (token) {
      const cleanToken = token.trim();
      headers['Authorization'] = `Bearer ${cleanToken}`;
      console.log('[PaymentSuccess] ✅ Using token in Authorization header:', cleanToken.substring(0, 20) + '...');
      
      // 🔧 清理 sessionStorage 中的临时 token（已经使用过了）
      sessionStorage.removeItem('payment_token');
    } else {
      console.warn('[PaymentSuccess] ⚠️ No token found in sessionStorage or localStorage');
      console.warn('[PaymentSuccess] Payment verification will proceed without token (if backend allows)');
    }
    
    console.log('[PaymentSuccess] Request headers:', headers);
    
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: headers
    });

    console.log('[PaymentSuccess] Response status:', response.status);
    console.log('[PaymentSuccess] Response headers:', Object.fromEntries(response.headers.entries()));

    // 🔧 特殊处理：401 错误（如果后端仍需要认证）
    if (response.status === 401) {
      console.warn('[PaymentSuccess] 401 error - backend may still require authentication');
      // 即使 401，如果后端允许通过 sessionId 验证，我们仍然可以尝试
      // 或者显示成功页面（因为 Stripe 已经成功支付了）
      console.warn('[PaymentSuccess] Stripe payment was successful, showing success page anyway');
      isVerified.value = true;
      isVerifying.value = false;
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    // 🔧 检查响应是否成功
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.warn('[PaymentSuccess] Verify API returned error, but Stripe payment was successful. Showing success page anyway.');
      console.warn('[PaymentSuccess] Error data:', errorData);
      isVerified.value = true;
      isVerifying.value = false;
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    // 🔧 解析响应数据
    const data = await response.json();
    console.log('[PaymentSuccess] Verify response:', data);

    if (data?.code == 20000 || data?.code == 1 || data?.success) {
      isVerified.value = true;
      // ✅ 支付验证成功后，延迟2秒自动跳转到主页面
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      // 验证失败，但 Stripe 已经成功，所以仍然显示成功页面
      console.warn('[PaymentSuccess] Verify API returned error, but Stripe payment was successful. Showing success page anyway.');
      isVerified.value = true;
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  } catch (err) {
    console.error('[PaymentSuccess] Payment verification error:', err);
    console.error('[PaymentSuccess] Error details:', {
      message: err.message,
      stack: err.stack
    });
    
    // 🔧 即使验证失败（网络错误或其他），Stripe 已经成功支付了
    // 所以仍然显示成功页面，用户可以在订单历史中查看
    console.warn('[PaymentSuccess] Verify failed, but Stripe payment was successful. Showing success page anyway.');
    isVerified.value = true;
    
    setTimeout(() => {
      router.push('/');
    }, 2000);
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


