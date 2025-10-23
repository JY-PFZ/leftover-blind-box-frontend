<template>
  <!-- 只点遮罩空白处才关闭 -->
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>Login</h2>

      <form @submit.prevent="onSubmit" class="form">
        <input
          v-model.trim="username"
          type="text"
          placeholder="Email / Username"
          required
        />
        <input
          v-model.trim="password"
          type="password"
          placeholder="Password"
          minlength="6"
          required
        />

        <button class="primary" :disabled="loading">
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>
        <button class="ghost" type="button" @click="$emit('close')" :disabled="loading">
          Cancel
        </button>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <div v-if="errorMsg && errorMsg.includes('账户未激活')" class="activation-help">
          <p><strong>开发模式提示：</strong></p>
          <p>1. 检查邮箱中的激活链接</p>
          <p>2. 或联系管理员手动激活账户</p>
          <p>3. 测试账号：testuser@gmail.com / 123456</p>
        </div>
        <p v-if="successMsg" class="success">{{ successMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['close']);
const userStore = useUserStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const onSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  loading.value = true;
  
  try {
    // **使用明文密码登录**
    const res = await userStore.login(username.value, password.value);
    
    loading.value = false;

    if (res.success) {
    successMsg.value = '✅ Login Successful! Loading products...';
    
    // 触发全局事件，通知其他组件刷新数据
    window.dispatchEvent(new CustomEvent('user-login-success'));
    
    setTimeout(() => {
      emit('close');
      if (userStore.role === 'merchant') {
        router.push('/merchant/dashboard');
      }
    }, 1000);
  } else {
    errorMsg.value = res.message || 'Login failed';
  }
  
  } catch (error) {
    console.error('Login error:', error);
    errorMsg.value = 'Login failed. Please try again.';
    loading.value = false;
  }
};
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; z-index: 1001; }
.modal { width: 360px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
.form { display: grid; gap: 10px; }
input { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
.primary { padding: 10px; border: none; border-radius: 8px; background: #007bff; color: #fff; cursor: pointer; }
.ghost { padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; }
.error { color: #e74c3c; font-size: 13px; }
.success { color: #27ae60; font-size: 13px; font-weight: 500; }
.activation-help { 
  background: #f8f9fa; 
  border: 1px solid #dee2e6; 
  border-radius: 8px; 
  padding: 15px; 
  margin-top: 10px; 
  font-size: 13px; 
  color: #495057; 
}
.activation-help p { margin: 5px 0; }
</style>

