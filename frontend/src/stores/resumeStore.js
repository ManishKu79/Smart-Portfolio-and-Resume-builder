import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useResumeStore = create(
  persist(
    (set, get) => ({
      resumes: [],
      currentResume: null,
      isLoading: false,
      error: null,
      templates: [],
      
      // Fetch all resumes
      fetchResumes: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/resumes', { params });
          set({ 
            resumes: response.data.data.resumes,
            pagination: response.data.data.pagination,
            isLoading: false 
          });
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch resumes',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Fetch single resume
      fetchResumeById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/resumes/${id}`);
          set({ currentResume: response.data.data, isLoading: false });
          return response.data.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch resume',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Create new resume
      createResume: async (resumeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/resumes', resumeData);
          set((state) => ({
            resumes: [response.data.data, ...state.resumes],
            currentResume: response.data.data,
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to create resume',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Update resume
      updateResume: async (id, resumeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/resumes/${id}`, resumeData);
          set((state) => ({
            resumes: state.resumes.map(r => r._id === id ? response.data.data : r),
            currentResume: state.currentResume?._id === id ? response.data.data : state.currentResume,
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to update resume',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Delete resume
      deleteResume: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/resumes/${id}`);
          set((state) => ({
            resumes: state.resumes.filter(r => r._id !== id),
            currentResume: state.currentResume?._id === id ? null : state.currentResume,
            isLoading: false
          }));
          return { success: true };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete resume',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Duplicate resume
      duplicateResume: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(`/resumes/${id}/duplicate`);
          set((state) => ({
            resumes: [response.data.data, ...state.resumes],
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to duplicate resume',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Toggle public status
      togglePublic: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch(`/resumes/${id}/toggle-public`);
          set((state) => ({
            resumes: state.resumes.map(r => 
              r._id === id ? { ...r, isPublic: response.data.data.isPublic } : r
            ),
            currentResume: state.currentResume?._id === id 
              ? { ...state.currentResume, isPublic: response.data.data.isPublic }
              : state.currentResume,
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to update visibility',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Archive resume
      archiveResume: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch(`/resumes/${id}/archive`);
          set((state) => ({
            resumes: state.resumes.map(r => 
              r._id === id ? { ...r, isArchived: !r.isArchived } : r
            ),
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to archive resume',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Fetch templates
      fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/resumes/templates');
          set({ templates: response.data.data, isLoading: false });
          return response.data.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch templates',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Update section order
      updateSectionOrder: async (id, type, sections) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch(`/resumes/${id}/section-order`, { type, sections });
          set((state) => ({
            currentResume: state.currentResume?._id === id
              ? { ...state.currentResume, [type]: response.data.data }
              : state.currentResume,
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to update section order',
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Set current resume
      setCurrentResume: (resume) => {
        set({ currentResume: resume });
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      },
      
      // Reset store
      reset: () => {
        set({
          resumes: [],
          currentResume: null,
          isLoading: false,
          error: null,
          templates: [],
          pagination: null
        });
      }
    }),
    {
      name: 'resume-storage',
      partialize: (state) => ({}) // Don't persist resume data
    }
  )
);