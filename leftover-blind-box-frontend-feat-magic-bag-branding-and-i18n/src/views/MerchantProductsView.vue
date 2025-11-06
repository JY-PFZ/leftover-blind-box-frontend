<template>
  <div class="product-management-container p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Manage Products (Magic Bags)</h1>
      <button @click="openAddModal" class="add-button px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
        Add New Bag
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="magicBagStore.isLoading || merchantStore.isLoading" class="text-center py-10">
      <p class="text-gray-600">Loading products...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="magicBagStore.error || merchantStore.error" class="p-4 bg-red-100 text-red-700 rounded-lg shadow-sm">
      <p class="font-semibold">Failed to load products:</p>
      <p>{{ magicBagStore.error || merchantStore.error }}</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="magicBags.length === 0" class="p-12 text-center bg-gray-50 rounded-lg border">
      <h3 class="text-xl font-semibold text-gray-700 mt-4">No Magic Bags Found</h3>
      <p class="text-gray-500 mt-2">Click "Add New Bag" to list your first product.</p>
    </div>

    <!-- Products List/Table -->
    <div v-else class="magic-bags-list space-y-4">
      <div v-for="bag in magicBags" :key="bag.id" class="bag-item bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-grow">
          <img :src="bag.imageUrl || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=Bag'" 
               alt="Bag Image" 
               class="w-20 h-20 rounded-md object-cover bg-gray-200 flex-shrink-0"
               onerror="this.src='https://placehold.co/80x80/e2e8f0/94a3b8?text=Error'">
          <div class="flex-grow">
            <h3 class="text-lg font-semibold text-gray-800">{{ bag.title }}</h3>
            <p class="text-sm text-gray-500 truncate max-w-xs">{{ bag.description }}</p>
            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span class="font-medium text-green-600">¥{{ parseFloat(bag.price).toFixed(2) }}</span>
              <span>Qty: {{ bag.quantity }}</span>
              <span>Pickup: {{ bag.pickupStartTime }} - {{ bag.pickupEndTime }}</span>
              <span :class="bag.isActive ? 'text-green-600' : 'text-red-600'">
                {{ bag.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
        <div class="action-buttons flex gap-2 flex-shrink-0 mt-4 sm:mt-0">
          <button @click="openEditModal(bag)" class="edit-button px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-sm font-medium">
            Edit
          </button>
          <button @click="confirmDelete(bag.id)" class="delete-button px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <MagicBagForm 
      :show="isModalOpen" 
      :bagToEdit="selectedBag"
      @close="closeModal"
      @saved="handleSave"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMagicBagStore } from '@/stores/magicBag';
import { useMerchantStore } from '@/stores/merchant';
import MagicBagForm from '@/components/MagicBagForm.vue'; // Import the form component

const magicBagStore = useMagicBagStore();
const merchantStore = useMerchantStore();

const magicBags = computed(() => magicBagStore.magicBags);

const isModalOpen = ref(false);
const selectedBag = ref(null); // Used for editing

const loadData = async () => {
  // First, ensure we have the merchant profile (which contains the ID)
  if (!merchantStore.currentMerchant) {
    await merchantStore.fetchMyMerchantProfile();
  }
  // If merchant profile fetch was successful and we have an ID, fetch bags
  if (merchantStore.currentMerchant?.id) {
    await magicBagStore.fetchMyMagicBags();
  } else if (!merchantStore.isLoading) {
    // If loading finished but still no merchant, likely an error occurred
    console.error("Could not load merchant ID, cannot fetch bags.");
    // Error is already set in merchantStore, view will display it
  }
};

onMounted(() => {
  loadData();
});

// --- Modal Handling ---
const openAddModal = () => {
  selectedBag.value = null; // Ensure we are adding, not editing
  isModalOpen.value = true;
};

const openEditModal = (bag) => {
  selectedBag.value = { ...bag }; // Pass a copy to avoid reactivity issues
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedBag.value = null; // Clear selection on close
};

const handleSave = () => {
  // The store action already re-fetches the list on success
  console.log("Save successful, list should refresh.");
};

// --- Delete Handling ---
const confirmDelete = async (bagId) => {
  if (confirm('Are you sure you want to delete this Magic Bag? This action cannot be undone.')) {
    await magicBagStore.deleteMagicBag(bagId);
    // List should refresh automatically due to store action
  }
};

</script>

<style scoped>
/* 手动添加的 CSS (如果 Tailwind 失效) */
.product-management-container { background-color: #ffffff; }
.p-6 { padding: 1.5rem; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mb-6 { margin-bottom: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.text-gray-800 { color: #1f2937; }
.add-button {
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  background-image: linear-gradient(to right, #22c55e, #3b82f6); /* from-green-500 to-blue-500 */
  color: white;
  border-radius: 0.75rem; /* rounded-xl */
  font-weight: 700;
  border: none; cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.text-center { text-align: center; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.text-gray-600 { color: #4b5563; }
.p-4 { padding: 1rem; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-700 { color: #b91c1c; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.font-semibold { font-weight: 600; }
.p-12 { padding: 3rem; }
.bg-gray-50 { background-color: #f9fafb; }
.border { border-width: 1px; border-color: #e5e7eb; }
.text-xl { font-size: 1.25rem; }
.text-gray-700 { color: #374151; }
.mt-4 { margin-top: 1rem; }
.mt-2 { margin-top: 0.5rem; }

.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.bag-item { background-color: #fff; }
.shadow { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06); }
.gap-4 { gap: 1rem; }
.w-20 { width: 5rem; }
.h-20 { height: 5rem; }
.rounded-md { border-radius: 0.375rem; }
.object-cover { object-fit: cover; }
.bg-gray-200 { background-color: #e5e7eb; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-grow { flex-grow: 1; }
.text-lg { font-size: 1.125rem; }
.text-sm { font-size: 0.875rem; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.max-w-xs { max-width: 20rem; }
.flex-wrap { flex-wrap: wrap; }
.gap-x-4 { column-gap: 1rem; }
.gap-y-1 { row-gap: 0.25rem; }
.font-medium { font-weight: 500; }
.text-green-600 { color: #16a34a; }
.text-red-600 { color: #dc2626; }

.action-buttons { display: flex; gap: 0.5rem; }
.edit-button, .delete-button {
  padding: 0.5rem 1rem; /* px-4 py-2 */
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  border: none; cursor: pointer;
}
.edit-button { background-color: #fef3c7; color: #92400e; }
.edit-button:hover { background-color: #fde68a; }
.delete-button { background-color: #fee2e2; color: #b91c1c; }
.delete-button:hover { background-color: #fecaca; }

/* Responsive adjustments */
@media (min-width: 640px) { /* sm */
  .sm\:flex-row { flex-direction: row; }
  .sm\:items-center { align-items: center; }
  .sm\:mt-0 { margin-top: 0; }
}
</style>

