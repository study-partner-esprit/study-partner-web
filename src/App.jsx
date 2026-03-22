import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/services/api";
import {
  extractDominantColor,
  extractColorFromVideo,
} from "@/utils/colorExtractor";
import "@/styles/dynamicAccent.css";
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
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCoupons from "./pages/AdminCoupons";
import AdminUsers from "./pages/AdminUsers";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminAnalytics from "./pages/AdminAnalytics";
import Pricing from "./pages/Pricing";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import StudySessionSetup from "./pages/StudySessionSetup";
import TeamLobby from "./pages/TeamLobby";
import BackgroundCustomizer from "./pages/BackgroundCustomizer";
import AnimatedBackgroundCustomizer from "./pages/AnimatedBackgroundCustomizer";
import LevelUpNotification from "./components/LevelUpNotification";
import SessionInvitePopup from "./components/SessionInvitePopup";
import useGamificationStore from "./store/gamificationStore";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SessionManager from "./components/SessionManager";
import NotificationCenter from "./components/NotificationCenter";
import UpgradePrompt from "./components/UpgradePrompt";
import TrialBanner from "./components/TrialBanner";
import Sidebar from "./components/Sidebar";
import { ErrorBoundary } from "./components/shared";
import useNotificationStore from "./store/notificationStore";

function App() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { startPolling, stopPolling } = useNotificationStore();
  const isLandingPage = location.pathname === "/";
  const isLobby = location.pathname === "/lobby";
  const isFullscreenPage = ["/team-lobby"].includes(location.pathname);
  const {
    fetchLevelInfo,
    fetchBackgroundSettings,
    backgroundSettings,
    animatedBackgroundSettings,
  } = useGamificationStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accentColor, setAccentColor] = useState("#4fb8ce");

  const tier = useAuthStore((s) => s.getTier());
  const trialVisible = tier === "trial";
  const PAID_BANNER_NEAR_END_DAYS = 5;
  const subscriptionVisible =
    ["vip", "vip_plus"].includes(tier) &&
    Number(user?.daysRemaining || 0) > 0 &&
    Number(user?.daysRemaining || 0) <= PAID_BANNER_NEAR_END_DAYS;
  const bannerVisible = trialVisible || subscriptionVisible;
  // heights in px: trial banner = 40, navbar = 80
  const TRIAL_BANNER_HEIGHT = bannerVisible ? 40 : 0;
  const NAVBAR_HEIGHT = 80;
  const topOffsetPx = NAVBAR_HEIGHT + TRIAL_BANNER_HEIGHT;

  // Initialize authentication on app start
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  // Refresh user data from server on app startup (to get latest subscription status)
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const { user: currentUser, token } = useAuthStore.getState();
        if (currentUser && token) {
          const response = await authAPI.getMe();
          const freshUser = response.data?.user;
          if (freshUser) {
            useAuthStore.getState().updateUser(freshUser);
          }
        }
      } catch (err) {
        // Not critical - continue with cached user data
      }
    };
    refreshUserData();
  }, []);

  // Fetch gamification data when authenticated
  useEffect(() => {
    if (user?._id) {
      fetchLevelInfo();
      fetchBackgroundSettings();
    }
  }, [user?._id]);

  // Extract and apply dominant color from background
  useEffect(() => {
    const extractColor = async () => {
      try {
        let color = "#4fb8ce"; // default
        if (
          animatedBackgroundSettings?.enabled &&
          animatedBackgroundSettings?.videoUrl
        ) {
          color = await extractColorFromVideo(
            animatedBackgroundSettings.videoUrl,
          );
        } else if (
          backgroundSettings?.enabled &&
          backgroundSettings?.imageUrl
        ) {
          color = await extractDominantColor(backgroundSettings.imageUrl);
        }
        setAccentColor(color);
        // Apply to document
        document.documentElement.style.setProperty(
          "--accent-color-dynamic",
          color,
        );
      } catch (err) {
        console.error("Error extracting background color:", err);
      }
    };
    extractColor();
  }, [
    backgroundSettings?.imageUrl,
    animatedBackgroundSettings?.videoUrl,
    backgroundSettings?.enabled,
    animatedBackgroundSettings?.enabled,
  ]);

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

  // Show sidebar for any authenticated user on all pages except the lobby / fullscreen pages
  const showSidebar = user && !isLobby && !isFullscreenPage;

  return (
    <ErrorBoundary>
      {/* Background layers */}
      {!isLandingPage &&
        backgroundSettings?.enabled &&
        backgroundSettings?.imageUrl && (
          <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: `url(${backgroundSettings.imageUrl})`,
              backgroundSize:
                backgroundSettings.position === "repeat"
                  ? "auto"
                  : backgroundSettings.position || "cover",
              backgroundPosition: "center",
              backgroundRepeat:
                backgroundSettings.position === "repeat"
                  ? "repeat"
                  : "no-repeat",
              opacity: backgroundSettings.opacity || 0.15,
              filter: `blur(${backgroundSettings.blur || 2}px)`,
            }}
          />
        )}
      {!isLandingPage &&
        animatedBackgroundSettings?.enabled &&
        animatedBackgroundSettings?.videoUrl && (
          <video
            autoPlay
            muted
            loop={animatedBackgroundSettings.loop !== false}
            playsInline
            className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
            style={{
              opacity: animatedBackgroundSettings.opacity || 0.12,
              filter: `brightness(${100 + (animatedBackgroundSettings.brightness || 0)}%) saturate(${animatedBackgroundSettings.saturation || 80}%)`,
            }}
          >
            <source
              src={animatedBackgroundSettings.videoUrl}
              type="video/mp4"
            />
          </video>
        )}

      {/* Ambient glow layer — adapts to extracted background color */}
      {!isLandingPage &&
        (backgroundSettings?.enabled ||
          animatedBackgroundSettings?.enabled) && (
          <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
            <div
              className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vh] rounded-full blur-[150px] opacity-20"
              style={{ backgroundColor: accentColor }}
            />
            <div
              className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vh] rounded-full blur-[150px] opacity-15"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        )}

      <SessionManager />
      <NotificationCenter />
      <LevelUpNotification />
      <SessionInvitePopup />
      <UpgradePrompt />
      <TrialBanner />
      <Navbar
        minimal={minimalNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        topOffset={topOffsetPx}
      />

      {showSidebar && <Sidebar topOffset={topOffsetPx} />}

      <div
        className={`relative z-10 w-full min-h-screen transition-all duration-300 ${showSidebar ? "min-[800px]:pl-[72px]" : ""}`}
        style={{ paddingTop: isLandingPage ? topOffsetPx : topOffsetPx }}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
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
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <PrivateRoute requireAdmin>
                <AdminCoupons />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute requireAdmin>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute requireAdmin>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <PrivateRoute requireAdmin>
                <AdminSubscriptions />
              </PrivateRoute>
            }
          />
          <Route
            path="/session-setup"
            element={
              <PrivateRoute>
                <StudySessionSetup />
              </PrivateRoute>
            }
          />
          <Route
            path="/team-lobby"
            element={
              <PrivateRoute>
                <TeamLobby />
              </PrivateRoute>
            }
          />
          <Route
            path="/customize/wallpaper"
            element={
              <PrivateRoute>
                <BackgroundCustomizer />
              </PrivateRoute>
            }
          />
          <Route
            path="/customize/animated"
            element={
              <PrivateRoute>
                <AnimatedBackgroundCustomizer />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
