/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/api", () => ({
  profileAPI: { get: vi.fn() },
  tasksAPI: { getAll: vi.fn() },
}));

vi.mock("../store/authStore", () => ({
  __esModule: true,
  useAuthStore: Object.assign(
    (selector) => {
      const state = {
        user: { _id: "u1", name: "Test User", email: "t@t.com" },
        logout: mockLogout,
      };
      return selector ? selector(state) : state;
    },
    { getState: () => ({ user: { _id: "u1", name: "Test User" }, logout: mockLogout }) },
  ),
}));

vi.mock("../components/QuestPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="quest-panel">QuestPanel</div>,
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (target, prop) => {
        if (typeof prop === "string" && /^[a-z]/.test(prop)) {
          return React.forwardRef((props, ref) => {
            const { initial, animate, exit, whileHover, whileTap, variants, transition, ...rest } = props;
            const Tag = prop;
            return <Tag ref={ref} {...rest} />;
          });
        }
        return target[prop];
      },
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

import Dashboard from "../pages/Dashboard";
import { profileAPI, tasksAPI } from "../services/api";

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profileAPI.get.mockResolvedValue({
      data: {
        profile: {
          nickname: "TestNick",
          level: 5,
          streak: 3,
          totalStudyTime: 120,
        },
      },
    });
    tasksAPI.getAll.mockResolvedValue({
      data: { tasks: [{ _id: "t1", title: "Read Ch.1", status: "todo", priority: "high" }] },
    });
  });

  it("shows loading state initially", () => {
    // Make API hang
    profileAPI.get.mockReturnValue(new Promise(() => {}));
    tasksAPI.getAll.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText("LOADING...")).toBeInTheDocument();
  });

  it("renders dashboard with profile and tasks after loading", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/DASHBOARD/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
    expect(profileAPI.get).toHaveBeenCalled();
    expect(tasksAPI.getAll).toHaveBeenCalledWith({ status: "todo" });
  });

  it("handles empty tasks gracefully", async () => {
    tasksAPI.getAll.mockResolvedValue({ data: { tasks: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/DASHBOARD/)).toBeInTheDocument();
    });
  });

  it("shows error when API fails", async () => {
    profileAPI.get.mockRejectedValue(new Error("Network error"));
    tasksAPI.getAll.mockRejectedValue(new Error("Network error"));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    });
  });

  it("logout navigates to /login", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("LOGOUT")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("LOGOUT"));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders quest panel", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId("quest-panel")).toBeInTheDocument();
    });
  });
});
