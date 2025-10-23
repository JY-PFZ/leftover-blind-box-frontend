<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-extrabold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">Product Management</h1>
      <div class="flex items-center gap-3">
        <span v-if="lastSyncedAt" class="text-sm text-gray-500 hidden sm:inline">Auto • Updated {{ formatTime(lastSyncedAt) }}</span>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:shadow-md disabled:opacity-60" @click="loadProducts" :disabled="loading">
          {{ loading ? 'Loading...' : 'Reload' }}
        </button>
        <button class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:shadow-md" @click="openCreate">New Product</button>
      </div>
    </div>

    <p v-if="errorMessage" class="text-red-600 mb-4">{{ errorMessage }}</p>

    <table class="w-full border rounded-xl overflow-hidden shadow-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="text-left p-3">ID</th>
          <th class="text-left p-3">Title</th>
          <th class="text-left p-3">Price</th>
          <th class="text-left p-3">Quantity</th>
          <th class="text-left p-3">Active</th>
          <th class="text-left p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.id" class="border-t hover:bg-gray-50/60">
          <td class="p-3">{{ p.id ?? '-' }}</td>
          <td class="p-3">{{ p.title || '(Untitled)' }}</td>
          <td class="p-3">{{ formatCurrency(p.price) }}</td>
          <td class="p-3">{{ p.quantity ?? 0 }}</td>
          <td class="p-3">{{ truthy(p.isActive) ? 'Yes' : 'No' }}</td>
          <td class="p-3">
            <div class="flex gap-2">
              <button class="px-3 py-1 bg-amber-600 text-white rounded" @click="openEdit(p)">Edit</button>
              <button class="px-3 py-1 bg-red-600 text-white rounded" @click="remove(p)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-5 w-full max-w-2xl shadow-2xl">
        <h2 class="text-xl font-bold mb-4">{{ form.id ? 'Edit' : 'Create' }} Product</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Title</label>
            <input class="border p-2 rounded w-full" v-model="form.title" placeholder="Title" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Price</label>
            <input class="border p-2 rounded w-full" v-model.number="form.price" placeholder="Price" type="number" step="0.01" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Quantity</label>
            <input class="border p-2 rounded w-full" v-model.number="form.quantity" placeholder="Quantity" type="number" min="1" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Category</label>
            <input class="border p-2 rounded w-full" v-model="form.category" placeholder="Category" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-600 mb-1">Image URL</label>
            <input class="border p-2 rounded w-full" v-model="form.imageUrl" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Pickup Start</label>
            <input class="border p-2 rounded w-full" v-model="form.pickupStartTime" type="time" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Pickup End</label>
            <input class="border p-2 rounded w-full" v-model="form.pickupEndTime" type="time" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Available Date</label>
            <input class="border p-2 rounded w-full" v-model="form.availableDate" type="date" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="px-4 py-2 rounded" @click="closeModal">Cancel</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60" :disabled="submitting" @click="submit">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/utils/api'
import { useUserStore } from '@/stores/user'

const products = ref([])
const loading = ref(false)
const errorMessage = ref('')
const showModal = ref(false)
const submitting = ref(false)
const lastSyncedAt = ref(null)
let pollTimer = null
const form = ref({
  id: null,
  title: '',
  description: '',
  price: 0,
  quantity: 1,
  pickupStartTime: '09:00',
  pickupEndTime: '18:00',
  availableDate: null,
  category: '',
  imageUrl: ''
})

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

const userStore = useUserStore()

function truthy(v){
  return v === true || v === 1 || v === '1'
}

function formatCurrency(v){
  const num = Number(v)
  if (!Number.isFinite(num)) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

async function loadProducts(){
  loading.value = true
  errorMessage.value = ''
  try{
    let list = []
    const merchantId = userStore.userProfile?.id
    if (merchantId){
      const byMerchant = await api.get(`/magic-bags/merchant/${merchantId}`)
      list = byMerchant.data?.data || []
    } else {
      const resp = await api.get('/magic-bags', { params: { page: 1, size: 999 } })
      list = resp.data?.data?.items || resp.data?.data || []
    }
    products.value = Array.isArray(list) ? list : []
  }catch(err){
    const reason = parseApiError(err)
    errorMessage.value = reason
    console.error('[MerchantProducts] 加载失败:', { reason, err })
    alert(`❌ 加载商品失败\n\n原因: ${reason}`)
  }finally{
    loading.value = false
    lastSyncedAt.value = new Date()
  }
}

function openCreate(){
  form.value = { id: null, title: '', description: '', price: 0, quantity: 1, pickupStartTime: '09:00', pickupEndTime: '18:00', availableDate: new Date().toISOString().slice(0,10), category: '', imageUrl: '' }
  showModal.value = true
}

function openEdit(p){
  form.value = { id: p.id, title: p.title, description: p.description, price: Number(p.price||0), quantity: p.quantity, pickupStartTime: (p.pickupStartTime || '09:00:00').slice(0,5), pickupEndTime: (p.pickupEndTime || '18:00:00').slice(0,5), availableDate: p.availableDate || new Date().toISOString().slice(0,10), category: p.category || '', imageUrl: p.imageUrl || '' }
  showModal.value = true
}

function closeModal(){ showModal.value = false }

async function submit(){
  try{
    submitting.value = true
    const payload = { ...form.value }
    if (!payload.title?.trim()) throw new Error('标题必填')
    if (Number(payload.price) <= 0) throw new Error('价格必须大于0')
    if (Number(payload.quantity) < 1) throw new Error('数量必须>=1')
    if (payload.pickupStartTime && payload.pickupStartTime.length === 5) payload.pickupStartTime = payload.pickupStartTime + ':00'
    if (payload.pickupEndTime && payload.pickupEndTime.length === 5) payload.pickupEndTime = payload.pickupEndTime + ':00'
    const merchantId = userStore.userProfile?.id
    if (merchantId) payload.merchantId = merchantId

    if (payload.id){
      const resp = await api.put(`/magic-bags/${payload.id}`, payload)
      const updated = resp.data?.data
      if (updated){
        const idx = products.value.findIndex(p => p.id === payload.id)
        if (idx >= 0) products.value[idx] = updated
      }
    }else{
      const resp = await api.post('/magic-bags', payload)
      const created = resp.data?.data
      if (created) products.value.unshift(created)
    }
    showModal.value = false
  }catch(err){
    const reason = parseApiError(err)
    console.error('[MerchantProducts] 保存失败:', { reason, err, form: form.value })
    alert(`❌ 保存失败\n\n原因: ${reason}`)
  }
  finally{
    submitting.value = false
  }
}

async function remove(p){
  if (!confirm(`确定删除商品 #${p.id} 吗？`)) return
  try{
    await api.delete(`/magic-bags/${p.id}`)
    products.value = products.value.filter(x => x.id !== p.id)
  }catch(err){
    const reason = parseApiError(err)
    console.error('[MerchantProducts] 删除失败:', { reason, err, id: p.id })
    alert(`❌ 删除失败\n\n原因: ${reason}`)
  }
}

onMounted(loadProducts)
onMounted(() => {
  // 15 秒轮询
  pollTimer = setInterval(() => { if (!document.hidden && navigator.onLine) loadProducts() }, 15000)
  // 页面回到可见时刷新
  const onVis = () => { if (!document.hidden) loadProducts() }
  document.addEventListener('visibilitychange', onVis)
  // 网络恢复时刷新
  const onOnline = () => loadProducts()
  window.addEventListener('online', onOnline)
  // 卸载时清理
  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('online', onOnline)
  })
})

function formatTime(d){
  try{
    return new Intl.DateTimeFormat('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' }).format(new Date(d))
  }catch{ return '' }
}
</script>

