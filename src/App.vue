<template>
  <div id="app">
    <!-- 商家导航栏 -->
    <nav v-if="user.role === 'merchant'" class="navbar">
      <div class="logo">Sugar Rush</div>
      <ul class="nav-links">
        <li><RouterLink to="/merchant/dashboard">Dashboard</RouterLink></li>
        <li><RouterLink to="/merchant/products">商品管理</RouterLink></li>
        <li><RouterLink to="/orders">订单管理</RouterLink></li>
      </ul>
      <div class="actions">
        <div class="user-info">
          <span class="merchant-badge">Merchant</span>
          <span class="username">👤 {{ user.username }}</span>
        </div>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <!-- 顾客/访客导航栏 -->
    <nav v-else class="navbar">
      <div class="logo">Sugar Rush</div>
      <ul class="nav-links">
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><a href="#">About Us</a></li>
        <li><a href="#">Shop</a></li>
        <li><RouterLink to="/profile">My Profile</RouterLink></li>
        <li><RouterLink to="/orders">我的订单</RouterLink></li>
      </ul>
      <div class="actions">
        <template v-if="!user.isLoggedIn">
          <button @click="showSignup = true" class="signup-btn">Sign Up</button>
          <button @click="showLogin = true" class="login-btn">Login</button>
        </template>
        <template v-else>
          <div class="user-info">
            <span class="username">👤 {{ user.username }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </template>
        <RouterLink v-if="user.role !== 'merchant'" to="/cart" class="cart-btn">
          🛒 Cart
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </RouterLink>
      </div>
    </nav>

    <LoginModal v-if="showLogin" @close="showLogin = false" />
    <SignupModal v-if="showSignup" @close="showSignup = false" />
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // 1. 引入 useRouter
import LoginModal from './components/LoginModal.vue';
import SignupModal from './components/SignupModal.vue';
import { useUserStore } from './stores/user';
import { useCartStore } from './stores/cart';

const showLogin = ref(false);
const showSignup = ref(false);
const user = useUserStore();
const cart = useCartStore();
const router = useRouter(); // 2. 获取 router 实例

const cartCount = computed(() => {
  return cart.items.reduce((total, item) => total + item.qty, 0);
});

const handleLogout = () => {
  user.logout();
  router.push('/'); // 登出后跳转回首页
};

const handleOpenLogin = () => {
  showLogin.value = true;
};

const handleOpenSignup = () => {
  showSignup.value = true;
};

// 3. 定义事件处理函数
const handleMerchantLogin = () => {
  console.log('[App.vue] 监听到商家登录成功事件，正在跳转...');
  router.push('/merchant/dashboard');
};

// 处理用户登录成功事件
const handleUserLoginSuccess = () => {
  console.log('[App.vue] 监听到用户登录成功事件，刷新用户状态');
  // 重新初始化用户状态
  user.initialize();
};

// **新增**: 处理全局登出事件
const handleUserLogout = () => {
  console.log('[App.vue] 监听到用户登出事件，刷新UI状态');
  // 如果当前在需要登录的页面，重定向到首页
  if (router.currentRoute.value.meta.requiresAuth) {
    router.push('/');
  }
};

onMounted(async () => {
  window.addEventListener('open-login', handleOpenLogin);
  window.addEventListener('open-login-modal', handleOpenLogin);
  window.addEventListener('open-signup-modal', handleOpenSignup);
  window.addEventListener('user-login-success', handleUserLoginSuccess);
  // **新增**: 监听全局登出事件
  window.addEventListener('user-logout', handleUserLogout);
  // 4. 在组件挂载时开始监听全局事件
  window.addEventListener('merchant-login-success', handleMerchantLogin);
  await user.initialize();
});

onUnmounted(() => {
  window.removeEventListener('open-login', handleOpenLogin);
  window.removeEventListener('open-login-modal', handleOpenLogin);
  window.removeEventListener('open-signup-modal', handleOpenSignup);
  window.removeEventListener('user-login-success', handleUserLoginSuccess);
  // **新增**: 移除全局登出事件监听
  window.removeEventListener('user-logout', handleUserLogout);
  // 5. 在组件卸载时移除监听，防止内存泄漏
  window.removeEventListener('merchant-login-success', handleMerchantLogin);
});
</script>

<style>
/* 你的样式保持不变 */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Arial', sans-serif; background: #fdf2e9; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; }
.logo { font-size: 28px; font-weight: bold; color: #e74c3c; }
.nav-links { list-style: none; display: flex; gap: 30px; }
.nav-links a { text-decoration: none; color: #333; font-weight: 500; transition: color 0.3s; }
.nav-links a:hover { color: #e74c3c; }
.actions { display: flex; gap: 8px; align-items: center; }
.actions button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.2s ease; white-space: nowrap; }
.signup-btn { background: #28a745; color: white; }
.login-btn { background: #007bff; color: white; }
.user-info { display: flex; align-items: center; padding: 8px 12px; background: #e8f5e8; border-radius: 6px; border: 1px solid #28a745; }
.username { color: #155724; font-weight: 500; font-size: 14px; }
.merchant-badge { background: #007bff; color: white; padding: 2px 6px; font-size: 12px; border-radius: 4px; margin-right: 8px; }
.logout-btn { background: #dc3545; color: white; }
.cart-btn { background: #f39c12; color: white; position: relative; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; font-size: 14px; white-space: nowrap; }
.cart-badge { position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border-radius: 50%; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; }
</style>

