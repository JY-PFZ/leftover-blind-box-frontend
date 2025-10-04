<!-- src/views/ProfileView.vue -->
<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1>My Profile</h1>

      <div v-if="isLoading" class="loading-message">
        <p>Loading profile...</p>
      </div>

      <div v-else-if="!userStore.isLoggedIn" class="loading-message">
        <p>Please log in to view your profile.</p>
      </div>
      
      <!-- The main form for editing the profile -->
      <form v-else-if="editableProfile" @submit.prevent="handleSave" class="profile-form">
        
        <div class="form-group">
          <label for="username">Email (Username)</label>
          <input id="username" type="email" :value="editableProfile.username" disabled />
          <small>Your email is used for login and cannot be changed.</small>
        </div>

        <div class="form-group">
          <label for="nickname">Nickname</label>
          <input id="nickname" type="text" v-model="editableProfile.nickname" placeholder="Enter your nickname" />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input id="phone" type="tel" v-model="editableProfile.phone" placeholder="Enter your phone number" />
        </div>
        
        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="submit" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
        
        <!-- Feedback Messages -->
        <div v-if="successMessage" class="feedback-message success">{{ successMessage }}</div>
        <div v-if="errorMessage" class="feedback-message error">{{ errorMessage }}</div>

      </form>
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