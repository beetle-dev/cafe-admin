import { create } from 'zustand';
import type { UserResDto } from '../types';

interface AuthState {
  token: string | null;
  user: UserResDto | null;
  setToken: (token: string) => void;
  setUser: (user: UserResDto) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('accessToken'),
  user: null,
  setToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  clear: () => {
    localStorage.removeItem('accessToken');
    set({ token: null, user: null });
  },
}));
