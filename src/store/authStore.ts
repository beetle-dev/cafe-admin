import { create } from 'zustand';
import type { UserResDto } from '../types';

interface AuthState {
  token: string | null;
  user: UserResDto | null;
  selectedStoreId: number | null;
  setToken: (token: string) => void;
  setUser: (user: UserResDto) => void;
  setSelectedStoreId: (id: number) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('accessToken'),
  user: null,
  selectedStoreId: Number(localStorage.getItem('selectedStoreId')) || null,
  setToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  setSelectedStoreId: (id) => {
    localStorage.setItem('selectedStoreId', String(id));
    set({ selectedStoreId: id });
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('selectedStoreId');
    set({ token: null, user: null, selectedStoreId: null });
  },
}));
