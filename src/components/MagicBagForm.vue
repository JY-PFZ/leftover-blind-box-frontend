<template>
  <!-- 简单的模态框容器 (需要配合 Modal 组件或 CSS 实现显示/隐藏) -->
  <div v-if="show" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white p-5 border-b border-gray-200 z-10">
        <h2 class="text-2xl font-bold text-gray-800">{{ isEditing ? 'Edit Magic Bag' : 'Add New Magic Bag' }}</h2>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Title <span class="text-red-500">*</span></label>
          <input type="text" id="title" v-model="formData.title" required 
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" v-model="formData.description" rows="3"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>

        <!-- Price -->
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">Price (¥) <span class="text-red-500">*</span></label>
          <input type="number" id="price" v-model.number="formData.price" required min="0.01" step="0.01"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>

        <!-- Quantity -->
        <div>
          <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity Available <span class="text-red-500">*</span></label>
          <input type="number" id="quantity" v-model.number="formData.quantity" required min="0" step="1"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>

        <!-- Pickup Time Start -->
        <div>
          <label for="pickupStartTime" class="block text-sm font-medium text-gray-700">Pickup Start Time <span class="text-red-500">*</span></label>
          <input type="time" id="pickupStartTime" v-model="formData.pickupStartTime" required
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>

        <!-- Pickup Time End -->
        <div>
          <label for="pickupEndTime" class="block text-sm font-medium text-gray-700">Pickup End Time <span class="text-red-500">*</span></label>
          <input type="time" id="pickupEndTime" v-model="formData.pickupEndTime" required
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
        
        <!-- Available Date (Optional based on backend DTO) -->
        <div>
          <label for="availableDate" class="block text-sm font-medium text-gray-700">Available Date</label>
          <input type="date" id="availableDate" v-model="formData.availableDate"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>

        <!-- Category (Optional based on backend DTO) -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
          <input type="text" id="category" v-model="formData.category" placeholder="e.g., Bakery, Groceries"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>

        <!-- Image URL (Optional based on backend DTO) -->
        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="url" id="imageUrl" v-model="formData.imageUrl" placeholder="https://example.com/image.jpg"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>

        <!-- Is Active (Only for Editing) -->
        <div v-if="isEditing">
          <label class="flex items-center">
            <input type="checkbox" v-model="formData.isActive" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <span class="ml-2 text-sm text-gray-700">Is Active (Visible to customers)</span>
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <!-- Form Actions -->
        <div class="pt-5 flex justify-end gap-3 sticky bottom-0 bg-white py-4 px-6 border-t border-gray-200 -mx-6 -mb-6 rounded-b-lg">
          <button type="button" @click="$emit('close')" 
                  class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting"
                  class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Bag') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue';
import { useMagicBagStore } from '@/stores/magicBag';

const props = defineProps({
  show: Boolean, // Controls modal visibility
  bagToEdit: { // Pass the bag object if editing
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']); // Events emitted by the component

const magicBagStore = useMagicBagStore();
const isSubmitting = ref(false);
const errorMessage = ref('');

// Reactive form data object
const formData = reactive({
  id: null, // Only used for editing
  title: '',
  description: '',
  price: null,
  quantity: null,
  pickupStartTime: '', // Format should be HH:MM
  pickupEndTime: '',   // Format should be HH:MM
  availableDate: '', // Format should be YYYY-MM-DD
  category: '',
  imageUrl: '',
  isActive: true, // Default for new bags
  // merchantId will be added by the store action
});

const isEditing = computed(() => !!props.bagToEdit);

// Reset form to default state
const resetForm = () => {
  formData.id = null;
  formData.title = '';
  formData.description = '';
  formData.price = null;
  formData.quantity = null;
  formData.pickupStartTime = '';
  formData.pickupEndTime = '';
  formData.availableDate = '';
  formData.category = '';
  formData.imageUrl = '';
  formData.isActive = true; // Default for new
  errorMessage.value = '';
  isSubmitting.value = false;
};

// Watch for changes in bagToEdit to populate form for editing
watch(() => props.bagToEdit, (newBag) => {
  if (newBag) {
    formData.id = newBag.id;
    formData.title = newBag.title || '';
    formData.description = newBag.description || '';
    formData.price = newBag.price != null ? parseFloat(newBag.price) : null; // Ensure price is number
    formData.quantity = newBag.quantity != null ? parseInt(newBag.quantity, 10) : null; // Ensure quantity is int
    formData.pickupStartTime = newBag.pickupStartTime || ''; // Assuming backend provides HH:MM
    formData.pickupEndTime = newBag.pickupEndTime || '';   // Assuming backend provides HH:MM
    formData.availableDate = newBag.availableDate ? newBag.availableDate.split('T')[0] : ''; // Format date YYYY-MM-DD
    formData.category = newBag.category || '';
    formData.imageUrl = newBag.imageUrl || '';
    formData.isActive = newBag.isActive !== undefined ? newBag.isActive : true; 
  } else {
    resetForm(); // Reset if no bag is passed (for adding new)
  }
}, { immediate: true }); // Run immediately when component mounts or prop changes

// Handle form submission
const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  // Prepare data for API (exclude ID for creation)
  const dataToSend = { ...formData };
  if (!isEditing.value) {
    delete dataToSend.id; // Don't send id when creating
    delete dataToSend.isActive; // isActive is usually set by default on creation
  } else {
    // For update, only send isActive if it exists in the form
    if (formData.isActive === undefined) delete dataToSend.isActive;
  }
   // Ensure price is a number
   if (dataToSend.price != null) dataToSend.price = parseFloat(dataToSend.price);
   if (dataToSend.quantity != null) dataToSend.quantity = parseInt(dataToSend.quantity, 10);


  try {
    let result;
    if (isEditing.value) {
      result = await magicBagStore.updateMagicBag(formData.id, dataToSend);
    } else {
      result = await magicBagStore.createMagicBag(dataToSend);
    }

    if (result.success) {
      emit('saved'); // Notify parent that save was successful
      emit('close');  // Close the modal
    } else {
      errorMessage.value = result.message || 'An error occurred.';
    }
  } catch (error) {
    errorMessage.value = error.message || 'An unexpected error occurred.';
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form when modal is closed
watch(() => props.show, (newValue) => {
  if (!newValue) {
    // Delay reset slightly to avoid flicker if just reopened
    setTimeout(resetForm, 300); 
  }
});

</script>

<style scoped>
/* Scoped styles for the form if needed */
/* Basic modal styling */
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.bg-opacity-75 { --tw-bg-opacity: 0.75; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.z-50 { z-index: 50; }
.p-4 { padding: 1rem; }
.bg-white { background-color: #fff; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
.w-full { width: 100%; }
.max-w-lg { max-width: 32rem; }
.max-h-\[90vh\] { max-height: 90vh; }
.overflow-y-auto { overflow-y: auto; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.p-5 { padding: 1.25rem; }
.border-b { border-bottom-width: 1px; }
.border-gray-200 { border-color: #e5e7eb; }
.z-10 { z-index: 10; }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.text-gray-800 { color: #1f2937; }
.p-6 { padding: 1.5rem; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.block { display: block; }
.text-sm { font-size: 0.875rem; }
.font-medium { font-weight: 500; }
.text-gray-700 { color: #374151; }
.text-red-500 { color: #ef4444; }
.mt-1 { margin-top: 0.25rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.border { border-width: 1px; }
.border-gray-300 { border-color: #d1d5db; }
.rounded-md { border-radius: 0.375rem; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.focus\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
/* Add more Tailwind classes converted to CSS if needed */

.bg-gray-800 { background-color: #1f2937; }
.pt-5 { padding-top: 1.25rem; }
.justify-end { justify-content: flex-end; }
.gap-3 { gap: 0.75rem; }
.bottom-0 { bottom: 0; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.-mx-6 { margin-left: -1.5rem; margin-right: -1.5rem; }
.-mb-6 { margin-bottom: -1.5rem; }
.rounded-b-lg { border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.bg-gray-200 { background-color: #e5e7eb; }
.hover\:bg-gray-300:hover { background-color: #d1d5db; }
.transition-colors { transition-property: background-color, border-color, color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-blue-600 { --tw-gradient-from: #2563eb; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0)); }
.to-purple-600 { --tw-gradient-to: #9333ea; }
.text-white { color: #fff; }
.hover\:from-blue-700:hover { --tw-gradient-from: #1d4ed8; }
.hover\:to-purple-700:hover { --tw-gradient-to: #7e22ce; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.duration-200 { transition-duration: 200ms; }
.shadow { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06); }
.disabled\:opacity-50:disabled { opacity: 0.5; }
.disabled\:cursor-not-allowed:disabled { cursor: not-allowed; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-700 { color: #b91c1c; }
.ml-2 { margin-left: 0.5rem; }
.text-indigo-600 { color: #4f46e5; }
.focus\:border-indigo-300:focus { border-color: #a5b4fc; }
.focus\:ring { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.focus\:ring-indigo-200:focus { --tw-ring-color: #c7d2fe; }
.focus\:ring-opacity-50:focus { --tw-ring-opacity: 0.5; }
</style>
