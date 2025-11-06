<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="logo">🛍️ Magic Bag</h1>
        <h2 class="title">管理员登录</h2>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input 
            v-model="loginForm.username"
            type="text" 
            class="form-input"
            placeholder="admin@123456.com"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input 
            v-model="loginForm.password"
            type="password" 
            class="form-input"
            placeholder="123456"
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- 调试信息 -->
        <div class="debug-section">
          <h3 class="debug-title">调试信息</h3>
          
          <div class="debug-item">
            <strong>当前状态:</strong> 
            <span :class="['status-badge', isLoading ? 'loading' : 'ready']">
              {{ isLoading ? '登录中...' : '就绪' }}
            </span>
          </div>

          <div class="debug-item">
            <strong>登录步骤:</strong>
            <div class="steps">
              <div v-for="(step, index) in debugSteps" :key="index" class="step">
                <span class="step-icon">{{ step.success ? '✅' : step.error ? '❌' : '⏳' }}</span>
                <span class="step-text">{{ step.text }}</span>
                <span v-if="step.details" class="step-details">{{ step.details }}</span>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="debug-item error">
            <strong>错误信息:</strong>
            <div class="error-box">{{ errorMessage }}</div>
          </div>

          <div v-if="successMessage" class="debug-item success">
            <strong>成功信息:</strong>
            <div class="success-box">{{ successMessage }}</div>
          </div>

          <div v-if="responseData" class="debug-item">
            <strong>响应数据:</strong>
            <pre class="response-box">{{ JSON.stringify(responseData, null, 2) }}</pre>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="btn btn-primary" 
            @click="handleLogin" 
            :disabled="isLoading"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
          <button 
            class="btn btn-secondary" 
            @click="resetForm"
            :disabled="isLoading"
          >
            重置
          </button>
        </div>
      </div>

      <div class="login-footer">
        <p class="links">
          <router-link to="/admin/register">注册管理员</router-link>
          <span> | </span>
          <router-link to="/">返回首页</router-link>
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

// 调试步骤
const debugSteps = ref([
  { text: '准备登录请求', success: false, error: false },
  { text: '发送登录请求', success: false, error: false },
  { text: '接收响应', success: false, error: false },
  { text: '提取Token', success: false, error: false },
  { text: '获取用户信息', success: false, error: false },
  { text: '登录成功', success: false, error: false }
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
    // 步骤1: 准备登录请求
    updateStep(0, true, false, '准备发送登录请求');
    console.log('[Admin Login] 准备登录:', {
      username: loginForm.username,
      passwordLength: loginForm.password.length
    });

    // 步骤2: 发送登录请求
    updateStep(1, true, false, '发送POST请求到 /api/auth/login');
    
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

    // 步骤3: 接收响应
    updateStep(2, true, false, `状态码: ${response.status}`);
    responseData.value = response.data;

    // 步骤4: 提取Token
    updateStep(3, true, false, '从响应头提取Token');
    
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
      errorMessage.value = '登录响应中未包含Token';
      throw new Error('Login response did not contain a token.');
    }

    updateStep(3, true, false, `Token长度: ${receivedToken.length}`);

    // 保存token
    localStorage.setItem('token', receivedToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    console.log('[Admin Login] Token已保存到localStorage和axios headers');

    // 步骤5: 获取用户信息
    updateStep(4, true, false, '调用 /api/user 获取用户信息');
    
    try {
      const userResponse = await api.get('/api/user');
      console.log('[Admin Login] 用户信息:', userResponse.data);
      
      const userProfile = userResponse.data?.data;
      if (userProfile) {
        updateStep(4, true, false, `用户: ${userProfile.username}, 角色: ${userProfile.role}`);
        successMessage.value = `登录成功！用户: ${userProfile.username}, 角色: ${userProfile.role}`;
        
        // 步骤6: 登录成功
        updateStep(5, true, false, '登录流程完成');
        
        // 确保用户状态已更新
        await userStore.initialize();
        
        // 立即跳转到admin界面
        console.log('[Admin Login] Redirecting to /admin, role:', userStore.role);
        router.push('/admin');
      } else {
        updateStep(4, false, true, '用户信息为空');
        errorMessage.value = '获取用户信息失败';
      }
    } catch (userError) {
      console.error('[Admin Login] 获取用户信息失败:', userError);
      updateStep(4, false, true, `错误: ${userError.message}`);
      errorMessage.value = `获取用户信息失败: ${userError.message}`;
    }

  } catch (error) {
    console.error('[Admin Login] 登录失败:', error);
    
    if (error.response) {
      errorMessage.value = `错误 (${error.response.status}): ${JSON.stringify(error.response.data, null, 2)}`;
    } else {
      errorMessage.value = `错误: ${error.message}`;
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

