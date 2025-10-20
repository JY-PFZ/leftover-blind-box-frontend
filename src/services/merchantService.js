// src/services/merchantService.js
import { api } from '@/utils/api'

export const merchantService = {
  // 获取所有商家
  async getAllMerchants() {
    try {
      const response = await api.get('/merchants')
      return {
        success: true,
        data: response.data?.data || response.data || []
      }
    } catch (error) {
      console.error('Failed to fetch merchants:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  },

  // 获取商家详情
  async getMerchantById(id) {
    try {
      const response = await api.get(`/merchants/${id}`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      console.error('Failed to fetch merchant:', error)
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  },

  // 获取商家的商品
  async getMerchantProducts(merchantId) {
    try {
      const response = await api.get(`/merchants/${merchantId}/products`)
      return {
        success: true,
        data: response.data?.data || response.data || []
      }
    } catch (error) {
      console.error('Failed to fetch merchant products:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  },

  // 根据距离排序商家
  async getMerchantsByDistance(latitude, longitude) {
    try {
      const response = await api.get(`/merchants/nearby?lat=${latitude}&lng=${longitude}`)
      return {
        success: true,
        data: response.data?.data || response.data || []
      }
    } catch (error) {
      console.error('Failed to fetch nearby merchants:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  }
}
