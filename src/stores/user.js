import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../utils/api'
import { JSEncrypt } from 'jsencrypt'
import { getUserLocation, setManualLocation } from '../utils/geoUtils'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const publicKey = ref(localStorage.getItem('publicKey') || '')
  const userProfile = ref(null)
  const userLocation = ref(null)
  const isLoggedIn = computed(() => !!token.value)

  // 1) 获取公钥 - 暂时禁用，避免连接后端
  const fetchPublicKey = async () => {
    console.log('fetchPublicKey called - using mock public key')
    // 使用Mock公钥，避免连接后端
    const mockKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----'
    publicKey.value = mockKey
    localStorage.setItem('publicKey', mockKey)
    return mockKey
  }

  // 2) 公钥加密
  const encryptPassword = (pwd) => {
    if (!publicKey.value) throw new Error('Public key not loaded')
    const enc = new JSEncrypt()
    enc.setPublicKey(publicKey.value)
    return enc.encrypt(pwd)
  }

  // 3) 登录
  const login = async (usernameInput, password) => {
    try {
      // 后端服务没起来，使用Mock登录
      console.log('Mock登录:', { username: usernameInput, password: '***' })
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock登录成功
      const mockToken = 'mock-token-' + Date.now()
      const mockUsername = usernameInput || 'MockUser'
      
      token.value = mockToken
      username.value = mockUsername
      localStorage.setItem('token', mockToken)
      localStorage.setItem('username', mockUsername)
      
      return { success: true, data: { token: mockToken, username: mockUsername } }
    } catch (error) {
      const message = error?.response?.data?.message || 
                     error?.response?.data?.msg || 
                     error?.message || 
                     'Login failed (Mock mode - backend service not started)'
      console.error('Login error:', error)
      return { success: false, message }
    }
  }

  // 4) 登出
  const logout = () => {
    console.log('User logout called')
    token.value = ''
    username.value = ''
    userProfile.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    delete api.defaults.headers.common.Authorization
    console.log('User logout completed:', {
      token: token.value,
      username: username.value,
      isLoggedIn: isLoggedIn.value
    })
  }

  // 5) Mock登录方法
  const mockLogin = () => {
    console.log('Mock login called from store')
    const mockToken = 'mocktoken-' + Date.now()
    const mockUsername = 'MockUser'
    
    token.value = mockToken
    username.value = mockUsername
    localStorage.setItem('token', mockToken)
    localStorage.setItem('username', mockUsername)
    
    // 设置Mock用户资料
    userProfile.value = {
      username: mockUsername,
      nickname: 'Mock用户',
      phone: '13800138000'
    }
    
    console.log('Mock login completed:', {
      token: token.value,
      username: username.value,
      isLoggedIn: isLoggedIn.value,
      userProfile: userProfile.value
    })
  }

  // 6) 更新用户资料
  const updateUserProfile = async (profileData) => {
    try {
      // Mock更新用户资料
      console.log('Mock更新用户资料:', profileData)
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新本地资料
      userProfile.value = { ...userProfile.value, ...profileData }
      
      return { success: true, message: '资料更新成功！' }
    } catch (error) {
      console.error('更新用户资料失败:', error)
      return { success: false, message: '更新失败，请稍后重试' }
    }
  }

  // 7) 获取用户位置
  const fetchUserLocation = async () => {
    try {
      console.log('正在获取用户位置...')
      const location = await getUserLocation()
      userLocation.value = location
      console.log('用户位置获取成功:', location)
      return location
    } catch (error) {
      console.error('获取用户位置失败:', error)
      // 使用默认位置（新加坡）
      const defaultLocation = { latitude: 1.2966, longitude: 103.7764 }
      userLocation.value = defaultLocation
      return defaultLocation
    }
  }

  // 8) 手动设置用户位置
  const setUserLocation = (latitude, longitude) => {
    const location = setManualLocation(latitude, longitude)
    userLocation.value = location
    console.log('手动设置用户位置:', location)
    return location
  }

  // 8) 初始化（刷新恢复）
  const initialize = async () => {
    const savedToken = localStorage.getItem('token')
    const savedUsername = localStorage.getItem('username')
    const savedPublicKey = localStorage.getItem('publicKey')
    if (savedToken) {
      token.value = savedToken
      api.defaults.headers.common.Authorization = `Bearer ${savedToken}`
      
      // 如果有保存的token，设置Mock用户资料
      if (savedUsername) {
        userProfile.value = {
          username: savedUsername,
          nickname: 'Mock用户',
          phone: '13800138000'
        }
      }
    }
    if (savedUsername) username.value = savedUsername
    if (savedPublicKey) publicKey.value = savedPublicKey
    
    // 初始化时获取用户位置
    await fetchUserLocation()
  }

  return {
    token,
    username,
    publicKey,
    userProfile,
    userLocation,
    isLoggedIn,
    fetchPublicKey,
    login,
    logout,
    mockLogin,
    updateUserProfile,
    fetchUserLocation,
    setUserLocation,
    initialize
  }
})
