// src/stores/resumeStore.js
import { create } from 'zustand'
import { resumeService } from '../services/api'

export const useResumeStore = create((set, get) => ({
  currentResume: null,
  resumes: [],
  isLoading: false,
  error: null,

  fetchResumes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await resumeService.getAll()
      set({ resumes: response.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch resumes', isLoading: false })
    }
  },

  fetchResumeById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await resumeService.getById(id)
      set({ currentResume: response.data, isLoading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch resume', isLoading: false })
      return null
    }
  },

  createResume: async (resumeData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await resumeService.create(resumeData)
      set((state) => ({
        resumes: [...state.resumes, response.data],
        currentResume: response.data,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create resume', isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  updateResume: async (id, resumeData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await resumeService.update(id, resumeData)
      set((state) => ({
        resumes: state.resumes.map(r => r._id === id ? response.data : r),
        currentResume: state.currentResume?._id === id ? response.data : state.currentResume,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update resume', isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  deleteResume: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await resumeService.delete(id)
      set((state) => ({
        resumes: state.resumes.filter(r => r._id !== id),
        currentResume: state.currentResume?._id === id ? null : state.currentResume,
        isLoading: false,
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete resume', isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  setCurrentResume: (resume) => {
    set({ currentResume: resume })
  },

  clearError: () => {
    set({ error: null })
  },
}))