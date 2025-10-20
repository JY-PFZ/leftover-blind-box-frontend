// src/stores/order.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', () => {
  // 订单状态
  const orders = ref([])
  const currentOrder = ref(null)
  const orderIdCounter = ref(1)

  // 创建订单
  const createOrder = (cartItems, userInfo) => {
    const orderId = `ORD-${Date.now()}-${orderIdCounter.value++}`
    const order = {
      id: orderId,
      userId: userInfo.username,
      userEmail: userInfo.email,
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.title,
        productPrice: item.price,
        quantity: item.qty,
        totalPrice: item.price * item.qty
      })),
      totalAmount: cartItems.reduce((total, item) => total + (item.price * item.qty), 0),
      status: 'pending', // pending, confirmed, shipped, delivered, cancelled
      paymentMethod: 'credit_card', // 默认支付方式
      shippingAddress: 'Default Address', // 默认地址
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    orders.value.push(order)
    currentOrder.value = order
    
    // 保存到localStorage
    localStorage.setItem('orders', JSON.stringify(orders.value))
    
    console.log('📦 订单创建成功:', order)
    return order
  }

  // 获取用户订单
  const getUserOrders = (userId) => {
    return orders.value.filter(order => order.userId === userId)
  }

  // 获取订单详情
  const getOrderById = (orderId) => {
    return orders.value.find(order => order.id === orderId)
  }

  // 更新订单状态
  const updateOrderStatus = (orderId, newStatus) => {
    const order = orders.value.find(order => order.id === orderId)
    if (order) {
      order.status = newStatus
      order.updatedAt = new Date().toISOString()
      localStorage.setItem('orders', JSON.stringify(orders.value))
      console.log('📦 订单状态更新:', orderId, '->', newStatus)
    }
  }

  // 取消订单
  const cancelOrder = (orderId) => {
    updateOrderStatus(orderId, 'cancelled')
  }

  // 确认订单
  const confirmOrder = (orderId) => {
    updateOrderStatus(orderId, 'confirmed')
  }

  // 发货
  const shipOrder = (orderId) => {
    updateOrderStatus(orderId, 'shipped')
  }

  // 完成订单
  const completeOrder = (orderId) => {
    updateOrderStatus(orderId, 'delivered')
  }

  // 获取订单统计
  const getOrderStats = (userId) => {
    const userOrders = getUserOrders(userId)
    return {
      total: userOrders.length,
      pending: userOrders.filter(o => o.status === 'pending').length,
      confirmed: userOrders.filter(o => o.status === 'confirmed').length,
      shipped: userOrders.filter(o => o.status === 'shipped').length,
      delivered: userOrders.filter(o => o.status === 'delivered').length,
      cancelled: userOrders.filter(o => o.status === 'cancelled').length,
      totalAmount: userOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    }
  }

  // 初始化 - 从localStorage加载订单
  const initialize = () => {
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      orders.value = JSON.parse(savedOrders)
      console.log('📦 加载订单数据:', orders.value.length, '个订单')
    }
  }

  // 清空订单（用于测试）
  const clearOrders = () => {
    orders.value = []
    localStorage.removeItem('orders')
    console.log('📦 清空所有订单')
  }

  return {
    orders,
    currentOrder,
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    confirmOrder,
    shipOrder,
    completeOrder,
    getOrderStats,
    initialize,
    clearOrders
  }
})
