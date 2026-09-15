import { create } from 'zustand'
import { authApi } from '@/api/endpoints'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('nasi_token'),
  loading: false,

  login: async (email, password) => {
    const res = await authApi.login({ email, password })
    localStorage.setItem('nasi_token', res.data.token)
    set({ user: res.data.user, token: res.data.token })
    return res.data
  },

  register: async (data) => {
    const res = await authApi.register(data)
    localStorage.setItem('nasi_token', res.data.token)
    set({ user: res.data.user, token: res.data.token })
    return res.data
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('nasi_token')
    set({ user: null, token: null })
  },

  fetchUser: async () => {
    const token = localStorage.getItem('nasi_token')
    if (!token) return
    set({ loading: true })
    try {
      const res = await authApi.user()
      set({ user: res.data, loading: false })
    } catch {
      localStorage.removeItem('nasi_token')
      set({ user: null, token: null, loading: false })
    }
  },
}))

export default useAuthStore
