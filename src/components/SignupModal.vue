<template>
  <!-- 只点遮罩空白处才关闭 -->
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>Sign Up</h2>

      <form @submit.prevent="onSubmit" class="form">
        <input
          v-model.trim="username"
          type="email"
          placeholder="Email"
          required
        />
        <input
          v-model.trim="password"
          type="password"
          placeholder="Password (min. 6 characters)"
          minlength="6"
          required
        />

        <select v-model="role" required>
          <option value="CUSTOMER">Sign up as a Customer</option>
          <option value="MERCHANT">Sign up as a Merchant</option>
        </select>

        <!-- 🟢 [ADDED] 商家专属字段 -->
        <div v-if="role === 'MERCHANT'" class="merchant-fields">
          <hr class="divider" />
          <p class="merchant-title">Merchant Details</p>
          <input
            v-model.trim="merchantName"
            type="text"
            placeholder="Merchant Name"
            :required="role === 'MERCHANT'"
          />
          <input
            v-model.trim="address"
            type="text"
            placeholder="Address"
            :required="role === 'MERCHANT'"
          />
          <!-- 坐标获取 -->
          <button type="button" class="location-btn" @click="getLocation" :disabled="loadingLocation">
            {{ locationStatus }}
          </button>
          <p class="location-coords" v-if="latitude && longitude">
            Lat: {{ latitude.toFixed(4) }}, Lon: {{ longitude.toFixed(4) }}
          </p>
        </div>
        <!-- 🟢 结束 商家专属字段 -->

        <button class="primary" :disabled="loading || (role === 'MERCHANT' && loadingLocation)">
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
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useMerchantStore } from '@/stores/merchant'; // 🟢 [ADDED] 导入 merchant store

const emit = defineEmits(['close']);
const userStore = useUserStore();
const merchantStore = useMerchantStore(); // 🟢 [ADDED]

const username = ref(''); // (Email)
const password = ref('');
const role = ref('CUSTOMER');
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

// 🟢 [ADDED] 商家注册所需的新状态
const merchantName = ref('');
const address = ref('');
const latitude = ref(null);
const longitude = ref(null);
const loadingLocation = ref(false);
const locationStatus = ref('📍 Get Store Location');

// 🟢 [ADDED] 获取地理位置的函数
const getLocation = async () => {
  if (!navigator.geolocation) {
    locationStatus.value = 'Geolocation is not supported.';
    return;
  }
  loadingLocation.value = true;
  locationStatus.value = 'Getting location...';
  errorMsg.value = '';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
      locationStatus.value = '✅ Location Acquired';
      loadingLocation.value = false;
    },
    (err) => {
      console.error("Error getting location:", err);
      locationStatus.value = 'Failed. Click to retry.';
      errorMsg.value = 'Failed to get location. Please check browser permissions.';
      loadingLocation.value = false;
      latitude.value = null; // 确保失败时清空
      longitude.value = null;
    }
  );
};

// 🟢 [UPDATED] 提交逻辑
const onSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  loading.value = true;
  
  let res;
  if (role.value === 'CUSTOMER') {
    // --- 顾客注册 ---
    res = await userStore.register(username.value, password.value, role.value);
  } else {
    // --- 商家注册 ---
    // 检查用户是否已登录（商家注册需要先以 customer 身份登录）
    if (!userStore.isLoggedIn) {
      errorMsg.value = 'Please login as a customer first before registering as a merchant.';
      loading.value = false;
      return;
    }
    
    // 检查是否已获取坐标
    if (!latitude.value || !longitude.value) {
      errorMsg.value = 'Please acquire store location before signing up.';
      loading.value = false;
      return;
    }
    
    // 调用 merchantStore 的新函数
    res = await merchantStore.registerMerchant({
      username: username.value,
      password: password.value,
      merchantName: merchantName.value,
      address: address.value,
      latitude: latitude.value,
      longitude: longitude.value
    });
  }
  
  loading.value = false;

  if (res.success) {
    // 根据角色显示不同成功信息
    if (role.value === 'MERCHANT') {
      successMsg.value = '✅ Registration pending approval! You can now log in.';
    } else {
      successMsg.value = '✅ Registration Successful! Please log in.';
    }
    
    setTimeout(() => {
      emit('close');
      userStore.showLoginModal = true; // 注册成功后自动打开登录框
    }, 2000); // 停留2秒显示成功信息
  } else {
    errorMsg.value = res.message || 'Registration failed';
  }
};
</script>

<style scoped>
/* (大部分样式保持不变) */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .45);
  display: grid;
  place-items: center;
  z-index: 1001;
}
.modal {
  width: 360px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .2);
}
.form {
  display: grid;
  gap: 10px;
}
input, select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
}
.primary {
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #28a745;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}
.ghost {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
.primary:disabled {
  background: #aaa;
}
.error {
  color: #e74c3c;
  font-size: 13px;
}
.success {
  color: #27ae60;
  font-size: 13px;
  font-weight: 500;
}

/* 🟢 [ADDED] 商家字段样式 */
.merchant-fields {
  display: grid;
  gap: 10px;
}
.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 4px 0;
}
.merchant-title {
  font-weight: 600;
  color: #333;
  margin-bottom: -4px;
}
.location-btn {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  transition: background 0.2s;
}
.location-btn:hover {
  background: #f0f0f0;
}
.location-btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  color: #777;
}
.location-coords {
  font-size: 12px;
  color: #007bff;
  text-align: center;
  margin-top: -6px;
  margin-bottom: 4px;
}
</style>