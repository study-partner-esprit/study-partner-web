/* eslint-disable import/first */
/**
 * PrivateRoute Component Tests
 * Tests auth guard and admin redirect logic
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
// jest-dom is loaded via src/setupTests.js

// Mock the auth store
const mockStore = {
  isAuthenticated: false,
  token: null,
  sessionExpiry: null,
  user: null,
};

const mockGetUserCharacter = vi.fn();

vi.mock("../store/authStore", () => ({
  __esModule: true,
  useAuthStore: (selector) =>
    typeof selector === "function" ? selector(mockStore) : mockStore,
}));

vi.mock("../services/api", () => ({
  __esModule: true,
  characterAPI: {
    getUserCharacter: (...args) => mockGetUserCharacter(...args),
  },
}));

import PrivateRoute from "../components/PrivateRoute.jsx";

const renderWithRouter = (ui, { route = "/" } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route
          path="/character-selection"
          element={<div>Character Selection</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe("PrivateRoute", () => {
  afterEach(() => {
    mockStore.isAuthenticated = false;
    mockStore.token = null;
    mockStore.sessionExpiry = null;
    mockStore.user = null;
    mockGetUserCharacter.mockReset();
  });

  it("should redirect to login when not authenticated", () => {
    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("should render children when authenticated", () => {
    mockStore.isAuthenticated = true;
    mockStore.user = { role: "student" };

    renderWithRouter(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect non-admin from admin route", () => {
    mockStore.isAuthenticated = true;
    mockStore.user = { role: "student" };

    renderWithRouter(
      <PrivateRoute requireAdmin>
        <div>Admin Content</div>
      </PrivateRoute>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should render admin content for admin users", () => {
    mockStore.isAuthenticated = true;
    mockStore.user = { role: "admin" };

    renderWithRouter(
      <PrivateRoute requireAdmin>
        <div>Admin Content</div>
      </PrivateRoute>,
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("should redirect students without character to character selection", async () => {
    mockStore.isAuthenticated = true;
    mockStore.user = { role: "student" };
    mockGetUserCharacter.mockRejectedValueOnce({
      response: { data: { message: "User has no character assigned" } },
    });

    renderWithRouter(
      <PrivateRoute requireStudent>
        <div>Student Content</div>
      </PrivateRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText("Character Selection")).toBeInTheDocument();
    });
  });

  it("should render student content when character is assigned", async () => {
    mockStore.isAuthenticated = true;
    mockStore.user = { role: "student" };
    mockGetUserCharacter.mockResolvedValueOnce({
      success: true,
      data: {
        character_id: { _id: "character-1" },
      },
    });

    renderWithRouter(
      <PrivateRoute requireStudent>
        <div>Student Content</div>
      </PrivateRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText("Student Content")).toBeInTheDocument();
    });
  });
});
