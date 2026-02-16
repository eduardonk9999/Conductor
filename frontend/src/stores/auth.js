import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  function setUser(userData) {
    user.value = userData
  }

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      setToken(response.data.access_token)
      setUser(response.data.user)
      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      setToken(response.data.access_token)
      setUser(response.data.user)
      return true
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  async function checkAuth() {
    if (token.value) {
      try {
        const response = await api.get('/auth/me')
        setUser(response.data)
      } catch (error) {
        logout()
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  }
})
