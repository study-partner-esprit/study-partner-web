/**
 * Auth Store Tests (Zustand)
 * Tests login, logout, token management, and RBAC helpers
 */
import { act } from "@testing-library/react";

// Reset modules between tests to get fresh store
let useAuthStore;

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();

  // Re-import to get a fresh store
  const mod = require("../../store/authStore");
  useAuthStore = mod.default || mod.useAuthStore;
});

describe("Auth Store", () => {
  it("should start with unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("should login and set user/token", () => {
    const { login } = useAuthStore.getState();

    act(() => {
      login({
        user: {
          _id: "u1",
          name: "Test",
          email: "test@test.com",
          role: "student",
        },
        token: "jwt-token",
        refreshToken: "refresh-token",
      });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.name).toBe("Test");
    expect(state.token).toBe("jwt-token");
  });

  it("should logout and clear state", () => {
    const { login, logout } = useAuthStore.getState();

    act(() => {
      login({
        user: {
          _id: "u1",
          name: "Test",
          email: "test@test.com",
          role: "student",
        },
        token: "jwt-token",
        refreshToken: "refresh-token",
      });
    });

    act(() => {
      logout();
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("should check roles correctly", () => {
    const { login } = useAuthStore.getState();

    act(() => {
      login({
        user: {
          _id: "u1",
          name: "Admin",
          email: "admin@test.com",
          role: "admin",
        },
        token: "jwt-token",
        refreshToken: "refresh-token",
      });
    });

    const state = useAuthStore.getState();
    expect(state.isAdmin()).toBe(true);
    expect(state.isStudent()).toBe(false);
    expect(state.hasRole("admin")).toBe(true);
  });
});
