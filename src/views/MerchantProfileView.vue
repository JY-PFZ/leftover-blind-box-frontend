<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Store Profile</h1>

    <p v-if="message" :class="{'text-green-700': ok, 'text-red-700': !ok}" class="mb-4">{{ message }}</p>

    <div class="grid gap-3">
      <input class="border p-2 rounded" v-model="form.name" placeholder="Store Name" />
      <input class="border p-2 rounded" v-model="form.address" placeholder="Address" />
      <input class="border p-2 rounded" v-model="form.phone" placeholder="Phone" />
      <input class="border p-2 rounded" v-model="form.openingHours" placeholder="Opening Hours" />
      <textarea class="border p-2 rounded" v-model="form.bio" placeholder="Description"></textarea>
      <div class="flex gap-2">
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="save">Save</button>
        <button class="px-4 py-2" @click="load">Reload</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'

const form = ref({ name: '', address: '', phone: '', openingHours: '', bio: '' })
const message = ref('')
const ok = ref(false)

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
      case 500: return `服务器异常: ${msg}`
      default: return `请求失败(${status}): ${msg}`
    }
  }
  if (err.request) return '网络异常或后端不可达'
  return err.message || '未知错误'
}

async function load(){
  try{
    const resp = await api.get('/user')
    const u = resp.data?.data || {}
    form.value = {
      name: u.merchantName || '',
      address: u.address || '',
      phone: u.phone || '',
      openingHours: u.openingHours || '',
      bio: u.bio || ''
    }
    ok.value = true
    message.value = 'Loaded.'
  }catch(err){
    ok.value = false
    message.value = parseApiError(err)
    console.error('[MerchantProfile] 加载失败:', err)
  }
}

async function save(){
  try{
    await api.put('/user/profile', form.value)
    ok.value = true
    message.value = 'Saved.'
  }catch(err){
    ok.value = false
    message.value = parseApiError(err)
    console.error('[MerchantProfile] 保存失败:', err)
  }
}

onMounted(load)
</script>




