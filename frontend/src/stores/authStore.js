// src/stores/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/api'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token) => {
        set({ token })
        localStorage.setItem('token', token)
      },

      setRefreshToken: (refreshToken) => {
        set({ refreshToken })
        localStorage.setItem('refreshToken', refreshToken)
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await authService.login({ email, password })
          const { token, refreshToken, user } = response.data
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', refreshToken)
          
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          set({ isLoading: false })
          return { success: true, data: response.data }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          }
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          })
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
        }
      },

      checkAuth: () => {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (token && refreshToken) {
          try {
            const decoded = jwtDecode(token)
            if (decoded.exp * 1000 > Date.now()) {
              set({
                token,
                refreshToken,
                isAuthenticated: true,
              })
            } else {
              get().logout()
            }
          } catch (error) {
            get().logout()
          }
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)