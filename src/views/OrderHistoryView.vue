<!-- src/views/OrderHistoryView.vue -->
<template>
   <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
     <div class="max-w-6xl mx-auto p-4 sm:p-6">
       <!-- Back Button -->
       <div class="mb-8">
         <button @click="$router.push('/')" class="group flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl text-gray-700 hover:text-gray-900 transition-all duration-300 border border-gray-200">
           <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
             <span class="text-lg">←</span>
           </div>
           <span class="font-semibold text-lg">Back to Home</span>
           <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
         </button>
       </div>

       <!-- Order History Panel -->
       <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
         <!-- Top Decor Bar -->
         <div class="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

         <div class="p-8">
           <!-- Page Title -->
           <div class="text-center mb-8">
             <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
               <span class="text-white text-3xl">📦</span>
             </div>
             <h1 class="text-4xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
               Order History
             </h1>
             <p class="text-gray-500 text-lg mt-2">View all your past orders</p>
           </div>

           <!-- Loading State -->
           <div v-if="orderStore.isLoading" class="text-center py-16">
             <div class="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
             <p class="text-gray-600 text-xl">Loading order history...</p>
           </div>

           <!-- Error State -->
           <div v-else-if="orderStore.error" class="text-center py-16">
             <div class="text-8xl mb-6">⚠️</div>
             <h3 class="text-2xl font-bold text-gray-800 mb-4">Failed to Load</h3>
             <p class="text-gray-600 text-lg mb-8">{{ orderStore.error || "Could not load order history. Please try again later." }}</p>
             <button @click="loadOrders" class="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
               🔄 Reload
             </button>
           </div>

           <!-- Empty State -->
           <div v-else-if="orderStore.orders.length === 0" class="text-center py-16">
             <div class="text-8xl mb-6">📦</div>
             <h3 class="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h3>
             <p class="text-gray-600 text-lg mb-8">You haven't placed any orders yet.</p>
             <button @click="$router.push('/')" class="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
               🛒 Shop Now
             </button>
           </div>

           <!-- Orders List -->
           <div v-else class="space-y-6">
             <div v-for="order in orderStore.orders" :key="order.id" class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
               <!-- Order Header -->
               <div class="flex items-center justify-between mb-4">
                 <div class="flex items-center gap-4">
                   <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                     <span class="text-white text-xl font-bold">#</span>
                   </div>
                   <div>
                     <h3 class="text-xl font-bold text-gray-800">Order #{{ order.orderNo }}</h3>
                     <p class="text-gray-500">{{ formatDate(order.createdAt) }}</p>
                   </div>
                 </div>
                 <div :class="['px-4 py-2 rounded-full font-bold text-sm', getStatusClass(order.status)]">
                   {{ formatStatus(order.status) }}
                 </div>
               </div>

               <!-- Order Details -->
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                 <div class="space-y-3">
                   <div class="flex items-center gap-3">
                     <span class="text-2xl">🏪</span>
                     <div>
                       <p class="text-sm text-gray-500">Merchant</p>
                       <p class="font-semibold text-gray-800">{{ order.merchantName || 'N/A' }}</p>
                     </div>
                   </div>
                   <div class="flex items-center gap-3">
                     <span class="text-2xl">🎁</span>
                     <div>
                       <p class="text-sm text-gray-500">Item</p>
                       <p class="font-semibold text-gray-800">{{ order.bagTitle || 'N/A' }}</p>
                     </div>
                   </div>
                 </div>

                 <div class="flex items-center justify-between md:justify-end">
                   <div class="text-right">
                     <p class="text-sm text-gray-500">Total Price</p>
                     <p class="text-3xl font-bold text-green-600">${{ (order.totalPrice || 0).toFixed(2) }}</p>
                   </div>
          </div>
            </div>

               <!-- Action Button -->
               <div class="flex justify-end">
                 <!-- TODO: Add click handler to navigate to order detail page -->
                 <button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                   <span class="flex items-center gap-2">
                     <span class="text-lg">👁️</span>
                     View Details
                   </span>
                 </button>
            </div>
          </div>
           </div>

           <!-- Pagination Controls (Optional) -->
           <!--
           <div v-if="orderStore.pagination.totalPages > 1" class="mt-8 flex justify-center">
             Pagination Controls Here...
           </div>
           -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
 import { onMounted } from 'vue';
 import { useOrderStore } from '@/stores/order'; // Import the new store

 // --- Use the new Store ---
 const orderStore = useOrderStore();

// --- METHODS ---
const loadOrders = async () => {
   // Call the action from the store
   await orderStore.fetchOrders();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
   try {
       const date = new Date(dateString);
       if (isNaN(date)) return 'Invalid Date';
       // Use en-US locale for English formatting
       return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
   } catch (e) {
       console.error("Error formatting date:", dateString, e);
       return 'Invalid Date';
   }
};

const getStatusClass = (status) => {
   if (!status) return 'status-pending'; // Default
   const lowerStatus = status.toLowerCase();
   if (lowerStatus === 'completed') return 'status-completed';
   if (lowerStatus === 'cancelled') return 'status-cancelled';
   if (lowerStatus === 'paid') return 'status-paid'; // Style for paid status
   return 'status-pending'; // Includes pending
 };

 const formatStatus = (status) => {
     if (!status) return 'Pending';
  const lowerStatus = status.toLowerCase();
     switch (lowerStatus) {
         // Return English status labels
         case 'completed': return 'Completed';
         case 'cancelled': return 'Cancelled';
         case 'paid': return 'Ready for Pickup'; // Display 'paid' as Ready for Pickup
         case 'pending': return 'Pending Payment'; // Display 'pending' as Pending Payment
         default: return status; // Fallback
     }
 };


// --- LIFECYCLE ---
onMounted(() => {
   // Call the store action when component mounts
  loadOrders();
});
</script>

<style scoped>
 /* Status badge styles */
 .status-completed { background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; } /* Green */
 .status-paid { background-color: #e0f2fe; color: #0284c7; border: 1px solid #7dd3fc; } /* Light Blue */
 .status-cancelled { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; } /* Red */
 .status-pending { background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; } /* Yellow */

 /* Other styles remain the same */
 .min-h-screen { min-height: 100vh; }
 .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
 .from-green-50 { --tw-gradient-from: #f0fdf4; --tw-gradient-to: rgba(240, 253, 244, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .via-white { --tw-gradient-stops: var(--tw-gradient-from), #ffffff, var(--tw-gradient-to); }
 .to-blue-50 { --tw-gradient-to: #eff6ff; }
 .max-w-6xl { max-width: 72rem; }
 .mx-auto { margin-left: auto; margin-right: auto; }
 .p-4 { padding: 1rem; }
 .sm\:p-6 { padding: 1.5rem; }
 .mb-8 { margin-bottom: 2rem; }
 .group { /* Utility class for styling based on parent state */ }
 .flex { display: flex; }
 .items-center { align-items: center; }
 .gap-3 { gap: 0.75rem; }
 .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
 .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
 .bg-white\/90 { background-color: rgba(255, 255, 255, 0.9); }
 .backdrop-blur-sm { --tw-backdrop-blur: blur(4px); backdrop-filter: var(--tw-backdrop-filter); }
 .rounded-2xl { border-radius: 1rem; }
 .shadow-lg { --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); }
 .hover\:shadow-xl:hover { --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); }
 .text-gray-700 { --tw-text-opacity: 1; color: rgba(55, 65, 81, var(--tw-text-opacity)); }
 .hover\:text-gray-900:hover { --tw-text-opacity: 1; color: rgba(17, 24, 39, var(--tw-text-opacity)); }
 .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
 .duration-300 { transition-duration: 300ms; }
 .border { border-width: 1px; }
 .border-gray-200 { --tw-border-opacity: 1; border-color: rgba(229, 231, 235, var(--tw-border-opacity)); }
 .w-8 { width: 2rem; }
 .h-8 { height: 2rem; }
 .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
 .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-to: rgba(59, 130, 246, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .to-purple-500 { --tw-gradient-to: #a855f7; }
 .rounded-full { border-radius: 9999px; }
 .justify-center { justify-content: center; }
 .text-white { --tw-text-opacity: 1; color: rgba(255, 255, 255, var(--tw-text-opacity)); }
 .group-hover\:scale-110:hover { --tw-scale-x: 1.1; --tw-scale-y: 1.1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
 .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
 .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
 .font-semibold { font-weight: 600; }
 .w-2 { width: 0.5rem; }
 .h-2 { height: 0.5rem; }
 .group-hover\:scale-150:hover { --tw-scale-x: 1.5; --tw-scale-y: 1.5; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
 .rounded-3xl { border-radius: 1.5rem; }
 .shadow-2xl { --tw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); }
 .overflow-hidden { overflow: hidden; }
 .border-gray-100 { --tw-border-opacity: 1; border-color: rgba(243, 244, 246, var(--tw-border-opacity)); }
 .h-2 { height: 0.5rem; }
 .from-green-500 { --tw-gradient-from: #22c55e; --tw-gradient-to: rgba(34, 197, 94, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .via-blue-500 { --tw-gradient-stops: var(--tw-gradient-from), #3b82f6, var(--tw-gradient-to); }
 .p-8 { padding: 2rem; }
 .text-center { text-align: center; }
 .w-20 { width: 5rem; }
 .h-20 { height: 5rem; }
 .mx-auto { margin-left: auto; margin-right: auto; }
 .mb-4 { margin-bottom: 1rem; }
 .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
 .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
 .font-black { font-weight: 900; }
 .from-green-600 { --tw-gradient-from: #16a34a; --tw-gradient-to: rgba(22, 163, 74, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .via-blue-600 { --tw-gradient-stops: var(--tw-gradient-from), #2563eb, var(--tw-gradient-to); }
 .to-purple-600 { --tw-gradient-to: #9333ea; }
 .bg-clip-text { background-clip: text; }
 .text-transparent { color: transparent; }
 .text-gray-500 { --tw-text-opacity: 1; color: rgba(107, 114, 128, var(--tw-text-opacity)); }
 .mt-2 { margin-top: 0.5rem; }
 .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
 .animate-spin { animation: spin 1s linear infinite; }
 .w-16 { width: 4rem; }
 .h-16 { height: 4rem; }
 .border-4 { border-width: 4px; }
 .border-green-500 { --tw-border-opacity: 1; border-color: rgba(34, 197, 94, var(--tw-border-opacity)); }
 .border-t-transparent { border-top-color: transparent; }
 .text-gray-600 { --tw-text-opacity: 1; color: rgba(75, 85, 99, var(--tw-text-opacity)); }
 .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
 .text-8xl { font-size: 6rem; line-height: 1; }
 .mb-6 { margin-bottom: 1.5rem; }
 .text-2xl { font-size: 1.5rem; line-height: 2rem; }
 .font-bold { font-weight: 700; }
 .text-gray-800 { --tw-text-opacity: 1; color: rgba(31, 41, 55, var(--tw-text-opacity)); }
 .px-8 { padding-left: 2rem; padding-right: 2rem; }
 .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
 .text-white { --tw-text-opacity: 1; color: rgba(255, 255, 255, var(--tw-text-opacity)); }
 .hover\:from-green-700:hover { --tw-gradient-from: #15803d; --tw-gradient-to: rgba(21, 128, 61, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .hover\:to-blue-700:hover { --tw-gradient-to: #1d4ed8; }
 .duration-200 { transition-duration: 200ms; }
 .transform { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
 .hover\:scale-105:hover { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
 .space-y-6 > :not([hidden]) ~ :not([hidden]) { --tw-space-y-reverse: 0; margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom: calc(1.5rem * var(--tw-space-y-reverse)); }
 .from-gray-50 { --tw-gradient-from: #f9fafb; --tw-gradient-to: rgba(249, 250, 251, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .to-blue-50 { --tw-gradient-to: #eff6ff; }
 .p-6 { padding: 1.5rem; }
 .justify-between { justify-content: space-between; }
 .gap-4 { gap: 1rem; }
 .w-12 { width: 3rem; }
 .h-12 { height: 3rem; }
 .px-4 { padding-left: 1rem; padding-right: 1rem; }
 .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
 .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
 .grid { display: grid; }
 .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
 @media (min-width: 768px) {
   .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
   .md\:justify-end { justify-content: flex-end; }
 }
 .gap-6 { gap: 1.5rem; }
 .space-y-3 > :not([hidden]) ~ :not([hidden]) { --tw-space-y-reverse: 0; margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom: calc(0.75rem * var(--tw-space-y-reverse)); }
 .text-2xl { font-size: 1.5rem; line-height: 2rem; }
 .text-right { text-align: right; }
 .text-green-600 { --tw-text-opacity: 1; color: rgba(22, 163, 74, var(--tw-text-opacity)); }
 .justify-end { justify-content: flex-end; }
 .from-blue-600 { --tw-gradient-from: #2563eb; --tw-gradient-to: rgba(37, 99, 235, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .to-purple-600 { --tw-gradient-to: #9333ea; }
 .hover\:from-blue-700:hover { --tw-gradient-from: #1d4ed8; --tw-gradient-to: rgba(29, 78, 216, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
 .hover\:to-purple-700:hover { --tw-gradient-to: #7e22ce; }
 .gap-2 { gap: 0.5rem; }

 @keyframes spin {
   to {
     transform: rotate(360deg);
   }
}
</style>

