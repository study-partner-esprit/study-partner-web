/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
const mockFetchFriends = vi.fn();
const mockFetchParticipants = vi.fn();
const mockInviteToSession = vi.fn();
const mockStartTeamSession = vi.fn();
const mockResetSession = vi.fn();
const mockClearSessionStartSignal = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/api", () => ({
  profileAPI: { get: vi.fn() },
  teamSessionsAPI: { start: vi.fn() },
  characterAPI: {
    getOwnedCharacters: vi.fn(),
    changeCharacter: vi.fn(),
  },
}));

vi.mock("../store/authStore", () => ({
  __esModule: true,
  useAuthStore: () => ({
    user: { _id: "u1", userId: "u1", name: "Test User" },
  }),
}));

vi.mock("../store/sessionStore", () => ({
  __esModule: true,
  default: () => ({
    teamSession: { _id: "team-1", userId: "u1" },
    inviteCode: "ABCD12",
    selectedCourse: { title: "Biology" },
    startTeamSession: mockStartTeamSession,
    resetSession: mockResetSession,
  }),
}));

vi.mock("../store/friendsStore", () => ({
  __esModule: true,
  default: () => ({
    friends: [],
    fetchFriends: mockFetchFriends,
    fetchParticipants: mockFetchParticipants,
    inviteToSession: mockInviteToSession,
    teamParticipants: [],
  }),
}));

vi.mock("../store/notificationStore", () => ({
  __esModule: true,
  default: () => ({
    sessionStartSignal: null,
    clearSessionStartSignal: mockClearSessionStartSignal,
  }),
}));

vi.mock("../components/Characters/CharacterBadge/CharacterBadge", () => ({
  __esModule: true,
  default: ({ character }) => (
    <span data-testid="character-badge">{character?.name || "Character"}</span>
  ),
}));

vi.mock("../components/VoiceChat/VoiceButton", () => ({
  __esModule: true,
  default: () => <div data-testid="voice-button" />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef((props, ref) => {
      const {
        initial,
        animate,
        exit,
        whileHover,
        whileTap,
        variants,
        transition,
        ...rest
      } = props;
      return <div ref={ref} {...rest} />;
    }),
    button: React.forwardRef((props, ref) => {
      const {
        initial,
        animate,
        exit,
        whileHover,
        whileTap,
        variants,
        transition,
        ...rest
      } = props;
      return <button ref={ref} {...rest} />;
    }),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import TeamLobby from "../pages/TeamLobby";
import { characterAPI, profileAPI } from "../services/api";

const renderTeamLobby = () =>
  render(
    <MemoryRouter>
      <TeamLobby />
    </MemoryRouter>,
  );

describe("TeamLobby", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    profileAPI.get.mockResolvedValue({
      data: { profile: { nickname: "Team Lead" } },
    });

    characterAPI.getOwnedCharacters.mockResolvedValue({
      success: true,
      data: {
        active_character_id: "char-1",
        owned_characters: [
          { _id: "char-1", name: "Chrono" },
          { _id: "char-2", name: "Aegis" },
        ],
      },
    });

    characterAPI.changeCharacter.mockResolvedValue({ success: true });
  });

  test("loads owned character selector with current inventory", async () => {
    renderTeamLobby();

    await waitFor(() => {
      expect(characterAPI.getOwnedCharacters).toHaveBeenCalled();
    });

    const select = await screen.findByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Chrono" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Aegis" })).toBeInTheDocument();
  });

  test("changing lobby character calls API and refreshes participants", async () => {
    const user = userEvent.setup();
    renderTeamLobby();

    const select = await screen.findByRole("combobox");
    const callsBeforeChange = mockFetchParticipants.mock.calls.length;

    await user.selectOptions(select, "char-2");

    await waitFor(() => {
      expect(characterAPI.changeCharacter).toHaveBeenCalledWith("char-2");
    });

    expect(mockFetchParticipants.mock.calls.length).toBeGreaterThan(
      callsBeforeChange,
    );
  });
});
