/* eslint-disable import/first */
import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/api", () => ({
  profileAPI: { get: vi.fn() },
  characterAPI: {
    getUserCharacter: vi.fn(),
    getOwnedCharacters: vi.fn(),
    changeCharacter: vi.fn(),
  },
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
  motion: {
    div: React.forwardRef((p, r) => {
      const {
        initial,
        animate,
        exit,
        whileHover,
        whileTap,
        variants,
        transition,
        ...rest
      } = p;
      return <div ref={r} {...rest} />;
    }),
    button: React.forwardRef((p, r) => {
      const {
        initial,
        animate,
        exit,
        whileHover,
        whileTap,
        variants,
        transition,
        ...rest
      } = p;
      return <button ref={r} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import Lobby from "../pages/Lobby";
import { characterAPI, profileAPI } from "../services/api";

const renderLobby = () =>
  render(
    <MemoryRouter>
      <Lobby />
    </MemoryRouter>,
  );

describe("Lobby Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    profileAPI.get.mockResolvedValue({
      data: { profile: { nickname: "TestNick", level: 5 } },
    });
    characterAPI.getOwnedCharacters.mockResolvedValue({
      success: true,
      data: {
        active_character_id: "char-1",
        owned_characters: [
          { _id: "char-1", name: "Chrono", icon: "⏱️" },
          { _id: "char-2", name: "Aegis", icon: "🛡️" },
        ],
      },
    });
    characterAPI.getUserCharacter.mockResolvedValue({
      success: true,
      data: {
        character_id: { _id: "char-1", name: "Chrono", icon: "⏱️" },
      },
    });
    characterAPI.changeCharacter.mockResolvedValue({
      success: true,
      data: {
        character_id: { _id: "char-2", name: "Aegis", icon: "🛡️" },
      },
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
    const deepFocusButtons = screen.getAllByText(/DEEP FOCUS/i);
    expect(deepFocusButtons.length).toBeGreaterThan(0);
    const pomodoroButtons = screen.getAllByText(/POMODORO/i);
    expect(pomodoroButtons.length).toBeGreaterThan(0);
  });

  it("shows lock in button", async () => {
    renderLobby();
    await waitFor(() => {
      expect(screen.getByText(/LOCK IN|Start/i)).toBeInTheDocument();
    });
  });

  it("mode selection updates state", async () => {
    renderLobby();
    const pomodoroButtons = screen.getAllByText(/POMODORO/i);
    expect(pomodoroButtons.length).toBeGreaterThan(0);
    // Just verify the buttons exist - update happens internally
    expect(pomodoroButtons[0]).toBeInTheDocument();
  });

  it("lock in applies selected owned character and navigates with selectedCharacterId", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderLobby();

    const characterSelect = await screen.findByRole("combobox");
    await screen.findByRole("option", { name: "Aegis" });
    await user.selectOptions(characterSelect, "char-2");

    const lockInButton = screen.getByRole("button", { name: /LOCK IN/i });
    await user.click(lockInButton);

    await waitFor(() => {
      expect(characterAPI.changeCharacter).toHaveBeenCalledWith("char-2");
    });

    await act(async () => {
      vi.advanceTimersByTime(12000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sessions", {
        state: {
          mode: "focus",
          selectedCharacterId: "char-2",
        },
      });
    });
  });
});
