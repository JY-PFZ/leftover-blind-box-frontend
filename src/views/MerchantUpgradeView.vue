<template>
  <div class="merchant-upgrade-page">
    <div class="container">
      <div class="upgrade-card">
        <div class="header">
          <h1 class="title">Upgrade to Merchant</h1>
          <p class="subtitle">Share your business details to apply</p>
        </div>

        <div v-if="!userStore.isLoggedIn" class="login-prompt">
          <div class="alert alert-warning">
            <p>Please sign in before applying to become a merchant.</p>
            <button @click="goToLogin" class="btn btn-primary">Go to Login</button>
          </div>
        </div>

        <div v-else-if="userStore.role !== 'customer'" class="status-info">
          <div class="alert alert-info">
            <p>Your current role: <strong>{{ userStore.role }}</strong></p>
            <p v-if="userStore.role === 'merchant'" class="success-text">You are already a merchant.</p>
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="upgrade-form">
          <div class="form-section">
            <h3 class="section-title">Merchant Information</h3>
            
            <div class="form-group">
              <label for="merchantName">Business Name *</label>
              <input
                id="merchantName"
                v-model.trim="form.merchantName"
                type="text"
                placeholder="Enter your business name"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="address">Business Address *</label>
              <input
                id="address"
                v-model.trim="form.address"
                type="text"
                placeholder="Enter your business address"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Store Location *</label>
              <div class="location-section">
                <button
                  type="button"
                  @click="getLocation"
                  :disabled="loadingLocation"
                  class="btn btn-location"
                >
                  {{ locationStatus }}
                </button>
                <div v-if="form.latitude && form.longitude" class="location-info">
                  <p class="location-text">
                    Latitude: {{ form.latitude.toFixed(4) }}, 
                    Longitude: {{ form.longitude.toFixed(4) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="phone">Contact Number (optional)</label>
              <input
                id="phone"
                v-model.trim="form.phone"
                type="tel"
                placeholder="Enter 8-digit SG phone (e.g. 81234567)"
                class="form-input"
              />
              <small class="form-hint">Format: 8 digits, starting with 8 or 9 (e.g. 81234567)</small>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="btn btn-primary btn-submit"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
            </button>
            <button
              type="button"
              @click="goBack"
              class="btn btn-secondary"
            >
              Cancel
            </button>
          </div>

          <div v-if="errorMsg" class="alert alert-error">
            {{ errorMsg }}
          </div>
          <div v-if="successMsg" class="alert alert-success">
            {{ successMsg }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useMerchantStore } from '@/stores/merchant';

const router = useRouter();
const userStore = useUserStore();
const merchantStore = useMerchantStore();

const form = ref({
  merchantName: '',
  address: '',
  latitude: null,
  longitude: null,
  phone: ''
});

const loadingLocation = ref(false);
const locationStatus = ref('📍 Get store location');
const isSubmitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const isFormValid = computed(() => {
  return form.value.merchantName && 
         form.value.address && 
         form.value.latitude && 
         form.value.longitude;
});

const getLocation = async () => {
  if (!navigator.geolocation) {
    errorMsg.value = 'Your browser does not support geolocation.';
    return;
  }

  loadingLocation.value = true;
  locationStatus.value = 'Fetching...';
  errorMsg.value = '';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = position.coords.latitude;
      form.value.longitude = position.coords.longitude;
      locationStatus.value = '✅ Location acquired';
      loadingLocation.value = false;
    },
    (err) => {
      console.error('Failed to get location:', err);
      locationStatus.value = '❌ Failed to fetch location';
      errorMsg.value = 'Unable to fetch location. Please review your browser permissions and try again.';
      loadingLocation.value = false;
    }
  );
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    errorMsg.value = 'Please fill in all required fields.';
    return;
  }

  errorMsg.value = '';
  successMsg.value = '';
  isSubmitting.value = true;

  try {
    // Ensure user is authenticated (backend derives userId from token)
    if (!userStore.isLoggedIn) {
      errorMsg.value = 'Please sign in first.';
      isSubmitting.value = false;
      return;
    }
    
    const result = await merchantStore.registerMerchant({
      username: userStore.username, // logging helper
      password: '', // not needed, user already authenticated
      merchantName: form.value.merchantName,
      address: form.value.address,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      phone: form.value.phone
    });

    if (result.success) {
      successMsg.value = '✅ Application submitted. Await admin approval.';
      // redirect to profile after 3 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } else {
      errorMsg.value = result.message || 'Submission failed. Please try again.';
    }
  } catch (error) {
    console.error('Merchant application failed:', error);
    errorMsg.value = 'An unexpected error occurred. Please retry.';
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.back();
};

const goToLogin = () => {
  router.push('/');
  // Trigger login modal display
  setTimeout(() => {
    window.dispatchEvent(new Event('open-login'));
  }, 100);
};
</script>

<style scoped>
.merchant-upgrade-page {
  min-height: calc(100vh - 80px);
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.upgrade-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.login-prompt,
.status-info {
  margin: 20px 0;
}

.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
}

.alert-info {
  background: #d1ecf1;
  border: 1px solid #0dcaf0;
  color: #055160;
}

.alert-error {
  background: #f8d7da;
  border: 1px solid #dc3545;
  color: #721c24;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #28a745;
  color: #155724;
}

.success-text {
  margin-top: 10px;
  font-weight: bold;
}

.upgrade-form {
  margin-top: 30px;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #ff9800;
  font-style: italic;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.location-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-location {
  padding: 12px 20px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-location:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #007bff;
}

.btn-location:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.location-info {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.location-text {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-submit {
  flex: 1;
}

@media (max-width: 640px) {
  .upgrade-card {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
