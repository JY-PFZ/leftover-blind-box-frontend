<template>
  <div class="relative min-h-screen">
    <!-- Animated Gradient Background -->
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50">
      <div class="absolute inset-0 opacity-30">
        <div 
          v-for="i in 15" 
          :key="i"
          class="absolute w-96 h-96 rounded-full blur-3xl"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)`,
            animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }"
        ></div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div 
          class="text-center space-y-4"
          :class="{ 'animate-fade-in-up': heroVisible }"
        >
          <h1 class="text-5xl sm:text-6xl md:text-7xl font-black text-ink-900 leading-tight">
            My <span class="text-brand">Profile</span>
          </h1>
          <p class="text-xl sm:text-2xl text-ink-700 font-light">
            Manage your account information
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <!-- Loading State -->
      <div 
        v-if="isLoading" 
        class="mt-12 rounded-2xl border border-dashed border-ink-300/70 bg-white/50 backdrop-blur-sm p-10 text-center"
        :class="{ 'animate-fade-in-up': loadingVisible }"
      >
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p class="mt-4 text-ink-700 text-lg">Loading Profile...</p>
      </div>

      <!-- Logged Out State -->
      <div 
        v-else-if="!userStore.isLoggedIn" 
        class="mt-12 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-soft p-16 text-center"
        :class="{ 'animate-fade-in-up': emptyVisible }"
      >
        <div class="text-8xl mb-6 animate-bounce-slow">🔒</div>
        <h2 class="text-3xl font-bold text-ink-900 mb-4">Please Log In</h2>
        <p class="text-lg text-ink-600 mb-8">You need to be logged in to view your profile.</p>
        <button 
          @click="openLoginModal" 
          class="inline-block bg-brand text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-600 transition-all transform hover:scale-105 shadow-xl"
        >
          Go to Login
        </button>
      </div>

      <!-- Profile Form -->
      <div 
        v-else-if="editableProfile" 
        class="mt-8 space-y-6"
        :class="{ 'animate-fade-in-up': formVisible }"
      >
        <!-- User Info Card -->
        <div class="rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-soft p-8">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-gradient-to-br from-brand to-brand-600 rounded-full flex items-center justify-center shadow-xl text-white text-3xl font-black">
              {{ userStore.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div>
              <h3 class="text-3xl font-bold text-ink-900">{{ userStore.username || 'User' }}</h3>
              <p class="text-lg text-ink-600 mt-1">Welcome back!</p>
            </div>
          </div>
        </div>

        <!-- Profile Form Card -->
        <form @submit.prevent="handleSave" class="rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-soft p-8">
          <!-- Form Fields -->
          <div class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="username" class="block text-lg font-bold text-ink-900 mb-3">
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
                class="w-full p-4 bg-ink-100 border-2 border-ink-200 rounded-xl text-ink-600 font-medium focus:outline-none"
              />
              <small class="text-ink-500 mt-2 block text-sm">Your email is used for login and cannot be changed.</small>
            </div>

            <!-- Nickname Field -->
            <div>
              <label for="nickname" class="block text-lg font-bold text-ink-900 mb-3">
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
                class="w-full p-4 border-2 border-ink-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 text-lg bg-white"
              />
            </div>

            <!-- Phone Field -->
            <div>
              <label for="phone" class="block text-lg font-bold text-ink-900 mb-3">
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
                class="w-full p-4 border-2 border-ink-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 text-lg bg-white"
              />
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="mt-8 space-y-4">
            <!-- Save Button -->
            <button 
              type="submit" 
              :disabled="isSaving"
              class="w-full px-6 py-4 bg-brand text-white rounded-xl font-bold text-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <span v-if="isSaving" class="flex items-center justify-center gap-2">
                <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <span class="text-xl">💾</span>
                Save Changes
              </span>
            </button>

            <!-- Upgrade to Merchant Button (only for customers) -->
            <RouterLink 
              v-if="userStore.role === 'customer'"
              to="/merchant/upgrade"
              class="block w-full px-6 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-xl hover:scale-105 active:scale-95 text-center"
            >
              <span class="flex items-center justify-center gap-2">
                <span class="text-xl">🏪</span>
                Upgrade to Merchant
              </span>
            </RouterLink>
          </div>
          
          <!-- Feedback Messages -->
          <div v-if="successMessage" class="mt-6 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-green-800 text-center font-semibold animate-fade-in-up">
            <span class="text-xl mr-2">✅</span>
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-800 text-center font-semibold animate-fade-in-up">
            <span class="text-xl mr-2">❌</span>
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { userProfile, isLoggedIn } = storeToRefs(userStore);

const editableProfile = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Animation states
const heroVisible = ref(false);
const loadingVisible = ref(false);
const emptyVisible = ref(false);
const formVisible = ref(false);

// Watch userProfile changes from store
watch(userProfile, (newProfile) => {
  if (newProfile) {
    editableProfile.value = JSON.parse(JSON.stringify(newProfile));
    // Only close loading when watcher first triggers due to data arrival
    if (isLoading.value) {
      isLoading.value = false;
    }
  }
}, { deep: true });

// Core fix: Let component actively fetch data
onMounted(async () => {
  // Check if store already has data
  if (!userProfile.value && isLoggedIn.value) {
    isLoading.value = true;
    try {
      // If not, actively call action to fetch
      await userStore.fetchUserProfile();
    } catch (error) {
      errorMessage.value = "Failed to load profile. Please try again later.";
    } finally {
      // Ensure loading state is closed regardless of success or failure
      isLoading.value = false;
    }
  } else {
    // If store already has data or user is not logged in, end loading directly
    isLoading.value = false;
    // If data already exists, manually sync once to editableProfile
    if(userProfile.value){
       editableProfile.value = JSON.parse(JSON.stringify(userProfile.value));
    }
  }

  // Trigger animations
  setTimeout(() => {
    heroVisible.value = true;
    if (isLoading.value) {
      loadingVisible.value = true;
    } else if (!userStore.isLoggedIn) {
      emptyVisible.value = true;
    } else {
      formVisible.value = true;
    }
  }, 100);
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
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
    opacity: 0.5;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.animate-bounce-slow {
  animation: bounceSlow 2s ease-in-out infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
