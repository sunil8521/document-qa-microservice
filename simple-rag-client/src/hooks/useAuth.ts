import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { LoginRequest, SignupRequest } from '../types/auth';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state: any) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data; // Backend sets HttpOnly cookie
    },
    onSuccess: (data) => {
      setAuth(true, { email: data.email, name: data.name });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Logged in successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to login');
    },
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const response = await apiClient.post('/auth/signup', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please login.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create account');
    },
  });
}

export function useCheckAuth() {
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const setChecking = useAuthStore((state: any) => state.setChecking);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/auth/me');
        // Backend returns user details based on the HttpOnly cookie
        setAuth(true, response.data);
        return response.data;
      } catch (error) {
        setAuth(false, null);
        throw error;
      } finally {
        setChecking(false);
      }
    },
    retry: false, // Don't retry if we get 401
    refetchOnWindowFocus: true,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state: any) => state.setAuth);

  return useMutation({
    mutationFn: async () => {
      // Assuming backend clears the HttpOnly cookie
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      setAuth(false, null);
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
}
