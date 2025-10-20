<template>
  <!-- The overlay closes the modal only when the blank area is clicked -->
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>Sign Up</h2>
      <p class="subtitle">Create an account to get started.</p>

      <form @submit.prevent="onSubmit" class="form">
        <!-- Common Fields -->
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input id="signup-email" type="email" v-model.trim="email" required placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label for="signup-password">Password</label>
          <input id="signup-password" type="password" v-model.trim="password" required minlength="6" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label for="signup-confirm-password">Confirm Password</label>
          <input id="signup-confirm-password" type="password" v-model.trim="confirmPassword" required placeholder="••••••••">
        </div>

        <!-- Role Selector -->
        <div class="form-group">
          <label for="role">Select Your Role</label>
          <select id="role" v-model="role" required>
            <option value="CUSTOMER">Customer</option>
            <option value="MERCHANT">Merchant</option>
          </select>
        </div>

        <!-- Merchant-specific Fields (Conditional) -->
        <div v-if="role === 'MERCHANT'" class="merchant-fields">
          <div class="form-group">
            <label for="name">Store Name</label>
            <input id="name" type="text" v-model="storeName" placeholder="e.g., The Corner Bakery">
          </div>
          <div class="form-group">
            <label for="phone">Contact Phone</label>
            <input id="phone" type="tel" v-model="phone" placeholder="+65 1234 5678">
          </div>
          <div class="form-group">
            <label for="address">Store Address</label>
            <input id="address" type="text" v-model="address" placeholder="123 Orchard Road, Singapore">
          </div>
          <!-- Location Section -->
          <div class="location-section">
            <button type="button" @click="fetchLocation" :disabled="isFetchingLocation" class="location-btn">
              <span v-if="isFetchingLocation">Fetching...</span>
              <span v-else>📍 Get Current Location</span>
            </button>
            <div v-if="location" class="location-display">
              Coordinates: {{ location.latitude.toFixed(4) }}, {{ location.longitude.toFixed(4) }}
            </div>
            <div v-if="locationError" class="error-text">
              {{ locationError }}
            </div>
          </div>
        </div>
        
        <p v-if="errorMsg" class="error-text submit-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success">{{ successMsg }}</p>

        <!-- Action Buttons -->
        <div class="button-group">
            <button type="submit" class="primary" :disabled="loading">
                {{ loading ? 'Submitting...' : 'Sign Up' }}
            </button>
            <button type="button" @click="$emit('close')" class="ghost">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getUserLocation } from '@/utils/geoUtils'; // Make sure this path is correct

const emit = defineEmits(['close']);

// Common fields
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('CUSTOMER'); // Default role

// Merchant-specific fields
const storeName = ref('');
const phone = ref('');
const address = ref('');
const location = ref(null);
const isFetchingLocation = ref(false);
const locationError = ref('');

// Control state
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const fetchLocation = async () => {
  isFetchingLocation.value = true;
  locationError.value = '';
  try {
    const loc = await getUserLocation();
    location.value = loc;
  } catch (error) {
    console.error("Failed to get location:", error);
    locationError.value = "Could not get location. Please grant permission.";
  } finally {
    isFetchingLocation.value = false;
  }
};

const onSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match.';
    return;
  }
  
  loading.value = true;

  try {
    // 使用用户store的register方法
    const result = await userStore.register(email.value, password.value, email.value);
    
    if (result.success) {
      successMsg.value = '✅ Registration successful! You can now log in.';
      
      setTimeout(() => {
        emit('close');
      }, 2000);
    } else {
      errorMsg.value = result.message || 'Registration failed. Please try again later.';
    }
  } catch (error) {
    console.error('Registration failed:', error);
    errorMsg.value = 'Registration failed. Please try again later.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; z-index: 1001; }
.modal { width: 100%; max-width: 480px; background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
.subtitle { text-align: center; color: #6b7280; margin-top: -10px; margin-bottom: 25px; }
.form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-weight: 500; color: #374151; }
.form-group input, .form-group select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }

.merchant-fields {
  border-top: 1px solid #e5e7eb;
  margin-top: 10px;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.location-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.location-btn {
  padding: 12px;
  border: 1px dashed #9ca3af;
  background-color: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
}
.location-display {
  padding: 10px;
  background-color: #eef7ff;
  color: #1d4ed8;
  border-radius: 8px;
  text-align: center;
}

.button-group {
    margin-top: 10px;
    display: grid;
    gap: 10px;
}
.primary { padding: 12px; border: none; border-radius: 8px; background: #007bff; color: #fff; cursor: pointer; font-size: 1rem; font-weight: bold; }
.ghost { padding: 12px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; font-size: 1rem; }

.error-text { color: #ef4444; font-size: 0.9rem; }
.submit-error { text-align: center; margin-bottom: 10px; }
.success { color: #27ae60; text-align: center; font-size: 1rem; font-weight: 500; }
</style>

