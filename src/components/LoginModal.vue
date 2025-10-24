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
  
  // userStore.login 现在会处理原始密码
  const res = await userStore.login(username.value, password.value); 
  
  loading.value = false;

  if (res.success) {
    successMsg.value = '✅ Login Successful! Redirecting...';
    
    setTimeout(() => {
      emit('close');
      // 根据角色跳转到不同界面
      if (userStore.role === 'merchant') {
        router.push('/merchant/dashboard');
      } else if (userStore.role === 'admin') {
        router.push('/admin');
      }
      // customer 和其他角色留在当前页面
    }, 1000);
  } else {
    errorMsg.value = res.message || 'Login failed';
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
</style>

