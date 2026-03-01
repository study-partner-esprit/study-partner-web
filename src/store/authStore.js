import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../services/api";

// Tier permission definitions
const TIER_PERMISSIONS = {
  trial: {
    aiCourseUpload: true,
    manualCourse: true,
    aiPlanner: true,
    aiScheduler: true,
    aiCoach: true,
    signalProcessing: true,
    aiSearch: true,
    reviews: true,
    focusTracking: true,
  },
  normal: {
    aiCourseUpload: false,
    manualCourse: true,
    aiPlanner: false,
    aiScheduler: false,
    aiCoach: false,
    signalProcessing: false,
    aiSearch: false,
    reviews: false,
    focusTracking: false,
  },
  vip: {
    aiCourseUpload: true,
    manualCourse: true,
    aiPlanner: true,
    aiScheduler: true,
    aiCoach: false,
    signalProcessing: false,
    aiSearch: true,
    reviews: true,
    focusTracking: false,
  },
  vip_plus: {
    aiCourseUpload: true,
    manualCourse: true,
    aiPlanner: true,
    aiScheduler: true,
    aiCoach: true,
    signalProcessing: true,
    aiSearch: true,
    reviews: true,
    focusTracking: true,
  },
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      sessionExpiry: null,
      isRefreshing: false,

      login: (userData, token, refreshToken) => {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1); // Token expires in 1 hour

        set({
          user: userData,
          token,
          refreshToken,
          isAuthenticated: true,
          sessionExpiry: expiry.getTime(),
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpiry: null,
          isRefreshing: false,
        });
      },

      updateUser: (userData) => {
        set({ user: userData });
      },

      // Check if session is still valid
      isSessionValid: () => {
        const { sessionExpiry, token } = get();
        if (!token || !sessionExpiry) return false;

        const now = new Date().getTime();
        const timeUntilExpiry = sessionExpiry - now;

        // Consider session valid if it expires in more than 5 minutes
        return timeUntilExpiry > 5 * 60 * 1000;
      },

      // Check if token needs refresh (expires in less than 15 minutes)
      shouldRefreshToken: () => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return false;

        const now = new Date().getTime();
        const timeUntilExpiry = sessionExpiry - now;

        return timeUntilExpiry < 15 * 60 * 1000; // 15 minutes
      },

      // Refresh the access token
      refreshTokenAsync: async () => {
        const { refreshToken, isRefreshing } = get();

        if (!refreshToken || isRefreshing) {
          return false;
        }

        set({ isRefreshing: true });

        try {
          const response = await authAPI.refresh(refreshToken);
          const { token: newToken, refreshToken: newRefreshToken } =
            response.data;

          const expiry = new Date();
          expiry.setHours(expiry.getHours() + 1);

          set({
            token: newToken,
            refreshToken: newRefreshToken,
            sessionExpiry: expiry.getTime(),
            isRefreshing: false,
          });

          console.log("[Auth] Token refreshed successfully");
          return true;
        } catch (error) {
          console.error("[Auth] Token refresh failed:", error);
          set({ isRefreshing: false });
          // If refresh fails, logout user
          get().logout();
          return false;
        }
      },

      // Get valid token (refresh if needed)
      getValidToken: async () => {
        const { token, isSessionValid, shouldRefreshToken, refreshTokenAsync } =
          get();

        if (!token) return null;

        if (isSessionValid()) {
          return token;
        }

        if (shouldRefreshToken()) {
          const refreshed = await refreshTokenAsync();
          if (refreshed) {
            return get().token;
          }
        }

        return null;
      },

      // Role-based access control methods
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },

      isAdmin: () => {
        return get().hasRole("admin");
      },

      isStudent: () => {
        return get().hasRole("student");
      },

      isTeacher: () => {
        return get().hasRole("teacher");
      },

      // Permission-based access control
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;

        // Define permissions based on roles
        const rolePermissions = {
          admin: [
            "user.create",
            "user.read",
            "user.update",
            "user.delete",
            "study.create",
            "study.read",
            "study.update",
            "study.delete",
            "analytics.read",
            "system.admin",
          ],
          teacher: [
            "study.create",
            "study.read",
            "study.update",
            "user.read",
            "analytics.read",
          ],
          student: ["study.read", "study.create", "study.update", "user.read"],
        };

        const userPermissions = rolePermissions[user.role] || [];
        return userPermissions.includes(permission);
      },

      // Check if user can access a resource
      canAccess: (resource, action = "read") => {
        return get().hasPermission(`${resource}.${action}`);
      },

      // --- Tier-based access control ---
      getTier: () => {
        const { user } = get();
        return user?.tier || 'normal';
      },

      isTrialExpired: () => {
        const { user } = get();
        if (user?.tier !== 'trial') return false;
        if (!user?.trialExpiresAt) return false;
        return new Date(user.trialExpiresAt) < new Date();
      },

      getTrialDaysRemaining: () => {
        const { user } = get();
        if (user?.tier !== 'trial' || !user?.trialExpiresAt) return 0;
        const diff = new Date(user.trialExpiresAt) - new Date();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },

      getTierPermissions: () => {
        const tier = get().getTier();
        return TIER_PERMISSIONS[tier] || TIER_PERMISSIONS.normal;
      },

      hasTierPermission: (permission) => {
        const perms = get().getTierPermissions();
        return !!perms[permission];
      },
    }),
    {
      name: "auth-storage",
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
);

export { useAuthStore };
