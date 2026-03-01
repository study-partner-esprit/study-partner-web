import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Sessions from "./pages/Sessions";
import Tasks from "./pages/Tasks";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import Lobby from "./pages/Lobby";
import CourseUpload from "./pages/CourseUpload";
import StudyPlanner from "./pages/StudyPlanner";
import StudySession from "./pages/StudySession";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import Calendar from "./pages/Calendar";
import Leaderboard from "./pages/Leaderboard";
import ReviewCenter from "./pages/ReviewCenter";
import AISearch from "./pages/AISearch";
import Friends from "./pages/Friends";
import Pricing from "./pages/Pricing";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SessionManager from "./components/SessionManager";
import NotificationCenter from "./components/NotificationCenter";
import UpgradePrompt from "./components/UpgradePrompt";
import TrialBanner from "./components/TrialBanner";
import { ErrorBoundary } from "./components/shared";
import useNotificationStore from "./store/notificationStore";

function App() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { startPolling, stopPolling } = useNotificationStore();
  const isLandingPage = location.pathname === "/";
  const isLobby = location.pathname === "/lobby";

  // Initialize authentication on app start
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  // Show full navbar on landing page if user is logged in
  const minimalNav = (isLandingPage || isLobby) && !user;

  // Start/stop notification polling based on authentication
  useEffect(() => {
    if (user?._id) {
      const cleanup = startPolling(user._id);
      return cleanup;
    } else {
      stopPolling();
    }
  }, [user?._id, startPolling, stopPolling]);

  return (
    <ErrorBoundary>
      <SessionManager />
      <NotificationCenter />
      <UpgradePrompt />
      <TrialBanner />
      <Navbar minimal={minimalNav} />
      <div className="relative z-10 w-full min-h-screen pt-20">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/lobby"
            element={
              <PrivateRoute>
                <Lobby />
              </PrivateRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <PrivateRoute>
                <Sessions />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <PrivateRoute>
                <Subjects />
              </PrivateRoute>
            }
          />
          <Route
            path="/subjects/:subjectId"
            element={
              <PrivateRoute>
                <SubjectDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload-course"
            element={
              <PrivateRoute>
                <CourseUpload />
              </PrivateRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <PrivateRoute>
                <StudyPlanner />
              </PrivateRoute>
            }
          />
          <Route
            path="/study-session"
            element={
              <PrivateRoute>
                <StudySession />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <PrivateRoute>
                <ReviewCenter />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <AISearch />
              </PrivateRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <PrivateRoute>
                <Friends />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
