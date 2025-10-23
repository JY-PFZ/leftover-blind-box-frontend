import { api } from '@/utils/api'

// 商品服务 - 适配现有后端API
export const productService = {
  // 获取所有商品（使用现有的API）
  async getAllProducts() {
    try {
      const response = await api.get('/magic-bags', { 
        params: { page: 1, size: 999 } 
      })
      return {
        success: true,
        data: response.data.data.magicBags || []
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      return {
        success: false,
        error: error.message || '获取商品失败'
      }
    }
  },

  // 获取商家商品（使用现有的API）
  async getMerchantProducts(merchantId) {
    try {
      const response = await api.get(`/magic-bags/merchant/${merchantId}`)
      return {
        success: true,
        data: response.data.data || []
      }
    } catch (error) {
      console.error('获取商家商品失败:', error)
      return {
        success: false,
        error: error.message || '获取商家商品失败'
      }
    }
  },

  // 添加商品（使用真实API）
  async addProduct(productData) {
    try {
      console.log('🔄 调用添加商品API:', productData)
      const response = await api.post('/magic-bags', productData)
      console.log('✅ 添加商品成功:', response.data)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('❌ 添加商品失败:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || '添加商品失败'
      }
    }
  },

  // 更新商品（使用真实API）
  async updateProduct(productId, productData) {
    try {
      console.log('🔄 调用更新商品API:', { productId, productData })
      const response = await api.put(`/magic-bags/${productId}`, productData)
      console.log('✅ 更新商品成功:', response.data)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('❌ 更新商品失败:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || '更新商品失败'
      }
    }
  },

  // 删除商品（使用真实API）
  async deleteProduct(productId) {
    try {
      console.log('🔄 调用删除商品API:', productId)
      const response = await api.delete(`/magic-bags/${productId}`)
      console.log('✅ 删除商品成功:', response.data)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('❌ 删除商品失败:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || '删除商品失败'
      }
    }
  },

  // 更新商品价格（使用真实API）
  async updateProductPrice(productId, price) {
    try {
      console.log('🔄 调用更新商品价格API:', { productId, price })
      const response = await api.put(`/magic-bags/${productId}`, { price })
      console.log('✅ 更新商品价格成功:', response.data)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('❌ 更新商品价格失败:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || '更新商品价格失败'
      }
    }
  },

  // 切换商品售罄状态（使用真实API）
  async toggleProductSoldOut(productId, soldOut) {
    try {
      console.log('🔄 调用切换商品售罄状态API:', { productId, soldOut })
      // 使用isActive字段来控制商品是否可用
      const response = await api.put(`/magic-bags/${productId}`, { isActive: !soldOut })
      console.log('✅ 切换商品售罄状态成功:', response.data)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('❌ 切换商品售罄状态失败:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || '切换商品售罄状态失败'
      }
    }
  }
}

// 商家服务 - 为将来后端API集成做准备
export const merchantService = {
  // 获取附近商家
  async getNearbyMerchants(lat, lon) {
    try {
      const response = await api.get('/merchants/nearby', {
        params: { lat, lon }
      })
      return {
        success: true,
        data: response.data.data || []
      }
    } catch (error) {
      console.error('获取附近商家失败:', error)
      return {
        success: false,
        error: error.message || '获取附近商家失败'
      }
    }
  },

  // 获取商家详情
  async getMerchantDetails(merchantId) {
    try {
      const response = await api.get(`/merchants/${merchantId}`)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('获取商家详情失败:', error)
      return {
        success: false,
        error: error.message || '获取商家详情失败'
      }
    }
  }
}

// 订单服务 - 为将来后端API集成做准备
export const orderService = {
  // 创建订单
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      return {
        success: false,
        error: error.message || '创建订单失败'
      }
    }
  },

  // 获取用户订单
  async getUserOrders() {
    try {
      const response = await api.get('/orders')
      return {
        success: true,
        data: response.data.data || []
      }
    } catch (error) {
      console.error('获取用户订单失败:', error)
      return {
        success: false,
        error: error.message || '获取用户订单失败'
      }
    }
  },

  // 更新订单状态
  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status })
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
      return {
        success: false,
        error: error.message || '更新订单状态失败'
      }
    }
  }
}
