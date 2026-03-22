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
  unavailableUntil: null,
  isOpen: false,
  ws: null,
  pollingInterval: null,
  pendingInvites: [],
  sessionStartSignal: null, // { sessionId, inviteCode } when leader fires start

  // Actions
  fetchNotifications: async (userId) => {
    const unavailableUntil = get().unavailableUntil;
    if (unavailableUntil && Date.now() < unavailableUntil) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await notificationAPI.getAll({ userId });
      const notifications = data.notifications || [];
      const unreadCount = data.unreadCount || 0;

      set({
        notifications,
        unreadCount,
        isLoading: false,
        unavailableUntil: null,
      });
    } catch (error) {
      const status = error.response?.status;

      // Silently fail for unimplemented endpoints
      if (status !== 404 && ![500, 502, 503, 504].includes(status)) {
        console.error("Failed to fetch notifications:", error);
        set({
          error: error.message,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          // Back off polling briefly when notifications service is degraded.
          unavailableUntil:
            status === 503 ? Date.now() + 2 * 60 * 1000 : get().unavailableUntil,
        });
      }
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

    // Add to pendingInvites if it's a team_invite
    let pendingInvites = get().pendingInvites;
    if (
      notification.type === "team_invite" &&
      notification.status === "unread"
    ) {
      const alreadyQueued = pendingInvites.some(
        (inv) => inv._id === notification._id,
      );
      if (!alreadyQueued) {
        pendingInvites = [...pendingInvites, notification];
      }
    }

    set({ notifications, unreadCount, pendingInvites });
  },

  toggleNotificationCenter: () => {
    set({ isOpen: !get().isOpen });
  },

  closeNotificationCenter: () => {
    set({ isOpen: false });
  },

  dismissInvite: async (notificationId) => {
    await get().markAsRead(notificationId);
    const pendingInvites = get().pendingInvites.filter(
      (inv) => inv._id !== notificationId,
    );
    set({ pendingInvites });
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
          } else if (data.type === "session_start") {
            // Leader triggered start — push all members to study session
            set({
              sessionStartSignal: {
                sessionId: data.sessionId,
                inviteCode: data.inviteCode,
              },
            });
          }
        } catch (err) {
          console.warn("[Notifications] Failed to parse WS message:", err);
        }
      };

      ws.onclose = () => {
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

  clearSessionStartSignal: () => set({ sessionStartSignal: null }),
}));

export default useNotificationStore;
