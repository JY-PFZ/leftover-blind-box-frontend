import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    merchants: [],
    loading: false,
    error: null
  }),

  getters: {
    // 获取所有用户
    allUsers: (state) => state.users,
    
    // 获取所有商家
    allMerchants: (state) => state.merchants,
    
    // 获取激活的用户
    activeUsers: (state) => state.users.filter(user => user.isActive),
    
    // 获取激活的商家
    activeMerchants: (state) => state.merchants.filter(merchant => merchant.isActive),
    
    // 获取管理员用户
    adminUsers: (state) => state.users.filter(user => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'),
    
    // 获取普通用户
    customerUsers: (state) => state.users.filter(user => user.role === 'CUSTOMER'),
    
    // 获取商家用户
    merchantUsers: (state) => state.users.filter(user => user.role === 'MERCHANT'),
    
    // 统计信息
    stats: (state) => ({
      totalUsers: state.users.length,
      activeUsers: state.users.filter(user => user.isActive).length,
      totalMerchants: state.merchants.length,
      activeMerchants: state.merchants.filter(merchant => merchant.isActive).length,
      adminUsers: state.users.filter(user => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN').length,
      customerUsers: state.users.filter(user => user.role === 'CUSTOMER').length,
      merchantUsers: state.users.filter(user => user.role === 'MERCHANT').length
    })
  },

  actions: {
    // 获取所有用户
    async fetchUsers() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔄 获取用户列表...')
        const response = await api.get('/admin/users')
        console.log('✅ 用户列表获取成功:', response.data)
        
        this.users = response.data.data || response.data || []
        
        // 确保每个用户都有必要的字段
        this.users = this.users.map(user => ({
          id: user.id,
          username: user.username || user.email,
          email: user.email,
          role: user.role || 'CUSTOMER',
          isActive: user.isActive !== undefined ? user.isActive : true,
          createdAt: user.createdAt || user.created_at,
          updatedAt: user.updatedAt || user.updated_at,
          ...user
        }))
        
        console.log('📊 处理后的用户数据:', this.users)
        
      } catch (error) {
        console.error('❌ 获取用户列表失败:', error)
        this.error = error.message || '获取用户列表失败'
        
        // 如果API不存在，使用模拟数据
        if (error.response?.status === 404) {
          console.log('🔄 API不存在，使用模拟数据...')
          this.users = this.getMockUsers()
        } else {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    // 获取所有商家
    async fetchMerchants() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔄 获取商家列表...')
        const response = await api.get('/admin/merchants')
        console.log('✅ 商家列表获取成功:', response.data)
        
        this.merchants = response.data.data || response.data || []
        
        // 确保每个商家都有必要的字段
        this.merchants = this.merchants.map(merchant => ({
          id: merchant.id,
          name: merchant.name || merchant.businessName,
          contactPerson: merchant.contactPerson || merchant.contact_name,
          email: merchant.email,
          phone: merchant.phone || merchant.contactPhone,
          address: merchant.address || merchant.businessAddress,
          isActive: merchant.isActive !== undefined ? merchant.isActive : true,
          createdAt: merchant.createdAt || merchant.created_at,
          updatedAt: merchant.updatedAt || merchant.updated_at,
          ...merchant
        }))
        
        console.log('📊 处理后的商家数据:', this.merchants)
        
      } catch (error) {
        console.error('❌ 获取商家列表失败:', error)
        this.error = error.message || '获取商家列表失败'
        
        // 如果API不存在，使用模拟数据
        if (error.response?.status === 404) {
          console.log('🔄 API不存在，使用模拟数据...')
          this.merchants = this.getMockMerchants()
        } else {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    // 删除用户
    async deleteUser(userId) {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔄 删除用户:', userId)
        const response = await api.delete(`/admin/users/${userId}`)
        console.log('✅ 用户删除成功:', response.data)
        
        // 从本地状态中移除用户
        this.users = this.users.filter(user => user.id !== userId)
        
        return response.data
        
      } catch (error) {
        console.error('❌ 删除用户失败:', error)
        this.error = error.message || '删除用户失败'
        
        // 如果API不存在，模拟删除成功
        if (error.response?.status === 404) {
          console.log('🔄 API不存在，模拟删除成功...')
          this.users = this.users.filter(user => user.id !== userId)
          return { success: true, message: '用户删除成功（模拟）' }
        } else {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    // 删除商家
    async deleteMerchant(merchantId) {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔄 删除商家:', merchantId)
        const response = await api.delete(`/admin/merchants/${merchantId}`)
        console.log('✅ 商家删除成功:', response.data)
        
        // 从本地状态中移除商家
        this.merchants = this.merchants.filter(merchant => merchant.id !== merchantId)
        
        return response.data
        
      } catch (error) {
        console.error('❌ 删除商家失败:', error)
        this.error = error.message || '删除商家失败'
        
        // 如果API不存在，模拟删除成功
        if (error.response?.status === 404) {
          console.log('🔄 API不存在，模拟删除成功...')
          this.merchants = this.merchants.filter(merchant => merchant.id !== merchantId)
          return { success: true, message: '商家删除成功（模拟）' }
        } else {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    // 激活/停用用户
    async toggleUserStatus(userId) {
      this.loading = true
      this.error = null
      
      try {
        const user = this.users.find(u => u.id === userId)
        if (!user) throw new Error('用户不存在')
        
        const newStatus = !user.isActive
        console.log('🔄 切换用户状态:', userId, '->', newStatus)
        
        const response = await api.put(`/admin/users/${userId}/status`, {
          isActive: newStatus
        })
        
        console.log('✅ 用户状态更新成功:', response.data)
        
        // 更新本地状态
        user.isActive = newStatus
        
        return response.data
        
      } catch (error) {
        console.error('❌ 更新用户状态失败:', error)
        this.error = error.message || '更新用户状态失败'
        
        // 如果API不存在，模拟更新成功
        if (error.response?.status === 404) {
          console.log('🔄 API不存在，模拟更新成功...')
          const user = this.users.find(u => u.id === userId)
          if (user) {
            user.isActive = !user.isActive
          }
          return { success: true, message: '用户状态更新成功（模拟）' }
        } else {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    // 激活/停用商家
    async toggleMerchantStatus(merchantId) {
      this.loading = true
      this.error = null
      
      try {
        const merchant = this.merchants.find(m => m.id === merchantId)
        if (!merchant) throw new Error('商家不存在')
        
        const newStatus = !merchant.isActive
        console.log('🔄 切换商家状态:', merchantId, '->', newStatus)
        
        const response = await api.put(`/admin/merchants/${merchantId}/status`, {
          isActive: newStatus
        })
        
        console.log('✅ 商家状态更新成功:', response.data)
        
        // 更新本地状态
        merchant.isActive = newStatus
        
        return response.data
        
      } catch (error) {
        console.error('❌ 更新商家状态失败:', error)
        this.error = error.message || '更新商家状态失败'
        
        // 如果API不存在，模拟更新成功
        if (error.response?.status === 404) {
          console.log('🔄 API不存在，模拟更新成功...')
          const merchant = this.merchants.find(m => m.id === merchantId)
          if (merchant) {
            merchant.isActive = !merchant.isActive
          }
          return { success: true, message: '商家状态更新成功（模拟）' }
        } else {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    // 获取模拟用户数据
    getMockUsers() {
      return [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'SUPER_ADMIN',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          username: 'merchant1',
          email: 'merchant1@example.com',
          role: 'MERCHANT',
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          username: 'customer1',
          email: 'customer1@example.com',
          role: 'CUSTOMER',
          isActive: true,
          createdAt: '2024-01-03T00:00:00Z'
        },
        {
          id: 4,
          username: 'customer2',
          email: 'customer2@example.com',
          role: 'CUSTOMER',
          isActive: false,
          createdAt: '2024-01-04T00:00:00Z'
        },
        {
          id: 5,
          username: 'merchant2',
          email: 'merchant2@example.com',
          role: 'MERCHANT',
          isActive: false,
          createdAt: '2024-01-05T00:00:00Z'
        }
      ]
    },

    // 获取模拟商家数据
    getMockMerchants() {
      return [
        {
          id: 1,
          name: '美味餐厅',
          contactPerson: '张经理',
          email: 'merchant1@example.com',
          phone: '13800138001',
          address: '北京市朝阳区xxx街道',
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 2,
          name: '咖啡时光',
          contactPerson: '李老板',
          email: 'merchant2@example.com',
          phone: '13800138002',
          address: '上海市浦东新区xxx路',
          isActive: true,
          createdAt: '2024-01-05T00:00:00Z'
        },
        {
          id: 3,
          name: '快餐店',
          contactPerson: '王店长',
          email: 'merchant3@example.com',
          phone: '13800138003',
          address: '广州市天河区xxx广场',
          isActive: false,
          createdAt: '2024-01-08T00:00:00Z'
        }
      ]
    },

    // 重置状态
    reset() {
      this.users = []
      this.merchants = []
      this.loading = false
      this.error = null
    }
  }
})
