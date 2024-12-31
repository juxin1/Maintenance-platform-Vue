import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 登录
  const login = async (loginForm) => {
    try {
      const { data } = await loginApi(loginForm)  // 调用真实的登录接口
      
      // 处理返回的数据
      const userData = {
        id: data.userId,
        username: data.username,
        roleType: data.roleType,
        token: data.token
      }
      
      token.value = userData.token
      userInfo.value = userData
      
      localStorage.setItem('token', userData.token)
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    login,
    logout
  }
})
