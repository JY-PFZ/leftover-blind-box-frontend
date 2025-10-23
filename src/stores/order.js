import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { useCartStore } from './cart'
import { api } from '@/utils/api'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const isLoading = ref(false)
  const userStore = useUserStore()
  const cartStore = useCartStore()

  // 计算属性
  const customerOrders = computed(() => {
    return orders.value.filter(order => order.customerId === userStore.userProfile?.id)
  })

  const merchantOrders = computed(() => {
    return orders.value.filter(order => order.merchantId === userStore.userProfile?.id)
  })

  const pendingOrders = computed(() => {
    return orders.value.filter(order => order.status === 'pending')
  })

  const completedOrders = computed(() => {
    return orders.value.filter(order => order.status === 'completed')
  })

  // 获取订单列表
  async function loadOrders() {
    isLoading.value = true
    try {
      const response = await api.get('/orders')
      if (response.data.code === 1) {
        orders.value = response.data.data || []
        console.log('✅ 订单列表加载成功:', orders.value.length, '个订单')
      } else {
        console.error('❌ 订单列表加载失败:', response.data.message)
        orders.value = []
      }
    } catch (error) {
      console.error('❌ 订单列表加载失败:', error)
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 获取客户订单
  async function loadCustomerOrders() {
    isLoading.value = true
    try {
      console.log('🔄 加载客户订单...')
      const response = await api.get('/orders')
      if (response.success && response.data) {
        orders.value = response.data.records || []
        console.log('✅ 客户订单加载成功:', orders.value.length, '个订单')
      } else {
        console.error('❌ 客户订单加载失败:', response.error)
        orders.value = []
      }
    } catch (error) {
      console.error('❌ 客户订单加载失败:', error)
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 获取商家订单
  async function loadMerchantOrders() {
    isLoading.value = true
    try {
      console.log('🔄 加载商家订单...')
      const response = await api.get('/orders')
      if (response.success && response.data) {
        orders.value = response.data.records || []
        console.log('✅ 商家订单加载成功:', orders.value.length, '个订单')
      } else {
        console.error('❌ 商家订单加载失败:', response.error)
        orders.value = []
      }
    } catch (error) {
      console.error('❌ 商家订单加载失败:', error)
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 创建订单 - 正确的流程：先下单，再放到购物车，最后结算
  async function createOrder(orderData) {
    try {
      console.log('🔄 创建订单（正确流程）:', orderData)
      
      // 确保用户信息已初始化
      console.log('🔄 调用ensureAuth...');
      await userStore.ensureAuth();
      console.log('✅ ensureAuth完成');
      
      const userId = userStore.userId;
      console.log('🔍 用户信息检查:', {
        userProfile: userStore.userProfile,
        userId: userId,
        isLoggedIn: userStore.isLoggedIn,
        token: userStore.token ? 'exists' : 'missing'
      });
      if (!userId) {
        throw new Error('用户未登录')
      }
      
      // 前端价格计算逻辑：商品价格 × 数量 = 总价
      const productPrice = Number(orderData.productPrice || orderData.price || 0);
      const quantity = Number(orderData.quantity || 1);
      const totalAmount = Number((productPrice * quantity).toFixed(2));
      
      console.log('💰 前端价格计算:', {
        productId: orderData.productId,
        productTitle: orderData.productTitle,
        unitPrice: productPrice,
        quantity: quantity,
        totalAmount: totalAmount,
        calculation: `${productPrice} × ${quantity} = ${totalAmount}`
      });
      
      // 1. 先创建订单（模拟）
      const mockOrder = {
        id: Date.now(),
        orderNo: `ORD${Date.now()}`,
        productId: orderData.productId,
        merchantId: orderData.merchantId,
        customerId: userId,
        productTitle: orderData.productTitle,
        productPrice: productPrice,
        quantity: quantity,
        totalAmount: totalAmount,
        status: 'pending',
        orderDate: new Date().toISOString(),
        pickupTime: orderData.pickupTime || '09:00:00',
        pickupEndTime: orderData.pickupEndTime || '18:00:00'
      }
      
      console.log('✅ 订单创建成功:', mockOrder)
      
      // 2. 添加到前端购物车（显示购物车数量+1）
      console.log('🛒 添加到前端购物车...')
      const productForCart = {
        id: orderData.productId,
        title: orderData.productTitle,
        price: productPrice, // 使用计算后的价格
        merchant: { id: orderData.merchantId }
      }
      cartStore.add(productForCart, orderData.quantity || 1)
      console.log('✅ 已添加到前端购物车，购物车数量:', cartStore.count)
      
      // 3. 暂时跳过后端购物车API（后端数据库表结构问题）
      console.log('⚠️ 暂时跳过后端购物车API调用（后端数据库表结构问题）');
      console.log('🔍 后端错误：cart_items表缺少cart_item_id字段');
      console.log('💡 前端购物车功能正常，可以继续使用');
      
      /* 暂时注释掉后端购物车API调用
      try {
        // 确保用户有购物车
        let cartResponse
        try {
          cartResponse = await api.get(`/cart/${userId}`)
        } catch (error) {
          console.log('🛒 创建新购物车...')
          cartResponse = await api.post(`/cart/${userId}`)
        }
        
        // 添加商品到后端购物车
        console.log('🛒 将订单商品添加到后端购物车...')
        console.log('🔍 发送Query参数:', {
          magicbagId: orderData.productId,
          quantity: orderData.quantity || 1
        });
        const addToCartResponse = await api.post(`/cart/${userId}/items?magicbagId=${orderData.productId}&quantity=${orderData.quantity || 1}`)
        
        console.log('✅ 订单已添加到后端购物车:', addToCartResponse.data)
        
      } catch (cartError) {
        console.warn('⚠️ 添加到后端购物车失败，但前端购物车已更新:', cartError.message)
        console.log('🔍 购物车API错误详情:', {
          status: cartError.response?.status,
          data: cartError.response?.data,
          url: cartError.config?.url,
          requestData: cartError.config?.data
        });
        console.log('🔍 完整错误数据:', cartError.response?.data);
        console.log('🔍 请求数据:', cartError.config?.data);
        
        // 如果是400/409错误，可能是商品已存在，尝试更新数量
        const status = cartError.response?.status;
        if (status === 400 || status === 409) {
          console.log('🔄 尝试更新购物车商品数量...');
          try {
            const updateResponse = await api.put(`/cart/${userId}/items/${orderData.productId}`, {
              quantity: orderData.quantity || 1
            });
            console.log('✅ 购物车商品数量更新成功:', updateResponse.data);
          } catch (updateError) {
            console.log('❌ 更新购物车商品数量也失败:', updateError.message);
          }
        }
      }
      */
      
      // 4. 将订单添加到本地状态
      orders.value.unshift(mockOrder)
      
      return { success: true, data: mockOrder, message: '商品已添加到购物车！' }
      
    } catch (error) {
      console.error('❌ 订单创建失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 更新订单状态
  async function updateOrderStatus(orderId, status) {
    try {
      console.log('🔄 更新订单状态:', { orderId, status })
      
      const response = await api.put(`/orders/${orderId}/status`, { status })
      
      if (response.data.code === 1) {
        // 更新本地订单状态
        const orderIndex = orders.value.findIndex(order => order.id === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = status
          orders.value[orderIndex].updatedAt = new Date().toISOString()
        }
        
        console.log('✅ 订单状态更新成功:', { orderId, status })
        return { success: true }
      } else {
        console.error('❌ 订单状态更新失败:', response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('❌ 订单状态更新失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 标记订单为已完成
  async function completeOrder(orderId) {
    return await updateOrderStatus(orderId, 'completed')
  }

  // 标记订单为等待取货
  async function markOrderPending(orderId) {
    return await updateOrderStatus(orderId, 'pending')
  }

  // 根据ID查找订单
  function findOrderById(orderId) {
    return orders.value.find(order => order.id === orderId)
  }

  // 清空订单列表
  function clearOrders() {
    orders.value = []
  }

  return {
    // 状态
    orders,
    isLoading,
    
    // 计算属性
    customerOrders,
    merchantOrders,
    pendingOrders,
    completedOrders,
    
    // 方法
    loadOrders,
    loadCustomerOrders,
    loadMerchantOrders,
    createOrder,
    updateOrderStatus,
    completeOrder,
    markOrderPending,
    findOrderById,
    clearOrders
  }
})
