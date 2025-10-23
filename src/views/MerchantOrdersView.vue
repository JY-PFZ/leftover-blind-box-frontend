<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Order Management</h1>
    <div class="mb-4 flex gap-2">
      <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="loadOrders" :disabled="loading">{{ loading ? 'Loading...' : 'Reload' }}</button>
    </div>
    <p v-if="errorMessage" class="text-red-600 mb-4">{{ errorMessage }}</p>
    <table class="w-full border rounded overflow-hidden">
      <thead class="bg-gray-50">
        <tr>
          <th class="text-left p-2">ID</th>
          <th class="text-left p-2">OrderNo</th>
          <th class="text-left p-2">Status</th>
          <th class="text-left p-2">Total</th>
          <th class="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id" class="border-t">
          <td class="p-2">{{ o.id }}</td>
          <td class="p-2">{{ o.orderNo }}</td>
          <td class="p-2">{{ o.status }}</td>
          <td class="p-2">${{ Number(o.totalPrice || o.total).toFixed(2) }}</td>
          <td class="p-2 flex gap-2">
            <button class="px-3 py-1 bg-emerald-600 text-white rounded" @click="updateStatus(o, 'completed')">Mark Completed</button>
            <button class="px-3 py-1 bg-red-600 text-white rounded" @click="cancel(o)">Cancel</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'

const orders = ref([])
const loading = ref(false)
const errorMessage = ref('')

function parseApiError(err){
  if (!err) return '未知错误'
  if (err.response){
    const status = err.response.status
    const msg = err.response.data?.message || err.message
    switch(status){
      case 400: return `请求参数错误: ${msg}`
      case 401: return `未登录或登录已过期: ${msg}`
      case 403: return `无权限: ${msg}`
      case 404: return `资源不存在: ${msg}`
      case 409: return `业务冲突: ${msg}`
      case 422: return `数据校验失败: ${msg}`
      case 500: return `服务器异常: ${msg}`
      default: return `请求失败(${status}): ${msg}`
    }
  }
  if (err.request) return '网络异常或后端不可达'
  return err.message || '未知错误'
}

async function loadOrders(){
  loading.value = true
  errorMessage.value = ''
  try{
    const resp = await api.get('/orders', { params: { pageNum: 1, pageSize: 50 } })
    const data = resp.data?.data
    orders.value = data?.records || data?.items || []
  }catch(err){
    const reason = parseApiError(err)
    errorMessage.value = reason
    console.error('[MerchantOrders] 加载失败:', { reason, err })
    alert(`❌ 加载订单失败\n\n原因: ${reason}`)
  }finally{
    loading.value = false
  }
}

async function updateStatus(o, status){
  try{
    await api.put(`/orders/${o.id}/status`, { status })
    o.status = status
  }catch(err){
    const reason = parseApiError(err)
    console.error('[MerchantOrders] 更新状态失败:', { reason, err, id: o.id, status })
    alert(`❌ 更新状态失败\n\n原因: ${reason}`)
  }
}

async function cancel(o){
  if (!confirm(`确定取消订单 #${o.id} 吗？`)) return
  try{
    await api.put(`/orders/${o.id}/cancel`)
    o.status = 'cancelled'
  }catch(err){
    const reason = parseApiError(err)
    console.error('[MerchantOrders] 取消失败:', { reason, err, id: o.id })
    alert(`❌ 取消失败\n\n原因: ${reason}`)
  }
}

onMounted(loadOrders)
</script>




