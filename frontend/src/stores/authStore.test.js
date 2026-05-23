import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { authService } from '../services/api';

vi.mock('../services/api');

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  });

  it('should login successfully', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-jwt-token';
    
    authService.login.mockResolvedValue({
      data: { user: mockUser, token: mockToken }
    });
    
    const result = await useAuthStore.getState().login('test@example.com', 'password');
    
    expect(result.success).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe(mockToken);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('should handle login failure', async () => {
    authService.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } }
    });
    
    const result = await useAuthStore.getState().login('wrong@example.com', 'wrong');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should logout', () => {
    useAuthStore.setState({
      user: { id: 1 },
      token: 'token',
      isAuthenticated: true
    });
    
    useAuthStore.getState().logout();
    
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});