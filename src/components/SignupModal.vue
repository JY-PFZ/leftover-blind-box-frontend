<template>
  <!-- 只点遮罩空白处才关闭 -->
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>Sign Up</h2>

      <form @submit.prevent="onSubmit" class="form">
        <input
          v-model.trim="form.email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          v-model.trim="form.password"
          type="password"
          placeholder="Password"
          minlength="6"
          required
        />
        <input
          v-model.trim="form.confirmPassword"
          type="password"
          placeholder="Confirm Password"
          minlength="6"
          required
        />
        <select v-model="form.role" required>
          <option value="" disabled>Select Role</option>
          <option value="customer">Customer</option>
          <option value="merchant">Merchant</option>
        </select>

        <!-- 商家专属字段 -->
        <div v-if="form.role === 'merchant'" class="merchant-fields">
          <input v-model.trim="form.shopName" type="text" placeholder="Shop Name" required />
          <input v-model.trim="form.phone" type="tel" placeholder="Phone Number" required />
          <input v-model.trim="form.address" type="text" placeholder="Address" required />
          <div class="location-group">
            <button type="button" @click="getLocation" :disabled="locationLoading">
              {{ locationLoading ? 'Getting...' : 'Get Current Location' }}
            </button>
            <span v-if="form.latitude && form.longitude" class="location-display">
              📍 Acquired
            </span>
          </div>
        </div>

        <button class="primary" :disabled="loading">
          {{ loading ? 'Signing up…' : 'Sign Up' }}
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
import { ref, reactive } from 'vue';
import { api } from '@/utils/api';
// **核心修复：不再需要 JSEncrypt**
// import { JSEncrypt } from 'jsencrypt';

const emit = defineEmits(['close']);

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  shopName: '',
  phone: '',
  address: '',
  latitude: null,
  longitude: null,
});

const loading = ref(false);
const locationLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const getLocation = () => {
  if (!navigator.geolocation) {
    errorMsg.value = "Geolocation is not supported by your browser.";
    return;
  }
  locationLoading.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.latitude = position.coords.latitude;
      form.longitude = position.coords.longitude;
      locationLoading.value = false;
    },
    () => {
      errorMsg.value = "Unable to retrieve your location.";
      locationLoading.value = false;
    }
  );
};

const onSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';

  if (form.password !== form.confirmPassword) {
    errorMsg.value = 'Passwords do not match.';
    return;
  }
  if (!form.role) {
    errorMsg.value = 'Please select a role.';
    return;
  }
  
  loading.value = true;
  
  try {
    // **核心修复：直接发送原始密码**
    const payload = {
      username: form.email,
      password: form.password, // 直接使用原始密码
      role: form.role.toUpperCase(),
      // 商家专属字段
      name: form.shopName,
      phone: form.phone,
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
    };
    
    await api.post('/user/register', payload);
    
    successMsg.value = '✅ Registration successful! An activation email has been sent. Please check your inbox.';
    
    setTimeout(() => {
      emit('close');
    }, 3000);
    
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Registration failed.';
    errorMsg.value = `FAIL: ${message}`;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; z-index: 1001; }
.modal { width: 380px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
.form { display: grid; gap: 12px; }
input, select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; width: 100%; }
.primary { padding: 10px; border: none; border-radius: 8px; background: #007bff; color: #fff; cursor: pointer; }
.ghost { padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; }
.error { color: #e74c3c; font-size: 13px; }
.success { color: #27ae60; font-size: 13px; font-weight: 500; }
.merchant-fields { display: grid; gap: 12px; border-top: 1px solid #eee; padding-top: 12px; margin-top: 5px; }
.location-group { display: flex; align-items: center; gap: 10px; }
.location-group button { padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; background-color: #f0f0f0; }
.location-display { font-size: 13px; color: #27ae60; font-weight: 500; }
</style>

