<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" v-model="username" type="text" placeholder="请输入用户名" required>
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" placeholder="请输入密码" required>
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      <button class="close-btn" @click="close">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['close']);
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  const result = await userStore.login(username.value, password.value);
  isLoading.value = false;

  if (result.success) {
    close();
  } else {
    errorMessage.value = result.message || '登录失败，请稍后再试。';
  }
};

const close = () => {
  if (!isLoading.value) {
    emit('close');
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
}
.modal-content {
  background-color: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h2 {
  margin-bottom: 25px;
  color: #333;
}
.form-group {
  margin-bottom: 20px;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}
.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}
.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  font-weight: bold;
}
button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #0056b3;
}
.close-btn {
  margin-top: 15px;
  background-color: #6c757d;
}
.close-btn:hover {
  background-color: #5a6268;
}
</style>

