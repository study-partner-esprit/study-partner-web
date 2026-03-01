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
  aiAPI: { analyzeFrame: vi.fn(), getCoachDecision: vi.fn(), createFocusSession: vi.fn() },
  notificationAPI: {},
  focusAPI: { createSession: vi.fn(), endSession: vi.fn() },
  sessionsAPI: { create: vi.fn(), end: vi.fn() },
  gamificationAPI: { awardXP: vi.fn() },
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

vi.mock("../components/WebcamCapture", () => ({
  __esModule: true,
  default: ({ onFrame }) => (
    <div data-testid="webcam-capture">
      <button data-testid="mock-capture" onClick={() => onFrame?.("data:image/jpeg;base64,mock")}>
        Capture
      </button>
    </div>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: { div: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <div ref={r} {...rest} />; }),
            button: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <button ref={r} {...rest} />; }) },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import StudySession from "../pages/StudySession";
import { sessionsAPI, focusAPI } from "../services/api";

const renderSession = () =>
  render(
    <MemoryRouter>
      <StudySession />
    </MemoryRouter>,
  );

describe("StudySession Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionsAPI.create.mockResolvedValue({ data: { session: { _id: "sess1" } } });
    focusAPI.createSession.mockResolvedValue({ data: { session: { _id: "focus1" } } });
  });

  it("renders session page with start button", () => {
    renderSession();
    expect(screen.getByText(/SESSION|Study Session/i)).toBeInTheDocument();
  });

  it("renders webcam capture component", () => {
    renderSession();
    expect(screen.getByTestId("webcam-capture")).toBeInTheDocument();
  });

  it("has a start/stop session control", () => {
    renderSession();
    const startBtn = screen.getByText(/start|begin|lock in/i);
    expect(startBtn).toBeInTheDocument();
  });

  it("shows session timer area", () => {
    renderSession();
    // Timer should show 00:00 or similar initially
    expect(screen.getByText(/0:00|00:00|0 min/i)).toBeInTheDocument();
  });
});
