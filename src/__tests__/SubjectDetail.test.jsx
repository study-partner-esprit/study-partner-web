/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("../services/api", () => ({
  subjectAPI: { get: vi.fn() },
  courseAPI: { getBySubject: vi.fn(), addFiles: vi.fn() },
  studyPlanAPI: { create: vi.fn() },
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

vi.mock("../components/UploadModal", () => ({
  __esModule: true,
  default: () => <div data-testid="upload-modal" />,
}));

vi.mock("framer-motion", () => ({
  motion: { div: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <div ref={r} {...rest} />; }),
            button: React.forwardRef((p, r) => { const {initial,animate,exit,whileHover,whileTap,variants,transition,...rest} = p; return <button ref={r} {...rest} />; }) },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import SubjectDetail from "../pages/SubjectDetail";
import { subjectAPI, courseAPI } from "../services/api";

const renderSubjectDetail = (id = "s1") =>
  render(
    <MemoryRouter initialEntries={[`/subjects/${id}`]}>
      <Routes>
        <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
      </Routes>
    </MemoryRouter>,
  );

describe("SubjectDetail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subjectAPI.get.mockResolvedValue({
      data: { subject: { _id: "s1", name: "Mathematics", description: "Numbers and equations" } },
    });
    courseAPI.getBySubject.mockResolvedValue({
      data: { courses: [{ _id: "c1", title: "Algebra 101", files: [] }] },
    });
  });

  it("fetches subject details and courses on mount", async () => {
    renderSubjectDetail();
    await waitFor(() => {
      expect(subjectAPI.get).toHaveBeenCalledWith("s1");
      expect(courseAPI.getBySubject).toHaveBeenCalledWith("s1");
    });
  });

  it("renders subject name after loading", async () => {
    renderSubjectDetail();
    await waitFor(() => {
      expect(screen.getByText("Mathematics")).toBeInTheDocument();
    });
  });

  it("renders course list", async () => {
    renderSubjectDetail();
    await waitFor(() => {
      expect(screen.getByText("Algebra 101")).toBeInTheDocument();
    });
  });

  it("handles missing courses", async () => {
    courseAPI.getBySubject.mockResolvedValue({ data: { courses: [] } });
    renderSubjectDetail();
    await waitFor(() => {
      expect(screen.getByText("Mathematics")).toBeInTheDocument();
    });
  });
});
