import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('foundit_user') || 'null'),
  accessToken: localStorage.getItem('foundit_token') || null,
  theme: localStorage.getItem('foundit_theme') || 'light',

  setAuth: (user, accessToken) => {
    localStorage.setItem('foundit_user', JSON.stringify(user));
    if (accessToken) {
      localStorage.setItem('foundit_token', accessToken);
    }
    set({ user, ...(accessToken ? { accessToken } : {}) });
  },

  setToken: (accessToken) => {
    localStorage.setItem('foundit_token', accessToken);
    set({ accessToken });
  },

  clearAuth: () => {
    localStorage.removeItem('foundit_user');
    localStorage.removeItem('foundit_token');
    set({ user: null, accessToken: null });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('foundit_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    });
  }
}));
