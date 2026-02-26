import { create } from "zustand";
import { notificationAPI } from "../services/api";

const WS_BASE =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:3007`;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isOpen: false,
  ws: null,
  pollingInterval: null,

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
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationAPI.markRead(notificationId);

      // Update local state
      const notifications = get().notifications.map((notification) =>
        notification._id === notificationId
          ? { ...notification, status: "read", readAt: new Date() }
          : notification,
      );

      const unreadCount = Math.max(0, get().unreadCount - 1);

      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await notificationAPI.markAllRead(userId);

      // Update local state
      const notifications = get().notifications.map((notification) => ({
        ...notification,
        status: "read",
        readAt: new Date(),
      }));

      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications];
    const unreadCount =
      notification.status === "unread"
        ? get().unreadCount + 1
        : get().unreadCount;

    set({ notifications, unreadCount });
  },

  toggleNotificationCenter: () => {
    set({ isOpen: !get().isOpen });
  },

  closeNotificationCenter: () => {
    set({ isOpen: false });
  },

  // Connect WebSocket with polling fallback
  startPolling: (userId, interval = 30000) => {
    // Initial fetch
    get().fetchNotifications(userId);

    // Try WebSocket first
    try {
      const wsUrl = `${WS_BASE}/ws/notifications?userId=${userId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[Notifications] WebSocket connected");
        // Clear polling if it was started as fallback
        const { pollingInterval } = get();
        if (pollingInterval) {
          clearInterval(pollingInterval);
          set({ pollingInterval: null });
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_notification" && data.notification) {
            get().addNotification(data.notification);
          }
        } catch (err) {
          console.warn("[Notifications] Failed to parse WS message:", err);
        }
      };

      ws.onclose = () => {
        console.log(
          "[Notifications] WebSocket closed, falling back to polling",
        );
        set({ ws: null });
        // Fallback to polling
        if (!get().pollingInterval) {
          const id = setInterval(
            () => get().fetchNotifications(userId),
            interval,
          );
          set({ pollingInterval: id });
        }
      };

      ws.onerror = (err) => {
        console.warn(
          "[Notifications] WebSocket error, will fallback to polling",
        );
      };

      set({ ws });
    } catch (e) {
      console.warn("[Notifications] WebSocket not available, using polling");
    }

    // Start polling as initial fallback (will be cleared if WS connects)
    const intervalId = setInterval(
      () => get().fetchNotifications(userId),
      interval,
    );
    set({ pollingInterval: intervalId });

    return () => {
      const { ws, pollingInterval } = get();
      if (ws) {
        ws.close();
        set({ ws: null });
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
        set({ pollingInterval: null });
      }
    };
  },

  stopPolling: () => {
    const { ws, pollingInterval } = get();
    if (ws) {
      ws.close();
      set({ ws: null });
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },
}));

export default useNotificationStore;
