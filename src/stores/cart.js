// src/stores/cart.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';
import apiClient from '@/services/axiosConfig';

// --- 全局模拟数据开关 ---
// 设置为 true 来强制使用模拟数据。这会影响所有购物车操作。
const USE_MOCK_DATA = ref(true);

export const useCartStore = defineStore('cart', () => {
  // --- STATE ---
  const items = ref([]); // 购物车的商品列表，无论是模拟还是真实数据都存在这里
  const isLoading = ref(false);
  const error = ref(null);

  // --- GETTERS ---
  // 计算总商品数量
  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  // 计算总价
  const total = computed(() => items.value.reduce((sum, item) => sum + (item.magicBag.price * item.quantity), 0));
  const isEmpty = computed(() => items.value.length === 0);

  // --- ACTIONS ---

  /**
   * 核心修正：获取购物车信息
   * 在模拟模式下，此函数会直接返回，不做任何事，以保留本地已添加的模拟商品。
   */
  async function fetchCart() {
    if (USE_MOCK_DATA.value) {
      console.log("购物车：运行在模拟模式，跳过API请求。");
      isLoading.value = false;
      return;
    }
    
    const userStore = useUserStore();
    if (!userStore.isLoggedIn || !userStore.userProfile?.id) return;
    const userId = userStore.userProfile.id;

    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(`/cart/${userId}/items`);
      items.value = response.data?.data?.items || [];
    } catch (err) {
      error.value = 'Could not fetch cart items.';
      console.error('Failed to fetch cart:', err);
      items.value = []; // 失败时清空
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 添加商品到购物车
   */
  async function addToCart(product) {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) {
      alert('请先登录再添加商品。');
      return;
    }

    // --- 模拟模式逻辑 ---
    if (USE_MOCK_DATA.value) {
      const existingItem = items.value.find(item => item.magicBagId === product.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        // 新增：创建与 CartView.vue 期望的完全一致的数据结构
        items.value.push({
          magicBagId: product.id,
          magicBag: { ...product }, // 嵌套 product 对象
          quantity: 1
        });
      }
      alert(`(模拟) "${product.title}" 已添加到购物车！`);
      return;
    }

    // --- 真实 API 逻辑 ---
    const userId = userStore.userProfile?.id;
    try {
      await apiClient.post(`/cart/${userId}/items`, null, {
        params: { magicbagId: product.id, quantity: 1 }
      });
      await fetchCart(); // 添加成功后刷新整个购物车
      alert(`"${product.title}" 已添加到购物车！`);
    } catch (err) {
      console.error('添加商品失败:', err);
      alert('添加商品时出错，请稍后再试。');
    }
  }
  
  /**
   * 新增：从购物车移除商品
   */
  async function removeFromCart(magicBagId) {
    // --- 模拟模式逻辑 ---
    if (USE_MOCK_DATA.value) {
        items.value = items.value.filter(item => item.magicBagId !== magicBagId);
        return;
    }

    // --- 真实 API 逻辑 ---
    const userStore = useUserStore();
    const userId = userStore.userProfile?.id;
    if (!userId) return;

    try {
      // 假设的删除API端点，你需要根据后端实际情况调整
      await apiClient.delete(`/cart/${userId}/items/${magicBagId}`);
      await fetchCart(); // 移除成功后刷新
    } catch (err) {
      console.error('移除商品失败:', err);
      alert('移除商品时出错。');
    }
  }


  return {
    items, isLoading, error, count, total, isEmpty,
    fetchCart, addToCart, removeFromCart, // 确保导出了新函数
  };
});