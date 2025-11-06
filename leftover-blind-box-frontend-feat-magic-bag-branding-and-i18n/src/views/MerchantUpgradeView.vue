<template>
  <div class="merchant-upgrade-page">
    <div class="container">
      <div class="upgrade-card">
        <div class="header">
          <h1 class="title">升级为商家</h1>
          <p class="subtitle">填写您的商家信息，申请成为商家</p>
        </div>

        <div v-if="!userStore.isLoggedIn" class="login-prompt">
          <div class="alert alert-warning">
            <p>请先登录后再申请成为商家</p>
            <button @click="goToLogin" class="btn btn-primary">去登录</button>
          </div>
        </div>

        <div v-else-if="userStore.role !== 'customer'" class="status-info">
          <div class="alert alert-info">
            <p>您当前的角色是：<strong>{{ userStore.role }}</strong></p>
            <p v-if="userStore.role === 'merchant'" class="success-text">您已经是商家了！</p>
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="upgrade-form">
          <div class="form-section">
            <h3 class="section-title">商家基本信息</h3>
            
            <div class="form-group">
              <label for="merchantName">商家名称 *</label>
              <input
                id="merchantName"
                v-model.trim="form.merchantName"
                type="text"
                placeholder="请输入商家名称"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="address">商家地址 *</label>
              <input
                id="address"
                v-model.trim="form.address"
                type="text"
                placeholder="请输入商家地址"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>店铺位置 *</label>
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
                    经度: {{ form.latitude.toFixed(4) }}, 
                    纬度: {{ form.longitude.toFixed(4) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="phone">联系电话（可选）</label>
              <input
                id="phone"
                v-model.trim="form.phone"
                type="tel"
                placeholder="请输入8位新加坡手机号（如：81234567）"
                class="form-input"
              />
              <small class="form-hint">格式：8位数字，以8或9开头（如：81234567）</small>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="btn btn-primary btn-submit"
            >
              {{ isSubmitting ? '提交中...' : '提交申请' }}
            </button>
            <button
              type="button"
              @click="goBack"
              class="btn btn-secondary"
            >
              取消
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
const locationStatus = ref('📍 获取店铺位置');
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
    errorMsg.value = '您的浏览器不支持地理位置功能';
    return;
  }

  loadingLocation.value = true;
  locationStatus.value = '获取中...';
  errorMsg.value = '';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = position.coords.latitude;
      form.value.longitude = position.coords.longitude;
      locationStatus.value = '✅ 位置已获取';
      loadingLocation.value = false;
    },
    (err) => {
      console.error('获取位置失败:', err);
      locationStatus.value = '❌ 获取失败，请重试';
      errorMsg.value = '无法获取位置信息，请检查浏览器权限设置';
      loadingLocation.value = false;
    }
  );
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    errorMsg.value = '请填写所有必填项';
    return;
  }

  errorMsg.value = '';
  successMsg.value = '';
  isSubmitting.value = true;

  try {
    // 确保用户已登录（后端会从token中获取userId，不需要前端传递）
    if (!userStore.isLoggedIn) {
      errorMsg.value = '请先登录';
      isSubmitting.value = false;
      return;
    }
    
    const result = await merchantStore.registerMerchant({
      username: userStore.username, // 使用当前登录用户的用户名（仅用于日志）
      password: '', // 不需要密码，因为用户已经登录
      merchantName: form.value.merchantName,
      address: form.value.address,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      phone: form.value.phone
    });

    if (result.success) {
      successMsg.value = '✅ 申请提交成功！请等待管理员审核。';
      // 3秒后跳转到个人中心
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } else {
      errorMsg.value = result.message || '申请提交失败，请重试';
    }
  } catch (error) {
    console.error('提交申请失败:', error);
    errorMsg.value = '提交申请时发生错误，请重试';
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.back();
};

const goToLogin = () => {
  router.push('/');
  // 触发显示登录模态框的事件
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
