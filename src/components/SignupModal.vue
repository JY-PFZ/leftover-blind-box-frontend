<template>
  <!-- 只点遮罩空白处才关闭 -->
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>Sign Up</h2>

      <form @submit.prevent="onSubmit" class="form">
        <input
          v-model.trim="email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          v-model.trim="password"
          type="password"
          placeholder="Password"
          minlength="6"
          required
        />
        <input
          v-model.trim="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          minlength="6"
          required
        />
        <select v-model="role" required>
          <option value="">Select Role</option>
          <option value="USER">普通用户</option>
          <option value="MERCHANT">商户</option>
        </select>

        <button class="primary" :disabled="loading">
          {{ loading ? 'Signing up…' : 'Sign Up' }}
        </button>
        <button class="ghost" type="button" @click="$emit('close')" :disabled="loading">
          Cancel
        </button>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success">{{ successMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/utils/api'
import { JSEncrypt } from 'jsencrypt'

const emit = defineEmits(['close'])

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// 获取公钥 - 使用Mock公钥，避免连接后端
const fetchPublicKey = async () => {
  console.log('fetchPublicKey called - using mock public key')
  // 使用Mock公钥，避免连接后端
  const mockKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----'
  return mockKey
}

// 公钥加密
const encryptPassword = (pwd, publicKey) => {
  const enc = new JSEncrypt()
  enc.setPublicKey(publicKey)
  return enc.encrypt(pwd)
}

const onSubmit = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  // 验证密码匹配
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }
  
  // 暂时不验证角色选择，避免500错误
  // if (!role.value) {
  //   errorMsg.value = 'Please select a role'
  //   return
  // }
  
  loading.value = true
  
  try {
    // 后端服务没起来，使用Mock注册
    console.log('Mock注册:', {
      username: email.value,
      password: '***',
      role: role.value
    })
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    successMsg.value = '✅ 注册成功！现在可以登录了（Mock模式 - 后端服务未启动）'
    
    // 延迟关闭弹窗
    setTimeout(() => {
      emit('close')
    }, 2000)
    
  } catch (error) {
    const message = error?.response?.data?.message || 
                   error?.response?.data?.msg || 
                   error?.message || 
                   'Registration failed'
    errorMsg.value = message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; z-index: 1001; }
.modal { width: 360px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
.form { display: grid; gap: 10px; }
input, select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
.primary { padding: 10px; border: none; border-radius: 8px; background: #007bff; color: #fff; cursor: pointer; }
.ghost { padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; }
.error { color: #e74c3c; font-size: 13px; }
.success { color: #27ae60; font-size: 13px; font-weight: 500; }
</style>

