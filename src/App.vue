<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="logo">Sugar Rush</div>
      <ul class="nav-links">
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/about">About Us</RouterLink></li>
        <li><RouterLink to="/shop">Shop</RouterLink></li>
        <li><RouterLink to="/profile">My Profile</RouterLink></li>
        <li><RouterLink to="/order-history">Orders</RouterLink></li>
        <li><a href="#">Pages</a></li>
        <li><a href="#">Blogs</a></li>
        <li><a href="#">Contact Us</a></li>
      </ul>
      <div class="actions">
        <template v-if="user.isLoggedIn">
          <span class="welcome-user">👋 {{ user.username }}</span>
          <button @click="onLogout" class="btn-logout">Logout</button>
          <!-- This is now a RouterLink -->
          <RouterLink to="/cart" class="btn-cart">🛒 Cart</RouterLink>
        </template>
        <template v-else>
          <button @click="showLogin = true" class="btn-login">Login</button>
        </template>
      </div>
    </nav>

    <!-- Login Modal (placeholder) -->
    <LoginModal v-if="showLogin" @close="showLogin = false" />

    <!-- Main Content -->
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import LoginModal from '@/components/LoginModal.vue';

const showLogin = ref(false);
const user = useUserStore();
const router = useRouter();

const onLogout = () => {
  user.logout();
  router.push('/'); // Redirect to home after logout
};
</script>

<style scoped>
/* Scoped styles ensure they don't leak to other components */
* {
  box-sizing: border-box;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
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
  margin: 0;
  padding: 0;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover, .nav-links a.router-link-exact-active {
  color: #e74c3c;
}

.actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-user {
  font-weight: 500;
  color: #555;
}

.btn-login, .btn-logout, .btn-cart {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-login { background: #007bff; color: white; }
.btn-logout { background: #6c757d; color: white; }
.btn-cart { background: #f39c12; color: white; }

/* Responsive */
@media (max-width: 1024px) {
  .nav-links {
    display: none; /* Hide complex nav on smaller screens for simplicity */
  }
}
</style>

