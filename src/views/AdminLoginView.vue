<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="logo">🛍️ Magic Bag</h1>
        <h2 class="title">Admin Login</h2>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input 
            v-model="loginForm.username"
            type="text" 
            class="form-input"
            placeholder="admin@123456.com"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input 
            v-model="loginForm.password"
            type="password" 
            class="form-input"
            placeholder="123456"
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- Debug Info -->
        <div class="debug-section">
          <h3 class="debug-title">Debug Info</h3>
          
          <div class="debug-item">
            <strong>Status:</strong> 
            <span :class="['status-badge', isLoading ? 'loading' : 'ready']">
              {{ isLoading ? 'Logging in...' : 'Ready' }}
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
            @click="handleLogin" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
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

      <div class="login-footer">
        <p class="links">
          <router-link to="/admin/register">Register Admin</router-link>
          <span> | </span>
          <router-link to="/">Back to Home</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/utils/api';
import { useUserStore } from '@/stores/user.js';

const router = useRouter();
const userStore = useUserStore();

// 表单数据
const loginForm = reactive({
  username: 'admin@123456.com',
  password: '123456'
});

// 状态
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const responseData = ref(null);

// Steps (debug)
const debugSteps = ref([
  { text: 'Prepare login request', success: false, error: false },
  { text: 'Send login request', success: false, error: false },
  { text: 'Receive response', success: false, error: false },
  { text: 'Extract token', success: false, error: false },
  { text: 'Fetch user info', success: false, error: false },
  { text: 'Login success', success: false, error: false }
]);

// 更新步骤
const updateStep = (index, success, error, details = '') => {
  debugSteps.value[index] = {
    ...debugSteps.value[index],
    success,
    error,
    details
  };
};

// 重置表单
const resetForm = () => {
  loginForm.username = 'admin@123456.com';
  loginForm.password = '123456';
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

// 登录处理
const handleLogin = async () => {
  // 重置状态
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  responseData.value = null;
  
  // 重置步骤
  debugSteps.value = debugSteps.value.map(step => ({
    ...step,
    success: false,
    error: false,
    details: ''
  }));

  try {
    // Step 1
    updateStep(0, true, false, 'Ready to send login request');
    console.log('[Admin Login] 准备登录:', {
      username: loginForm.username,
      passwordLength: loginForm.password.length
    });

    // Step 2
    updateStep(1, true, false, 'POST /api/auth/login');
    
    let response;
    try {
      response = await api.post('/api/auth/login', {
        username: loginForm.username,
        password: loginForm.password
      });
      console.log('[Admin Login] 登录响应:', response);
    } catch (apiError) {
      console.error('[Admin Login] API错误:', apiError);
      updateStep(1, false, true, `API错误: ${apiError.message}`);
      
      if (apiError.response) {
        errorMessage.value = `API错误 (${apiError.response.status}): ${JSON.stringify(apiError.response.data)}`;
        responseData.value = apiError.response.data;
      } else {
        errorMessage.value = `网络错误: ${apiError.message}`;
      }
      throw apiError;
    }

    // Step 3
    updateStep(2, true, false, `Status: ${response.status}`);
    responseData.value = response.data;

    // Step 4
    updateStep(3, true, false, 'Extract token from response');
    
    const receivedToken =
      response.headers?.['x-new-token'] ||
      response.headers?.['X-New-Token'] ||
      response.headers?.['X-NEW-TOKEN'] ||
      response.data?.data?.token ||
      response.data?.token;

    console.log('[Admin Login] Token提取:', {
      'x-new-token': response.headers?.['x-new-token'],
      'X-New-Token': response.headers?.['X-New-Token'],
      'data.token': response.data?.token,
      'data.data.token': response.data?.data?.token,
      receivedToken
    });

    if (!receivedToken) {
      updateStep(3, false, true, 'Token未找到');
      errorMessage.value = 'No token found in login response';
      throw new Error('Login response did not contain a token.');
    }

    updateStep(3, true, false, `Token length: ${receivedToken.length}`);

    // Save token
    localStorage.setItem('token', receivedToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    console.log('[Admin Login] Token已保存到localStorage和axios headers');

    // Step 5
    updateStep(4, true, false, 'GET /api/user to fetch profile');
    
    try {
      const userResponse = await api.get('/api/user');
      console.log('[Admin Login] 用户信息:', userResponse.data);
      
      const userProfile = userResponse.data?.data;
      if (userProfile) {
        updateStep(4, true, false, `User: ${userProfile.username}, Role: ${userProfile.role}`);
        successMessage.value = `Login successful! User: ${userProfile.username}, Role: ${userProfile.role}`;
        
        // Step 6
        updateStep(5, true, false, 'Login flow finished');
        
        // 确保用户状态已更新
        await userStore.initialize();
        
        // redirect to admin
        console.log('[Admin Login] Redirecting to /admin, role:', userStore.role);
          router.push('/admin');
      } else {
        updateStep(4, false, true, 'User info is empty');
        errorMessage.value = 'Failed to fetch user info';
      }
    } catch (userError) {
      console.error('[Admin Login] 获取用户信息失败:', userError);
      updateStep(4, false, true, `Error: ${userError.message}`);
      errorMessage.value = `Failed to fetch user info: ${userError.message}`;
    }

  } catch (error) {
    console.error('[Admin Login] 登录失败:', error);
    
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
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  padding: 2rem;
}

.login-header {
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

.login-form {
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

.login-footer {
  text-align: center;
}

.links a {
  color: #667eea;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>

