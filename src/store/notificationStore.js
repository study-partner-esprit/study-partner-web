import { create } from 'zustand';
import { notificationAPI } from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isOpen: false,

  // Actions
  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationAPI.getAll({ userId });
      const notifications = data.notifications || [];
      const unreadCount = data.unreadCount || 0;

      set({
        notifications,
        unreadCount,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationAPI.markRead(notificationId);

      // Update local state
      const notifications = get().notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, status: 'read', readAt: new Date() }
          : notification
      );

      const unreadCount = Math.max(0, get().unreadCount - 1);

      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await notificationAPI.markAllRead(userId);

      // Update local state
      const notifications = get().notifications.map(notification => ({
        ...notification,
        status: 'read',
        readAt: new Date()
      }));

      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications];
    const unreadCount = notification.status === 'unread' ? get().unreadCount + 1 : get().unreadCount;

    set({ notifications, unreadCount });
  },

  toggleNotificationCenter: () => {
    set({ isOpen: !get().isOpen });
  },

  closeNotificationCenter: () => {
    set({ isOpen: false });
  },

  // Start polling for new notifications
  startPolling: (userId, interval = 30000) => {
    const poll = () => {
      get().fetchNotifications(userId);
    };

    // Initial fetch
    poll();

    // Set up polling
    const intervalId = setInterval(poll, interval);

    // Store interval ID for cleanup
    set({ pollingInterval: intervalId });

    return () => {
      clearInterval(intervalId);
    };
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  }
}));

export default useNotificationStore;