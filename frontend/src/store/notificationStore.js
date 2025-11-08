import { create } from 'zustand';
import api from '../lib/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/notifications');
      set({
        notifications: response.data,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      set({ unreadCount: response.data.count });
    } catch (error) {
      // Silently fail
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      // Silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read/all');
      set({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      });
    } catch (error) {
      // Silently fail
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

export default useNotificationStore;

