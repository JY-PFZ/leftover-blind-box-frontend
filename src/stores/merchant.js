import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '@/services/productService'
import { useUserStore } from './user'

// 说明：
// 1) 使用前端 mock 数据保证功能完整可用；
// 2) 若后端提供商家商品 API，可将 useApiData 设为 true 并接入；
// 3) 提供价格修改与"售罄"开关；

const initialMockProducts = [
  {
    id: 'p-1001',
    title: '法棍 Baguette',
    price: 3.5,
    category: 'bread',
    cover: 'https://images.unsplash.com/photo-1541782814455-c9d2a32a3a29',
    soldOut: false,
  },
  {
    id: 'p-1002',
    title: '牛角包 Croissant',
    price: 4.2,
    category: 'bread',
    cover: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
    soldOut: false,
  },
  {
    id: 'p-1003',
    title: '拿铁 Latte',
    price: 5.0,
    category: 'drink',
    cover: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0',
    soldOut: false,
  },
]

export const useMerchantStore = defineStore('merchant', () => {
  const useApiData = ref(true)
  const isLoading = ref(false)
  const products = ref([]) // 移除Mock数据，只使用API数据

  const totalProducts = computed(() => products.value.length)
  const soldOutCount = computed(() => products.value.filter(p => p.soldOut).length)

  function findIndexById(productId) {
    return products.value.findIndex(p => p.id === productId)
  }

  async function loadProducts(merchantId) {
    try {
      isLoading.value = true
      
      // 只使用API数据，不使用Mock
      console.log('🔄 从API获取商家商品数据...', { merchantId })
      
      // 检查merchantId是否有效
      if (!merchantId) {
        throw new Error('商家ID未提供')
      }
      
      // 尝试从API获取商品数据
      const resp = await productService.getMerchantProducts(merchantId)
      if (resp.success) {
        const list = Array.isArray(resp.data) ? resp.data : []
        // 后端字段兼容处理
        products.value = list.map(item => ({
          id: item.id ?? item.productId ?? String(Math.random()).slice(2),
          title: item.title ?? item.name ?? '未命名商品',
          price: Number(item.price ?? 0),
          category: item.category ?? 'unknown',
          cover: item.cover ?? item.imageUrl ?? '',
          soldOut: Boolean(item.soldOut ?? item.stock === 0),
        }))
        console.log('✅ API商品数据加载成功:', products.value.length, '个商品')
        return true
      } else {
        throw new Error(resp.error || '获取商品数据失败')
      }
    } catch (error) {
      console.error('❌ API调用失败:', error.message)
      // API失败时不使用Mock数据，直接抛出错误
      products.value = []
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(newProduct) {
    try {
      console.log('🔄 准备发送的商品数据:', newProduct)
      
      // 调用真实API添加商品
      const result = await productService.addProduct(newProduct)
      
      if (result.success) {
        console.log('✅ 添加商品成功:', result)
        
        // 安全获取商家ID（从表单、store、用户信息中择一）
        const userStore = useUserStore()
        const merchantId = 
          newProduct.merchantId ?? 
          userStore.userProfile?.id ??
          userStore.profile?.id
        
        console.log('🔍 调试信息 - 获取到的merchantId:', merchantId)
        
        if (merchantId) {
          console.log('🔄 重新加载商品列表，merchantId:', merchantId)
          await loadProducts(merchantId)
        } else {
          console.warn('⚠️ 无法获取merchantId，跳过重新加载商品列表')
        }
        
        return result.data?.id || 'success'
      } else {
        console.error('添加商品失败:', result.error)
        throw new Error(result.error || '添加商品失败')
      }
      
    } catch (error) {
      console.error('❌ 添加商品失败:', error)
      throw error
    }
  }

  function updateProduct(productId, patch) {
    const idx = findIndexById(productId)
    if (idx === -1) return false
    products.value[idx] = { ...products.value[idx], ...patch }
    return true
  }

  async function updatePrice(productId, price) {
    const normalized = Number(price)
    if (Number.isNaN(normalized) || normalized < 0) return false
    
    try {
      // 调用真实API更新价格
      const result = await productService.updateProduct(productId, { price: normalized })
      
      if (result.success) {
        // API成功，更新本地数据
        return updateProduct(productId, { price: normalized })
      } else {
        console.error('更新价格失败:', result.error)
        throw new Error(result.error || '更新价格失败')
      }
    } catch (error) {
      console.error('❌ 更新价格失败:', error)
      throw error
    }
  }

  async function toggleSoldOut(productId, soldOut) {
    const idx = findIndexById(productId)
    if (idx === -1) return false
    const next = soldOut === undefined ? !products.value[idx].soldOut : Boolean(soldOut)
    
    try {
      // 调用真实API更新售罄状态
      const result = await productService.updateProduct(productId, { soldOut: next })
      
      if (result.success) {
        // API成功，更新本地数据
        products.value[idx].soldOut = next
        console.log('✅ 售罄状态更新成功:', { productId, soldOut: next })
        return true
      } else {
        console.error('更新售罄状态失败:', result.error)
        throw new Error(result.error || '更新售罄状态失败')
      }
    } catch (error) {
      console.error('❌ 更新售罄状态失败:', error)
      throw error
    }
  }

  async function removeProduct(productId) {
    try {
      // 调用真实API删除商品
      const result = await productService.deleteProduct(productId)
      
      if (result.success) {
        // API成功，从本地列表移除
        const idx = findIndexById(productId)
        if (idx !== -1) {
          products.value.splice(idx, 1)
          console.log('✅ 删除商品成功:', productId)
          return true
        }
        return false
      } else {
        console.error('删除商品失败:', result.error)
        throw new Error(result.error || '删除商品失败')
      }
    } catch (error) {
      console.error('❌ 删除商品失败:', error)
      throw error
    }
  }

  function clearAll() {
    products.value = []
  }

  return {
    // state
    useApiData,
    isLoading,
    products,
    // getters
    totalProducts,
    soldOutCount,
    // actions
    loadProducts,
    addProduct,
    updateProduct,
    updatePrice,
    toggleSoldOut,
    removeProduct,
    clearAll,
  }
})




