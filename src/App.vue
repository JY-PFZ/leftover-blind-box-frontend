<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="logo">Sugar Rush</div>
      <ul class="nav-links">
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><a href="#">About Us</a></li>
        <li><a href="#">Shop</a></li>
        <li><RouterLink to="/profile">My Profile</RouterLink></li>
        <li><RouterLink to="/order-history">Orders</RouterLink></li>
        <li><a href="#">Pages</a></li>
        <li><a href="#">Blogs</a></li>
        <li><a href="#">Contact Us</a></li>
      </ul>
      <div class="actions">
        <button @click="showSignup = true" class="signup-btn">注册</button>
        <button @click="handleMockLogin" class="mock-btn" @mousedown="() => console.log('Mock login button mousedown')">
          {{ user.isLoggedIn ? 'Mock登出' : 'Mock登录' }}
        </button>
        <button @click="showLogin = true" class="login-btn">Login</button>
        <RouterLink to="/cart" class="cart-btn">🛒 Cart</RouterLink>
      </div>
    </nav>

    <!-- 登录弹窗 -->
    <LoginModal v-if="showLogin" @close="showLogin = false" />
    
    <!-- 注册弹窗 -->
    <SignupModal v-if="showSignup" @close="showSignup = false" />

    <!-- 页面内容 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LoginModal from './components/LoginModal.vue';
import SignupModal from './components/SignupModal.vue';
import { useUserStore } from './stores/user';

const showLogin = ref(false);
const showSignup = ref(false);
const user = useUserStore();

const handleMockLogin = () => {
  if (user.isLoggedIn) {
    // 登出
    console.log('Mock logout')
    user.logout()
  } else {
    // 登录
    console.log('Mock login')
    user.mockLogin()
  }
};

// 监听全局登录事件
const handleOpenLogin = () => {
  console.log('Open login event received, showing login modal')
  showLogin.value = true;
};

onMounted(() => {
  window.addEventListener('open-login', handleOpenLogin);
  // 初始化用户状态
  user.initialize();
  console.log('App mounted, user state:', {
    isLoggedIn: user.isLoggedIn,
    username: user.username.value
  });
});

onUnmounted(() => {
  window.removeEventListener('open-login', handleOpenLogin);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: #fdf2e9;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 28px;
  font-weight: bold;
  color: #e74c3c;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 30px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #e74c3c;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.signup-btn {
  background: #28a745;
  color: white;
}

.signup-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.mock-btn {
  background: #6c757d;
  color: white;
}

.mock-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.login-btn {
  background: #007bff;
  color: white;
}

.login-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.cart-btn {
  background: #f39c12;
  color: white;
}

.cart-btn:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

/* 响应式 */
@media (max-width: 768px) {
  .navbar {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
  .nav-links {
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }
  .actions button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .actions button {
    padding: 5px 10px;
    font-size: 11px;
  }
  .logo {
    font-size: 24px;
  }
}
</style>
