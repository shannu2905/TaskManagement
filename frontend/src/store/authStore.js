import { create } from 'zustand';

const useAuthStore = create((set, get) => {
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    // Invalid JSON, ignore
  }

  return {
    user,
    isAuthenticated: !!localStorage.getItem('accessToken'),

    setAuth: (user, accessToken, refreshToken) => {
    set({
      user,
      isAuthenticated: !!user,
    });
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    set({ user: updatedUser });
    localStorage.setItem('user', JSON.stringify(updatedUser));
  },
  };
});

export default useAuthStore;

