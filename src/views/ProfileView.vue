<!-- src/views/ProfileView.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="max-w-4xl mx-auto p-4 sm:p-6">
      <!-- 返回按钮 -->
      <div class="mb-8">
        <button @click="$router.push('/')" class="group flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl text-gray-700 hover:text-gray-900 transition-all duration-300 border border-gray-200">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <span class="text-lg">←</span>
          </div>
          <span class="font-semibold text-lg">返回首页</span>
          <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
        </button>
      </div>

      <!-- 个人资料面板 -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <!-- 顶部装饰条 -->
        <div class="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div class="p-8">
          <!-- 页面标题 -->
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span class="text-white text-3xl">👤</span>
            </div>
            <h1 class="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              个人资料
            </h1>
            <p class="text-gray-500 text-lg mt-2">管理您的账户信息</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="text-center py-16">
            <div class="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-600 text-xl">正在加载个人资料...</p>
          </div>

          <!-- 未登录状态 -->
          <div v-else-if="!userStore.isLoggedIn" class="text-center py-16">
            <div class="text-8xl mb-6">🔒</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">请先登录</h3>
            <p class="text-gray-600 text-lg mb-8">您需要登录后才能查看个人资料</p>
            <button @click="$router.push('/')" class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              🏠 返回首页登录
            </button>
          </div>
          
          <!-- 个人资料表单 -->
          <form v-else-if="editableProfile" @submit.prevent="handleSave" class="max-w-2xl mx-auto">
            <!-- 用户信息卡片 -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span class="text-white text-2xl font-bold">{{ userStore.username?.charAt(0).toUpperCase() || 'U' }}</span>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-800">{{ userStore.username || '用户' }}</h3>
                  <p class="text-gray-600">欢迎回来！</p>
                </div>
              </div>
            </div>
            
            <!-- 表单字段 -->
            <div class="space-y-6">
              <div class="form-group">
                <label for="username" class="block text-lg font-semibold text-gray-700 mb-3">
                  <span class="flex items-center gap-2">
                    <span class="text-2xl">📧</span>
                    邮箱地址
                  </span>
                </label>
                <input 
                  id="username" 
                  type="email" 
                  :value="editableProfile.username" 
                  disabled 
                  class="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-600 font-medium"
                />
                <small class="text-gray-500 mt-2 block">您的邮箱用于登录，无法修改</small>
              </div>

              <div class="form-group">
                <label for="nickname" class="block text-lg font-semibold text-gray-700 mb-3">
                  <span class="flex items-center gap-2">
                    <span class="text-2xl">👤</span>
                    昵称
                  </span>
                </label>
                <input 
                  id="nickname" 
                  type="text" 
                  v-model="editableProfile.nickname" 
                  placeholder="请输入您的昵称" 
                  class="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                />
              </div>

              <div class="form-group">
                <label for="phone" class="block text-lg font-semibold text-gray-700 mb-3">
                  <span class="flex items-center gap-2">
                    <span class="text-2xl">📞</span>
                    手机号码
                  </span>
                </label>
                <input 
                  id="phone" 
                  type="tel" 
                  v-model="editableProfile.phone" 
                  placeholder="请输入您的手机号码" 
                  class="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                />
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex justify-center mt-8">
              <button 
                type="submit" 
                :disabled="isSaving"
                class="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span v-if="isSaving" class="flex items-center gap-2">
                  <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  保存中...
                </span>
                <span v-else class="flex items-center gap-2">
                  <span class="text-xl">💾</span>
                  保存更改
                </span>
              </button>
            </div>
            
            <!-- 反馈消息 -->
            <div v-if="successMessage" class="mt-6 p-4 bg-green-100 border border-green-300 rounded-2xl text-green-800 text-center font-medium">
              <span class="text-xl mr-2">✅</span>
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 border border-red-300 rounded-2xl text-red-800 text-center font-medium">
              <span class="text-xl mr-2">❌</span>
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();

// --- STATE ---
// Local reactive object for form data. This prevents direct mutation of the store's state.
const editableProfile = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// --- LOGIC ---
// This watcher automatically syncs the form with the user store's profile data
// when it becomes available or changes.
watchEffect(() => {
  if (userStore.userProfile) {
    // Create a deep copy for editing
    editableProfile.value = JSON.parse(JSON.stringify(userStore.userProfile));
    isLoading.value = false;
  } else if (!userStore.isLoggedIn) {
    isLoading.value = false;
  }
});

const handleSave = async () => {
  if (!editableProfile.value) return;

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  const result = await userStore.updateUserProfile(editableProfile.value);

  if (result.success) {
    successMessage.value = 'Profile updated successfully!';
  } else {
    errorMessage.value = result.message;
  }
  
  isSaving.value = false;

  // Hide success message after 3 seconds
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}
.profile-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}
.loading-message {
  text-align: center;
  padding: 30px;
  color: #777;
}

/* Form Styles */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}
.form-group input {
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}
.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
.form-group small {
  font-size: 0.8rem;
  color: #888;
  margin-top: 5px;
}
.form-actions {
  margin-top: 20px;
  text-align: right;
}
.form-actions button {
  background-color: #e74c3c;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}
.form-actions button:hover {
  background-color: #c0392b;
}
.form-actions button:disabled {
  background-color: #ccc;
  cursor: wait;
}

/* Feedback messages */
.feedback-message {
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  margin-top: 15px;
}
.success {
  background-color: #d4edda;
  color: #155724;
}
.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>