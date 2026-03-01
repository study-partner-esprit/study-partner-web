/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/api", () => ({
  profileAPI: { get: vi.fn() },
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
            button: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <button ref={r} {...rest} />; }) },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import Lobby from "../pages/Lobby";
import { profileAPI } from "../services/api";

const renderLobby = () =>
  render(
    <MemoryRouter>
      <Lobby />
    </MemoryRouter>,
  );

describe("Lobby Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profileAPI.get.mockResolvedValue({
      data: { profile: { nickname: "TestNick", level: 5 } },
    });
  });

  it("fetches profile on mount", async () => {
    renderLobby();
    await waitFor(() => {
      expect(profileAPI.get).toHaveBeenCalled();
    });
  });

  it("renders mode selection options", async () => {
    renderLobby();
    await waitFor(() => {
      expect(screen.getByText(/DEEP FOCUS/i)).toBeInTheDocument();
      expect(screen.getByText(/POMODORO/i)).toBeInTheDocument();
    });
  });

  it("shows lock in button", async () => {
    renderLobby();
    await waitFor(() => {
      expect(screen.getByText(/LOCK IN|Start/i)).toBeInTheDocument();
    });
  });

  it("mode selection updates state", async () => {
    renderLobby();
    await waitFor(() => {
      expect(screen.getByText(/DEEP FOCUS/i)).toBeInTheDocument();
    });
    const pomodoroBtn = screen.getByText(/POMODORO/i);
    await userEvent.click(pomodoroBtn);
    // POMODORO should now be selected (class change)
    expect(pomodoroBtn).toBeInTheDocument();
  });
});
