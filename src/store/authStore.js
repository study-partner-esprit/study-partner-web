import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set({ user: userData });
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isStudent: () => {
        const { user } = get();
        return user?.role === 'student';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export { useAuthStore };