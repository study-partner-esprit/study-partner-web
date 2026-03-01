/* eslint-disable import/first */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockToggle = vi.fn();

vi.mock("../../store/notificationStore", () => ({
  __esModule: true,
  default: () => ({
    unreadCount: 5,
    toggleNotificationCenter: mockToggle,
  }),
}));

import NotificationBell from "../NotificationBell";

describe("NotificationBell Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bell button", () => {
    render(<NotificationBell />);
    const button = screen.getByTitle("Notifications");
    expect(button).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    render(<NotificationBell />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("toggles notification center on click", async () => {
    render(<NotificationBell />);
    await userEvent.click(screen.getByTitle("Notifications"));
    expect(mockToggle).toHaveBeenCalled();
  });
});

describe("NotificationBell with zero unread", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("hides badge when unreadCount is 0", async () => {
    // Re-mock with 0 unread
    vi.doMock("../../store/notificationStore", () => ({
      __esModule: true,
      default: () => ({
        unreadCount: 0,
        toggleNotificationCenter: vi.fn(),
      }),
    }));
    const { default: Bell } = await import("../NotificationBell");
    const { container } = render(<Bell />);
    // Badge span should not exist
    expect(container.querySelector(".bg-red-500")).toBeNull();
  });
});
