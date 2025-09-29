import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { JSEncrypt } from 'jsencrypt'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const publicKey = ref('')
  const userProfile = ref(null) // 存储用户详细信息
  const isLoggedIn = computed(() => !!token.value)

  // 1. 获取公钥 (无变化)
  const fetchPublicKey = async () => {
    try {
      const response = await axios.get('/api/auth/key')
      publicKey.value = response.data.data
      localStorage.setItem('publicKey', publicKey.value)
      return publicKey.value
    } catch (error) {
      console.error('Failed to fetch public key:', error)
      throw error
    }
  }

  // 2. 加密密码 (无变化)
  const encryptPassword = (password) => {
    if (!publicKey.value) {
      throw new Error('Public key not loaded')
    }
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey.value)
    return encrypt.encrypt(password)
  }

  // 获取用户个人资料 (已根据最新 API 文档修正)
  const fetchUserProfile = async () => {
    if (!token.value) return

    try {
      const response = await axios.get('/api/user', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      // 修正：从返回的 records 数组中获取第一个用户对象
      if (response.data && response.data.data && response.data.data.records && response.data.data.records.length > 0) {
        userProfile.value = response.data.data.records[0];
      } else {
        throw new Error("User profile not found in API response");
      }

    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      logout()
    }
  }

  // 3. 登录 (无变化)
  const login = async (usernameInput, password) => {
    try {
      if (!publicKey.value) {
        await fetchPublicKey()
      }
      const encryptedPassword = encryptPassword(password)
      const response = await axios.post('/api/auth/login', {
        username: usernameInput,
        encryptedPassword
      })

      const { token: userToken, username: userUsername } = response.data.data

      token.value = userToken
      username.value = userUsername || usernameInput

      localStorage.setItem('token', userToken)
      localStorage.setItem('username', username.value)

      await fetchUserProfile()

      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Login failed (check network or public key)'
      return { success: false, message }
    }
  }

  // 4. 登出 (无变化)
  const logout = () => {
    token.value = ''
    username.value = ''
    userProfile.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  // 5. 初始化 (无变化)
  const initializeUser = async () => {
    const savedToken = localStorage.getItem('token')
    const savedUsername = localStorage.getItem('username')
    const savedPublicKey = localStorage.getItem('publicKey')
    if (savedToken) {
        token.value = savedToken
        username.value = savedUsername
        await fetchUserProfile()
    }
    if (savedPublicKey) publicKey.value = savedPublicKey
  }

  return {
    token,
    username,
    publicKey,
    userProfile,
    isLoggedIn,
    fetchPublicKey,
    login,
    logout,
    initializeUser
  }
})

