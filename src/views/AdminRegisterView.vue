<template>
  <div class="admin-register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="logo">🛍️ Magic Bag</h1>
        <h2 class="title">Admin Registration</h2>
      </div>

      <div class="register-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input 
            v-model="form.username"
            type="email" 
            class="form-input"
            placeholder="admin@123456.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input 
            v-model="form.password"
            type="password" 
            class="form-input"
            placeholder="123456"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input 
            v-model="form.confirmPassword"
            type="password" 
            class="form-input"
            placeholder="123456"
          />
        </div>

        <!-- Debug Info -->
        <div class="debug-section">
          <h3 class="debug-title">Debug Info</h3>
          
          <div class="debug-item">
            <strong>Status:</strong> 
            <span :class="['status-badge', isLoading ? 'loading' : 'ready']">
              {{ isLoading ? 'Registering...' : 'Ready' }}
            </span>
          </div>

          <div class="debug-item">
            <strong>Steps:</strong>
            <div class="steps">
              <div v-for="(step, index) in debugSteps" :key="index" class="step">
                <span class="step-icon">{{ step.success ? '✅' : step.error ? '❌' : '⏳' }}</span>
                <span class="step-text">{{ step.text }}</span>
                <span v-if="step.details" class="step-details">{{ step.details }}</span>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="debug-item error">
            <strong>Error:</strong>
            <div class="error-box">{{ errorMessage }}</div>
          </div>

          <div v-if="successMessage" class="debug-item success">
            <strong>Success:</strong>
            <div class="success-box">{{ successMessage }}</div>
          </div>

          <div v-if="responseData" class="debug-item">
            <strong>Response:</strong>
            <pre class="response-box">{{ JSON.stringify(responseData, null, 2) }}</pre>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="btn btn-primary" 
            @click="handleRegister" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Registering...' : 'Register Admin' }}
          </button>
          <button 
            class="btn btn-secondary" 
            @click="resetForm"
            :disabled="isLoading"
          >
            Reset
          </button>
        </div>
      </div>

      <div class="register-footer">
        <p class="back-link">
          <router-link to="/admin/login">← Back to Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/utils/api';

const router = useRouter();

// Form
const form = reactive({
  username: 'admin@123456.com',
  password: '123456',
  confirmPassword: '123456'
});

// State
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const responseData = ref(null);

// Steps (debug)
const debugSteps = ref([
  { text: 'Validate form', success: false, error: false },
  { text: 'Prepare request', success: false, error: false },
  { text: 'Send request', success: false, error: false },
  { text: 'Receive response', success: false, error: false },
  { text: 'Registration success', success: false, error: false }
]);

// Update step
const updateStep = (index, success, error, details = '') => {
  debugSteps.value[index] = {
    ...debugSteps.value[index],
    success,
    error,
    details
  };
};

// Reset form
const resetForm = () => {
  form.username = 'admin@123456.com';
  form.password = '123456';
  form.confirmPassword = '123456';
  errorMessage.value = '';
  successMessage.value = '';
  responseData.value = null;
  debugSteps.value = debugSteps.value.map(step => ({
    ...step,
    success: false,
    error: false,
    details: ''
  }));
};

// Handle register
const handleRegister = async () => {
  // reset state
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  responseData.value = null;
  
  // reset steps
  debugSteps.value = debugSteps.value.map(step => ({
    ...step,
    success: false,
    error: false,
    details: ''
  }));

  try {
    // Step 1: validate
    updateStep(0, true, false, 'Validate form data');
    
    if (!form.username || !form.password || !form.confirmPassword) {
      updateStep(0, false, true, 'Please fill in all fields');
      errorMessage.value = 'Please fill in all fields';
      return;
    }

    if (form.password !== form.confirmPassword) {
      updateStep(0, false, true, 'Passwords do not match');
      errorMessage.value = 'Passwords do not match';
      return;
    }

    if (form.password.length < 6) {
      updateStep(0, false, true, 'Password must be at least 6 characters');
      errorMessage.value = 'Password must be at least 6 characters';
      return;
    }

    updateStep(0, true, false, 'Form validation passed');

    // Step 2: prepare
    updateStep(1, true, false, 'Prepare registration data');
    
    const payload = {
      username: form.username,
      password: form.password,
      role: 'ADMIN' // set role to admin
    };

    console.log('[Admin Register] 注册数据:', payload);

    // Step 3: send
    updateStep(2, true, false, 'POST /api/user/register');
    
    let response;
    try {
      response = await api.post('/user/register', payload);
      console.log('[Admin Register] 注册响应:', response);
    } catch (apiError) {
      console.error('[Admin Register] API错误:', apiError);
      updateStep(2, false, true, `API error: ${apiError.message}`);
      
      if (apiError.response) {
        errorMessage.value = `API error (${apiError.response.status}): ${JSON.stringify(apiError.response.data)}`;
        responseData.value = apiError.response.data;
      } else {
        errorMessage.value = `Network error: ${apiError.message}`;
      }
      throw apiError;
    }

    // Step 4: receive
    updateStep(3, true, false, `Status: ${response.status}`);
    responseData.value = response.data;

    // Step 5: success
    updateStep(4, true, false, 'Admin registration successful');
    successMessage.value = `Admin registration successful! Email: ${form.username}\nNote: The account must be activated before login.`;

    // Activation notice
    alert('Registration successful! The account must be activated before login.\n\nExecute the following SQL to activate:\n\nUPDATE magicbag.users SET status = 1 WHERE username = \'' + form.username + '\';');

  } catch (error) {
    console.error('[Admin Register] 注册失败:', error);
    
    if (error.response) {
      errorMessage.value = `Error (${error.response.status}): ${JSON.stringify(error.response.data, null, 2)}`;
    } else {
      errorMessage.value = `Error: ${error.message}`;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.admin-register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 3rem;
  margin: 0 0 0.5rem 0;
}

.title {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.register-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

/* 调试信息 */
.debug-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.debug-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.debug-item {
  margin-bottom: 1rem;
}

.debug-item:last-child {
  margin-bottom: 0;
}

.debug-item strong {
  color: #374151;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.ready {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.loading {
  background: #dbeafe;
  color: #1e40af;
}

.steps {
  margin-top: 0.5rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.step-icon {
  font-size: 1rem;
}

.step-text {
  color: #6b7280;
}

.step-details {
  color: #9ca3af;
  font-size: 0.75rem;
}

.error-box,
.success-box {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-box {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.success-box {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.response-box {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.register-footer {
  text-align: center;
}

.back-link a {
  color: #667eea;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>

