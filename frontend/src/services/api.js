// src/services/api.js
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        })
        const { token } = response.data
        useAuthStore.getState().setToken(token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

// Auth Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
}

// Resume Services
export const resumeService = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
  exportPDF: (id) => api.get(`/resumes/${id}/export-pdf`, { responseType: 'blob' }),
  analyzeATS: (id) => api.post(`/resumes/${id}/analyze-ats`),
}

// Portfolio Services
export const portfolioService = {
  getAll: () => api.get('/portfolios'),
  getById: (id) => api.get(`/portfolios/${id}`),
  getBySlug: (slug) => api.get(`/portfolios/slug/${slug}`),
  create: (data) => api.post('/portfolios', data),
  update: (id, data) => api.put(`/portfolios/${id}`, data),
  delete: (id) => api.delete(`/portfolios/${id}`),
  publish: (id) => api.post(`/portfolios/${id}/publish`),
  unpublish: (id) => api.post(`/portfolios/${id}/unpublish`),
  getAnalytics: (id) => api.get(`/portfolios/${id}/analytics`),
}

// User Services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
}

// AI Services
export const aiService = {
  suggestSummary: (data) => api.post('/ai/suggest-summary', data),
  improveDescription: (data) => api.post('/ai/improve-description', data),
  suggestSkills: (data) => api.post('/ai/suggest-skills', data),
  analyzeATS: (data) => api.post('/ai/analyze-ats', data),
}

export default api