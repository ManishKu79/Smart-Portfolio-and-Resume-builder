// src/stores/portfolioStore.js
import { create } from 'zustand'
import { portfolioService } from '../services/api'

export const usePortfolioStore = create((set, get) => ({
  currentPortfolio: null,
  portfolios: [],
  isLoading: false,
  error: null,

  fetchPortfolios: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await portfolioService.getAll()
      set({ portfolios: response.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch portfolios', isLoading: false })
    }
  },

  fetchPortfolioById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await portfolioService.getById(id)
      set({ currentPortfolio: response.data, isLoading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch portfolio', isLoading: false })
      return null
    }
  },

  createPortfolio: async (portfolioData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await portfolioService.create(portfolioData)
      set((state) => ({
        portfolios: [...state.portfolios, response.data],
        currentPortfolio: response.data,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create portfolio', isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  updatePortfolio: async (id, portfolioData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await portfolioService.update(id, portfolioData)
      set((state) => ({
        portfolios: state.portfolios.map(p => p._id === id ? response.data : p),
        currentPortfolio: state.currentPortfolio?._id === id ? response.data : state.currentPortfolio,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update portfolio', isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  deletePortfolio: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await portfolioService.delete(id)
      set((state) => ({
        portfolios: state.portfolios.filter(p => p._id !== id),
        currentPortfolio: state.currentPortfolio?._id === id ? null : state.currentPortfolio,
        isLoading: false,
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete portfolio', isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  setCurrentPortfolio: (portfolio) => {
    set({ currentPortfolio: portfolio })
  },

  updateSections: (sections) => {
    set((state) => ({
      currentPortfolio: state.currentPortfolio 
        ? { ...state.currentPortfolio, sections }
        : null
    }))
  },

  clearError: () => {
    set({ error: null })
  },
}))