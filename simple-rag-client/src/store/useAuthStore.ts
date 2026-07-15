import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: { name: string; email: string } | null;
  setAuth: (isAuthenticated: boolean, user: { name: string; email: string } | null) => void;
  setChecking: (isChecking: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isCheckingAuth: true,
  user: null,
  setAuth: (isAuthenticated, user) => set({ isAuthenticated, user }),
  setChecking: (isCheckingAuth) => set({ isCheckingAuth }),
}));
