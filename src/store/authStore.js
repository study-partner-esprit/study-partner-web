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
      isAuthenticated: false,
      sessionExpiry: null,

      // Initialize authentication state from persisted data
      initializeAuth: () => {
        const { user, sessionExpiry } = get();
        if (user && sessionExpiry) {
          const now = new Date().getTime();
          if (sessionExpiry > now) {
            set({ isAuthenticated: true });
          } else {
            // Session expired, clear it
            get().logout();
          }
        }
      },

      // login(userData) — tokens live in httpOnly cookies now
      login: (userData) => {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);

        set({
          user: userData,
          isAuthenticated: true,
          sessionExpiry: expiry.getTime(),
        });
      },

      logout: () => {
        // Best-effort server-side revocation + cookie clearing (fire-and-forget)
        import("../services/api").then(({ authAPI }) => {
          authAPI.logout().catch(() => {});
        });
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiry: null,
        });
      },

      updateUser: (userData) => {
        set({ user: userData });
      },

      // Check if session is still valid
      isSessionValid: () => {
        const { sessionExpiry, isAuthenticated } = get();
        if (!isAuthenticated || !sessionExpiry) return false;
        return sessionExpiry > new Date().getTime() + 5 * 60 * 1000;
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
        return user?.tier || "normal";
      },

      isTrialExpired: () => {
        const { user } = get();
        if (user?.tier !== "trial") return false;
        if (!user?.trialExpiresAt) return false;
        return new Date(user.trialExpiresAt) < new Date();
      },

      getTrialDaysRemaining: () => {
        const { user } = get();
        if (user?.tier !== "trial" || !user?.trialExpiresAt) return 0;
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
      // Only persist user + sessionExpiry (tokens are in httpOnly cookies)
      partialize: (state) => ({
        user: state.user,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
);

export { useAuthStore };
