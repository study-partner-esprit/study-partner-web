/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/api", () => ({
  aiAPI: {
    search: vi.fn(),
    searchHistory: vi.fn(),
  },
}));

vi.mock("../store/authStore", () => ({
  __esModule: true,
  useAuthStore: Object.assign(
    (sel) => {
      const s = { user: { _id: "u1" } };
      return sel ? sel(s) : s;
    },
    { getState: () => ({ user: { _id: "u1" } }) },
  ),
}));

vi.mock("framer-motion", () => ({
  motion: { div: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <div ref={r} {...rest} />; }),
            form: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <form ref={r} {...rest} />; }),
            button: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <button ref={r} {...rest} />; }) },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import AISearch from "../pages/AISearch";
import { aiAPI } from "../services/api";

const renderSearch = () =>
  render(
    <MemoryRouter>
      <AISearch />
    </MemoryRouter>,
  );

describe("AISearch Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiAPI.searchHistory.mockResolvedValue({ data: { history: [] } });
    aiAPI.search.mockResolvedValue({
      data: { results: [{ _id: "r1", content: "The answer is 42", score: 0.9 }] },
    });
  });

  it("loads search history on mount", async () => {
    renderSearch();
    await waitFor(() => {
      expect(aiAPI.searchHistory).toHaveBeenCalled();
    });
  });

  it("renders search input", () => {
    renderSearch();
    const input = screen.getByPlaceholderText(/search|ask|query/i);
    expect(input).toBeInTheDocument();
  });

  it("submits search query", async () => {
    renderSearch();
    const input = screen.getByPlaceholderText(/search|ask|query/i);
    await userEvent.type(input, "What is quantum physics?");
    const submitBtn = screen.getByRole("button", { name: /search/i });
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(aiAPI.search).toHaveBeenCalled();
    });
  });

  it("renders search heading", () => {
    renderSearch();
    expect(screen.getByText(/SEARCH|AI Search/i)).toBeInTheDocument();
  });
});
