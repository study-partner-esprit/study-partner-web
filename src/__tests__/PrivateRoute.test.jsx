/* eslint-disable import/first */
/**
 * PrivateRoute Component Tests
 * Tests auth guard and admin redirect logic
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
// jest-dom is loaded via src/setupTests.js

// Mock the auth store
const mockStore = {
  isAuthenticated: false,
  user: null,
};

vi.mock("../store/authStore", () => ({
  __esModule: true,
  useAuthStore: (selector) =>
    typeof selector === "function" ? selector(mockStore) : mockStore,
}));

import PrivateRoute from "../components/PrivateRoute.jsx";

const renderWithRouter = (ui, { route = "/" } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("PrivateRoute", () => {
  afterEach(() => {
    mockStore.isAuthenticated = false;
    mockStore.user = null;
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
});
