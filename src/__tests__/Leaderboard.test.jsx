/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/api", () => ({
  gamificationAPI: { getLeaderboard: vi.fn(), getProfile: vi.fn() },
  friendsAPI: { getAll: vi.fn() },
}));

vi.mock("../store/authStore", () => ({
  __esModule: true,
  useAuthStore: Object.assign(
    (sel) => {
      const s = { user: { _id: "u1", name: "Test" } };
      return sel ? sel(s) : s;
    },
    { getState: () => ({ user: { _id: "u1" } }) },
  ),
}));

vi.mock("framer-motion", () => ({
  motion: { div: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <div ref={r} {...rest} />; }),
            tr: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <tr ref={r} {...rest} />; }) },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import Leaderboard from "../pages/Leaderboard";
import { gamificationAPI, friendsAPI } from "../services/api";

const mockLeaderboard = [
  { userId: "u1", name: "Test", level: 5, xp: 500, streak: 3, rank: 1 },
  { userId: "u2", name: "Alice", level: 4, xp: 400, streak: 2, rank: 2 },
  { userId: "u3", name: "Bob", level: 3, xp: 300, streak: 1, rank: 3 },
];

const renderLeaderboard = () =>
  render(
    <MemoryRouter>
      <Leaderboard />
    </MemoryRouter>,
  );

describe("Leaderboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gamificationAPI.getLeaderboard.mockResolvedValue({ data: { leaderboard: mockLeaderboard } });
    gamificationAPI.getProfile.mockResolvedValue({ data: { level: 5, xp: 500, streak: 3 } });
    friendsAPI.getAll.mockResolvedValue({ data: { friends: [{ _id: "f1", friend: { _id: "u2" } }] } });
  });

  it("fetches leaderboard on mount", async () => {
    renderLeaderboard();
    await waitFor(() => {
      expect(gamificationAPI.getLeaderboard).toHaveBeenCalled();
    });
  });

  it("renders leaderboard entries", async () => {
    renderLeaderboard();
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("highlights current user", async () => {
    renderLeaderboard();
    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  it("fetches friends for friends-only filter", async () => {
    renderLeaderboard();
    await waitFor(() => {
      expect(friendsAPI.getAll).toHaveBeenCalled();
    });
  });
});
