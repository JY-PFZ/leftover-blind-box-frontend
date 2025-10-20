// src/services/productService.js
import { api } from '@/utils/api'

export const productService = {
  // 获取所有商品
  async getAllProducts() {
    try {
      const response = await api.get('/products')
      return {
        success: true,
        data: response.data?.data || response.data || []
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  },

  // 根据分类获取商品
  async getProductsByCategory(category) {
    try {
      const response = await api.get(`/products/category/${category}`)
      return {
        success: true,
        data: response.data?.data || response.data || []
      }
    } catch (error) {
      console.error('Failed to fetch products by category:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  },

  // 获取商品详情
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  },

  // 搜索商品
  async searchProducts(query) {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
      return {
        success: true,
        data: response.data?.data || response.data || []
      }
    } catch (error) {
      console.error('Failed to search products:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  }
}
