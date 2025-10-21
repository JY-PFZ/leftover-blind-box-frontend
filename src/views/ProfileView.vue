<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="max-w-4xl mx-auto p-4 sm:p-6">
      <!-- Back Button -->
      <div class="mb-8">
        <button @click="$router.push('/')" class="group flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl text-gray-700 hover:text-gray-900 transition-all duration-300 border border-gray-200">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <span class="text-lg">←</span>
          </div>
          <span class="font-semibold text-lg">Back to Home</span>
        </button>
      </div>

      <!-- Profile Panel -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <!-- Decorative Top Bar -->
        <div class="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div class="p-8">
          <!-- Page Title -->
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span class="text-white text-3xl">👤</span>
            </div>
            <h1 class="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p class="text-gray-500 text-lg mt-2">Manage your account information</p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-16">
            <div class="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-600 text-xl">Loading Profile...</p>
          </div>

          <!-- Logged Out State -->
          <div v-else-if="!userStore.isLoggedIn" class="text-center py-16">
            <div class="text-8xl mb-6">🔒</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Please Log In</h3>
            <p class="text-gray-600 text-lg mb-8">You need to be logged in to view your profile.</p>
            <button @click="openLoginModal" class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              🏠 Go to Login
            </button>
          </div>
          
          <!-- Profile Form -->
          <form v-else-if="editableProfile" @submit.prevent="handleSave" class="max-w-2xl mx-auto">
            <!-- User Info Card -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span class="text-white text-2xl font-bold">{{ userStore.username?.charAt(0).toUpperCase() || 'U' }}</span>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-800">{{ userStore.username || 'User' }}</h3>
                  <p class="text-gray-600">Welcome back!</p>
                </div>
              </div>
            </div>
            
            <!-- Form Fields -->
            <div class="space-y-6">
              <div class="form-group">
                <label for="username" class="block text-lg font-semibold text-gray-700 mb-3">
                  <span class="flex items-center gap-2">
                    <span class="text-2xl">📧</span>
                    Email Address
                  </span>
                </label>
                <input 
                  id="username" 
                  type="email" 
                  :value="editableProfile.username" 
                  disabled 
                  class="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-600 font-medium"
                />
                <small class="text-gray-500 mt-2 block">Your email is used for login and cannot be changed.</small>
              </div>

              <div class="form-group">
                <label for="nickname" class="block text-lg font-semibold text-gray-700 mb-3">
                  <span class="flex items-center gap-2">
                    <span class="text-2xl">👤</span>
                    Nickname
                  </span>
                </label>
                <input 
                  id="nickname" 
                  type="text" 
                  v-model="editableProfile.nickname" 
                  placeholder="Enter your nickname" 
                  class="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                />
              </div>

              <div class="form-group">
                <label for="phone" class="block text-lg font-semibold text-gray-700 mb-3">
                  <span class="flex items-center gap-2">
                    <span class="text-2xl">📞</span>
                    Phone Number
                  </span>
                </label>
                <input 
                  id="phone" 
                  type="tel" 
                  v-model="editableProfile.phone" 
                  placeholder="Enter your phone number" 
                  class="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                />
              </div>
            </div>
            
            <!-- Action Button -->
            <div class="flex justify-center mt-8">
              <button 
                type="submit" 
                :disabled="isSaving"
                class="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span v-if="isSaving" class="flex items-center gap-2">
                  <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </span>
                <span v-else class="flex items-center gap-2">
                  <span class="text-xl">💾</span>
                  Save Changes
                </span>
              </button>
            </div>
            
            <!-- Feedback Messages -->
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
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { userProfile, isLoggedIn } = storeToRefs(userStore);

const editableProfile = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// 监听从 store 传来的 userProfile 变化
watch(userProfile, (newProfile) => {
  if (newProfile) {
    editableProfile.value = JSON.parse(JSON.stringify(newProfile));
    // 只有在 watcher 首次因数据到达而触发时，才关闭 loading
    if (isLoading.value) {
      isLoading.value = false;
    }
  }
}, { deep: true }); // 使用 deep watch 以防万一

// **核心修复：让组件主动获取数据**
onMounted(async () => {
  // 检查 store 中是否已有数据
  if (!userProfile.value && isLoggedIn.value) {
    isLoading.value = true;
    try {
      // 如果没有，主动调用 action 获取
      await userStore.fetchUserProfile();
    } catch (error) {
      errorMessage.value = "Failed to load profile. Please try again later.";
    } finally {
      // 确保无论成功或失败，都关闭 loading 状态
      isLoading.value = false;
    }
  } else {
    // 如果 store 中已有数据或用户未登录，则直接结束 loading
    isLoading.value = false;
    // 如果已有数据，手动同步一次到 editableProfile
    if(userProfile.value){
       editableProfile.value = JSON.parse(JSON.stringify(userProfile.value));
    }
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

  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

const openLoginModal = () => {
    window.dispatchEvent(new Event('open-login'));
}
</script>

<style scoped>
/* 样式保持不变 */
</style>

