import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('medistock_token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const userName = computed(() => user.value?.name || '')
  const userRole = computed(() => user.value?.role || '')

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await authService.login({ email, password })
      token.value = response.accessToken
      user.value = response.user
      localStorage.setItem('medistock_token', response.accessToken)
      toast.success('Login berhasil!')
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      user.value = await authService.getProfile()
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('medistock_token')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    userName,
    userRole,
    login,
    fetchProfile,
    logout,
  }
})
