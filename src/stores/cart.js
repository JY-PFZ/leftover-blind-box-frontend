import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/utils/api';
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', () => {
  // --- 状态 (State) ---
  const cartId = ref(null);
  const items = ref([]);
  const total = ref(0);
  const isLoading = ref(false);

  // --- 计算属性 (Getters) ---
  const count = computed(() => items.value.reduce((sum, item) => sum + (item.quantity || 0), 0));

  // --- 内部辅助函数 ---
  function _updateCartState(cartDto) {
    if (cartDto && Array.isArray(cartDto.items)) {
      cartId.value = cartDto.cartId;
      items.value = cartDto.items; // 直接使用后端返回的数组
      total.value = cartDto.total;
    } else {
      cartId.value = null;
      items.value = [];
      total.value = 0;
    }
  }

  // --- Actions ---
  async function fetchCart() {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn || !userStore.userProfile?.id) {
      console.log("[CartStore] User not logged in, skipping cart fetch.");
      return;
    }
    const userId = userStore.userProfile.id;

    isLoading.value = true;
    try {
      const response = await api.get(`/api/cart/${userId}`);
      const cartData = response.data.data || response.data;
      _updateCartState(cartData);
      console.log("[CartStore] Cart data synced successfully:", cartData);
    } catch (error) {
      console.error("[CartStore] Failed to fetch cart:", error);
      _updateCartState(null);
    } finally {
      isLoading.value = false;
    }
  }

  async function addItemToCart(product, quantity = 1) {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn || !userStore.userProfile?.id) {
      window.dispatchEvent(new Event('open-login'));
      return;
    }
    const userId = userStore.userProfile.id;
    const magicbagId = product.id; // 🟢 [FIX] 使用 product.id 作为 magicbagId

    if (!magicbagId) {
      console.error("[CartStore] Add failed: product.id (magicbagId) is invalid.");
      return;
    }

    isLoading.value = true;
    try {
      const response = await api.post(`/api/cart/${userId}/items`, null, {
        params: { magicbagId, quantity } // 🟢 [FIX] API 参数改为 magicbagId (lowercase)
      });
      const cartData = response.data.data || response.data;
      _updateCartState(cartData);
    } catch (error) {
      console.error(`[CartStore] Failed to add item #${magicbagId}:`, error);
    } finally {
      isLoading.value = false;
    }
  }

  async function updateItemQuantity(magicbagId, quantity) { // 🟢 [FIX] 参数名改为 lowercase
    if (quantity <= 0) {
      await removeItemFromCart(magicbagId);
      return;
    }
    
    const userStore = useUserStore();
    const userId = userStore.userProfile?.id;
    if (!userId || !magicbagId) return;

    isLoading.value = true;
    try {
      // 🟢 [FIX] API 路径使用 magicbagId (lowercase)
      const response = await api.put(`/api/cart/${userId}/items/${magicbagId}`, null, {
        params: { quantity }
      });
      const cartData = response.data.data || response.data;
      _updateCartState(cartData);
    } catch (error) {
      console.error(`[CartStore] Failed to update quantity for item #${magicbagId}:`, error);
    } finally {
      isLoading.value = false;
    }
  }

  async function removeItemFromCart(magicbagId) { // 🟢 [FIX] 参数名改为 lowercase
    const userStore = useUserStore();
    const userId = userStore.userProfile?.id;
    if (!userId || !magicbagId) return;

    isLoading.value = true;
    try {
      // 🟢 [FIX] API 路径使用 magicbagId (lowercase)
      const response = await api.delete(`/api/cart/${userId}/items/${magicbagId}`);
      const cartData = response.data.data || response.data;
      _updateCartState(cartData);
    } catch (error) {
      console.error(`[CartStore] Failed to remove item #${magicbagId}:`, error);
    } finally {
      isLoading.value = false;
    }
  }

  async function clearServerCart() {
    const userStore = useUserStore();
    const userId = userStore.userProfile?.id;
    if (!userId) return;

    isLoading.value = true;
    try {
      const response = await api.delete(`/api/cart/${userId}/items`);
      const cartData = response.data.data || response.data;
      _updateCartState(cartData);
    } catch (error) {
      console.error("[CartStore] Failed to clear cart:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function clearClientCart() {
    cartId.value = null;
    items.value = [];
    total.value = 0;
    console.log("[CartStore] Client-side cart state cleared.");
  }

  return {
    cartId,
    items,
    total,
    count,
    isLoading,
    fetchCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearServerCart,
    clearClientCart,
  };
});