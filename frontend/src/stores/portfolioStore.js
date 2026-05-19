import { create } from 'zustand';
import api from '../services/api';

export const usePortfolioStore = create((set, get) => ({
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
  themes: [],
  
  // Fetch all portfolios
  fetchPortfolios: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/portfolios', { params });
      set({ 
        portfolios: response.data.data.portfolios,
        pagination: response.data.data.pagination,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch portfolios',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch single portfolio
  fetchPortfolioById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/portfolios/${id}`);
      set({ currentPortfolio: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch portfolio',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch public portfolio
  fetchPublicPortfolio: async (slug) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/portfolios/public/${slug}`);
      set({ currentPortfolio: response.data.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch portfolio',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Create new portfolio
  createPortfolio: async (portfolioData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/portfolios', portfolioData);
      set((state) => ({
        portfolios: [response.data.data, ...state.portfolios],
        currentPortfolio: response.data.data,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create portfolio',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Update portfolio
  updatePortfolio: async (id, portfolioData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/portfolios/${id}`, portfolioData);
      set((state) => ({
        portfolios: state.portfolios.map(p => p._id === id ? response.data.data : p),
        currentPortfolio: state.currentPortfolio?._id === id ? response.data.data : state.currentPortfolio,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update portfolio',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Delete portfolio
  deletePortfolio: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/portfolios/${id}`);
      set((state) => ({
        portfolios: state.portfolios.filter(p => p._id !== id),
        currentPortfolio: state.currentPortfolio?._id === id ? null : state.currentPortfolio,
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete portfolio',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Publish portfolio
  publishPortfolio: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/portfolios/${id}/publish`);
      set((state) => ({
        portfolios: state.portfolios.map(p => 
          p._id === id ? { ...p, isPublished: true, publishedAt: new Date() } : p
        ),
        currentPortfolio: state.currentPortfolio?._id === id 
          ? { ...state.currentPortfolio, isPublished: true, publishedAt: new Date() }
          : state.currentPortfolio,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to publish portfolio',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Unpublish portfolio
  unpublishPortfolio: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/portfolios/${id}/unpublish`);
      set((state) => ({
        portfolios: state.portfolios.map(p => 
          p._id === id ? { ...p, isPublished: false } : p
        ),
        currentPortfolio: state.currentPortfolio?._id === id 
          ? { ...state.currentPortfolio, isPublished: false }
          : state.currentPortfolio,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to unpublish portfolio',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Update section order
  updateSectionOrder: async (id, sections) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/portfolios/${id}/sections/order`, { sections });
      set((state) => ({
        currentPortfolio: state.currentPortfolio?._id === id
          ? { ...state.currentPortfolio, sections: response.data.data }
          : state.currentPortfolio,
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
  
  // Update section
  updateSection: async (id, sectionId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/portfolios/${id}/sections/${sectionId}`, data);
      set((state) => ({
        currentPortfolio: state.currentPortfolio?._id === id
          ? {
              ...state.currentPortfolio,
              sections: state.currentPortfolio.sections.map(s =>
                s._id === sectionId ? response.data.data : s
              )
            }
          : state.currentPortfolio,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update section',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Add section
  addSection: async (id, sectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/portfolios/${id}/sections`, sectionData);
      set((state) => ({
        currentPortfolio: state.currentPortfolio?._id === id
          ? {
              ...state.currentPortfolio,
              sections: [...state.currentPortfolio.sections, response.data.data]
            }
          : state.currentPortfolio,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to add section',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Delete section
  deleteSection: async (id, sectionId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/portfolios/${id}/sections/${sectionId}`);
      set((state) => ({
        currentPortfolio: state.currentPortfolio?._id === id
          ? {
              ...state.currentPortfolio,
              sections: state.currentPortfolio.sections.filter(s => s._id !== sectionId)
            }
          : state.currentPortfolio,
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete section',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch themes
  fetchThemes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/portfolios/themes');
      set({ themes: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch themes',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Get analytics
  getAnalytics: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/portfolios/analytics/${id}`);
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch analytics',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Set current portfolio
  setCurrentPortfolio: (portfolio) => {
    set({ currentPortfolio: portfolio });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
  
  // Reset store
  reset: () => {
    set({
      portfolios: [],
      currentPortfolio: null,
      isLoading: false,
      error: null,
      themes: [],
      pagination: null
    });
  }
}));