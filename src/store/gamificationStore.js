import { create } from "zustand";
import { backgroundAPI } from "../services/api";

const MAX_BACKGROUND_SIZE_LABEL = "5MB";

const normalizeUploadErrorMessage = (err, fallbackMessage) => {
  const backendError = err?.response?.data?.error;
  if (backendError === "File is too large") {
    return `File is too large. Maximum allowed size is ${MAX_BACKGROUND_SIZE_LABEL}.`;
  }
  return backendError || fallbackMessage;
};

// Local persistence helpers (for localhost/dev use)
const LOCAL_BG_KEY = "localBackgroundProfile";

const isLocalhost = () => {
  try {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch (e) {
    return false;
  }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });

const saveLocalProfile = (profile) => {
  try {
    localStorage.setItem(LOCAL_BG_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("Failed to save local background profile:", e);
  }
};

const loadLocalProfile = () => {
  try {
    const raw = localStorage.getItem(LOCAL_BG_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse local background profile:", e);
    return null;
  }
};

const useGamificationStore = create((set, get) => ({
  // Level & XP
  level: 1,
  totalXP: 0,
  nextLevelXP: 100,
  xpProgress: 0,
  unlockedFeatures: [],

  // Background settings
  backgroundSettings: null,
  animatedBackgroundSettings: null,
  backgroundPresets: [],
  animatedPresets: [],

  // UI state
  showLevelUpNotification: false,
  levelUpData: null,
  loading: false,
  error: null,

  // Fetch level info
  fetchLevelInfo: async () => {
    try {
      const data = await backgroundAPI.getLevelInfo();
      set({
        level: data.level,
        totalXP: data.totalXP,
        nextLevelXP: data.nextLevelXP,
        xpProgress: data.xpProgress,
        unlockedFeatures: data.unlockedFeatures || [],
      });
    } catch (err) {
      // Silently fail for unimplemented endpoints
      if (err.response?.status !== 404) {
        console.error("Failed to fetch level info:", err);
      }
    }
  },

  // Fetch background settings (supports localStorage on localhost)
  fetchBackgroundSettings: async () => {
    try {
      // Prefer local profile when developing on localhost
      if (isLocalhost()) {
        const local = loadLocalProfile();
        if (local) {
          set({
            backgroundSettings: local.backgroundSettings ?? null,
            animatedBackgroundSettings:
              local.animatedBackgroundSettings ?? null,
          });
          return local;
        }
      }

      const data = await backgroundAPI.getSettings();
      set({
        backgroundSettings: data.backgroundSettings,
        animatedBackgroundSettings: data.animatedBackgroundSettings,
      });
      return data;
    } catch (err) {
      // Silently fail for unimplemented endpoints
      if (err.response?.status !== 404) {
        console.error("Failed to fetch background settings:", err);
      }
    }
  },

  // Fetch preset galleries
  fetchBackgroundPresets: async () => {
    try {
      const data = await backgroundAPI.getPresets();
      set({ backgroundPresets: data.presets || [] });
    } catch (err) {
      console.error("Failed to fetch background presets:", err);
    }
  },

  fetchAnimatedPresets: async () => {
    try {
      const data = await backgroundAPI.getAnimatedPresets();
      set({ animatedPresets: data.presets || [] });
    } catch (err) {
      console.error("Failed to fetch animated presets:", err);
    }
  },

  // Apply static background (supports local-only save when on localhost or when options.localOnly)
  applyBackground: async (settings, options = {}) => {
    set({ loading: true });
    const localOnly = options.localOnly === true || isLocalhost();
    try {
      if (localOnly) {
        const local = loadLocalProfile() || {};
        local.backgroundSettings = {
          ...local.backgroundSettings,
          ...settings,
          enabled: settings.enabled !== undefined ? settings.enabled : true,
          uploadedAt:
            settings.type === "uploaded"
              ? new Date().toISOString()
              : local.backgroundSettings?.uploadedAt,
        };

        // Enforce exclusivity
        if (local.backgroundSettings.enabled) {
          local.animatedBackgroundSettings = {
            ...(local.animatedBackgroundSettings || {}),
            enabled: false,
            videoUrl: null,
          };
        }

        saveLocalProfile(local);
        set({
          backgroundSettings: local.backgroundSettings,
          animatedBackgroundSettings: local.animatedBackgroundSettings,
          loading: false,
        });
        return {
          backgroundSettings: local.backgroundSettings,
          animatedBackgroundSettings: local.animatedBackgroundSettings,
          message: "Background applied (local)",
        };
      }

      const data = await backgroundAPI.applyBackground(settings);
      set((state) => ({
        backgroundSettings: data.backgroundSettings ?? state.backgroundSettings,
        animatedBackgroundSettings:
          data.animatedBackgroundSettings ?? state.animatedBackgroundSettings,
        loading: false,
      }));
      return data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to apply background",
        loading: false,
      });
      throw err;
    }
  },

  // Upload custom background (supports local-only storage for images)
  uploadBackground: async (file, options = {}) => {
    set({ loading: true, error: null });
    const localOnly = options.localOnly === true || isLocalhost();
    try {
      if (localOnly) {
        // Convert file to data URL and store locally
        const dataUrl = await fileToDataUrl(file);
        const local = loadLocalProfile() || {};
        local.backgroundSettings = {
          ...(local.backgroundSettings || {}),
          enabled: true,
          type: "uploaded",
          imageUrl: dataUrl,
          uploadedAt: new Date().toISOString(),
        };

        // Uploading static background deactivates animated mode.
        local.animatedBackgroundSettings = {
          ...(local.animatedBackgroundSettings || {}),
          enabled: false,
          videoUrl: null,
        };

        saveLocalProfile(local);
        set({
          backgroundSettings: local.backgroundSettings,
          animatedBackgroundSettings: local.animatedBackgroundSettings,
          loading: false,
        });
        return {
          backgroundSettings: local.backgroundSettings,
          animatedBackgroundSettings: local.animatedBackgroundSettings,
          message: "Background uploaded (local)",
        };
      }

      const formData = new FormData();
      formData.append("backgroundImage", file);
      const data = await backgroundAPI.uploadBackground(formData);
      set((state) => ({
        backgroundSettings: data.backgroundSettings ?? state.backgroundSettings,
        animatedBackgroundSettings:
          data.animatedBackgroundSettings ?? state.animatedBackgroundSettings,
        loading: false,
      }));
      return data;
    } catch (err) {
      const errorMessage = normalizeUploadErrorMessage(
        err,
        "Failed to upload background",
      );
      set({
        error: errorMessage,
        loading: false,
      });
      throw err;
    }
  },

  // Upload custom animated background video (local-only storage for small videos — use with caution)
  uploadAnimatedBackground: async (file, options = {}) => {
    set({ loading: true });
    const localOnly = options.localOnly === true || isLocalhost();
    try {
      if (localOnly) {
        // Guard: localStorage has limited space — reject large videos
        if (file.size && file.size > 2 * 1024 * 1024) {
          const msg =
            "Video too large to save locally. Upload to server instead.";
          set({ error: msg, loading: false });
          throw new Error(msg);
        }
        const dataUrl = await fileToDataUrl(file);
        const local = loadLocalProfile() || {};
        local.animatedBackgroundSettings = {
          ...(local.animatedBackgroundSettings || {}),
          enabled: true,
          type: "uploaded",
          videoUrl: dataUrl,
          uploadedAt: new Date().toISOString(),
        };

        // Uploading animated background deactivates static mode.
        local.backgroundSettings = {
          ...(local.backgroundSettings || {}),
          enabled: false,
          imageUrl: null,
        };

        saveLocalProfile(local);
        set({
          animatedBackgroundSettings: local.animatedBackgroundSettings,
          backgroundSettings: local.backgroundSettings,
          loading: false,
        });
        return {
          animatedBackgroundSettings: local.animatedBackgroundSettings,
          backgroundSettings: local.backgroundSettings,
          message: "Animated background uploaded (local)",
        };
      }

      const formData = new FormData();
      formData.append("animatedVideo", file);
      const data = await backgroundAPI.uploadAnimatedBackground(formData);
      set((state) => ({
        animatedBackgroundSettings:
          data.animatedBackgroundSettings ?? state.animatedBackgroundSettings,
        backgroundSettings: data.backgroundSettings ?? state.backgroundSettings,
        loading: false,
      }));
      return data;
    } catch (err) {
      set({
        error:
          err.response?.data?.error || "Failed to upload animated background",
        loading: false,
      });
      throw err;
    }
  },

  // Apply animated background
  applyAnimatedBackground: async (settings) => {
    set({ loading: true });
    try {
      const data = await backgroundAPI.applyAnimatedBackground(settings);
      set((state) => ({
        animatedBackgroundSettings:
          data.animatedBackgroundSettings ?? state.animatedBackgroundSettings,
        backgroundSettings: data.backgroundSettings ?? state.backgroundSettings,
        loading: false,
      }));
      return data;
    } catch (err) {
      set({
        error:
          err.response?.data?.error || "Failed to apply animated background",
        loading: false,
      });
      throw err;
    }
  },

  // Disable backgrounds
  disableBackground: async () => {
    try {
      if (isLocalhost()) {
        const local = loadLocalProfile() || {};
        local.backgroundSettings = {
          ...(local.backgroundSettings || {}),
          enabled: false,
        };
        saveLocalProfile(local);
        set((s) => ({ backgroundSettings: local.backgroundSettings }));
        return;
      }
      await backgroundAPI.applyBackground({ enabled: false });
      set((s) => ({
        backgroundSettings: {
          ...s.backgroundSettings,
          enabled: false,
        },
      }));
    } catch (err) {
      console.error("Failed to disable background:", err);
    }
  },

  disableAnimatedBackground: async () => {
    try {
      if (isLocalhost()) {
        const local = loadLocalProfile() || {};
        local.animatedBackgroundSettings = {
          ...(local.animatedBackgroundSettings || {}),
          enabled: false,
        };
        saveLocalProfile(local);
        set((s) => ({
          animatedBackgroundSettings: local.animatedBackgroundSettings,
        }));
        return;
      }
      await backgroundAPI.applyAnimatedBackground({ enabled: false });
      set((s) => ({
        animatedBackgroundSettings: {
          ...s.animatedBackgroundSettings,
          enabled: false,
        },
      }));
    } catch (err) {
      console.error("Failed to disable animated background:", err);
    }
  },

  // Level up notification
  triggerLevelUp: (data) =>
    set({
      showLevelUpNotification: true,
      levelUpData: data,
    }),

  dismissLevelUp: () =>
    set({
      showLevelUpNotification: false,
      levelUpData: null,
    }),

  // Check if feature is unlocked
  hasFeature: (feature) => get().unlockedFeatures.includes(feature),

  clearError: () => set({ error: null }),
}));

export default useGamificationStore;
