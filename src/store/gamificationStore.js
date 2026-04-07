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

  // Fetch background settings
  fetchBackgroundSettings: async () => {
    try {
      const data = await backgroundAPI.getSettings();
      set({
        backgroundSettings: data.backgroundSettings,
        animatedBackgroundSettings: data.animatedBackgroundSettings,
      });
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

  // Apply static background
  applyBackground: async (settings) => {
    set({ loading: true });
    try {
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

  // Upload custom background
  uploadBackground: async (file) => {
    set({ loading: true, error: null });
    try {
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

  // Upload custom animated background video
  uploadAnimatedBackground: async (file) => {
    set({ loading: true });
    try {
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
