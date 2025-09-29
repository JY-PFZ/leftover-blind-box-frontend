<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1>个人中心</h1>
      <div v-if="userStore.userProfile" class="profile-details">
        <p><strong>用户名:</strong> {{ userStore.userProfile.username }}</p>
        <p><strong>昵称:</strong> {{ userStore.userProfile.nickname }}</p>
        <p><strong>邮箱:</strong> {{ userStore.userProfile.email }}</p>
        <p><strong>手机号:</strong> {{ userStore.userProfile.phone }}</p>
      </div>
      <div v-else>
        正在加载用户信息...
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user';
const userStore = useUserStore();
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}
.profile-card {
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
.profile-details p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 15px;
  line-height: 1.6;
}
.profile-details strong {
  color: #000;
  margin-right: 10px;
}
</style>

