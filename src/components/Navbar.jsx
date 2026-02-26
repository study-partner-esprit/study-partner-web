import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Trophy,
  Star,
  Zap,
  Target,
  BookOpen,
  Home,
  User,
  BarChart3,
  Sparkles,
  Crown,
  Rocket,
  LogOut,
  CheckSquare,
  Brain,
  Search,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/authStore";
import { profileAPI } from "@/services/api";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

const Navbar = ({ minimal = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      profileAPI
        .get()
        .then((res) => setProfile(res.data.profile))
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log("Navbar debug:", {
        path: location.pathname,
        minimal,
        userPresent: !!user,
        navCount: navItems.length,
      });
    } catch (e) {}
  }, [location.pathname, minimal, user]);

  const navItems = minimal
    ? []
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { path: "/subjects", label: "Subjects", icon: BookOpen },
        { path: "/tasks", label: "Tasks", icon: CheckSquare },
        { path: "/planner", label: "Study Plans", icon: Target },
        { path: "/study-session", label: "Session", icon: Zap },
        { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { path: "/reviews", label: "Reviews", icon: Brain },
        { path: "/search", label: "Search", icon: Search },
      ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-xl border-b border-border h-20 shadow-sm box-glow"
    >
      {/* Glossy Overlay - Removed for clean top bar look */}
      {/* Floating Particles - Removed for clean top bar look */}

      <div className="relative max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left Corner: Logo */}
          <Link
            to="/"
            className="relative z-10 flex items-center space-x-4 group"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all duration-300">
                <BookOpen className="w-6 h-6 text-foreground" />
              </motion.div>
            </motion.div>

            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight text-foreground/90">
                StudyPartner
              </span>
            </div>
          </Link>

          {/* Centered nav will be used for the Epic-style header. */}
          {!minimal && (
            <div className="flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative block"
                    >
                      <motion.div
                        className={`relative px-5 py-2 flex items-center gap-2 font-valorant text-sm ${
                          isActive
                            ? "text-primary border-b-2 border-primary text-glow"
                            : "text-foreground opacity-80 hover:text-primary hover:text-glow transition-all"
                        }`}
                        whileHover={{ y: -2 }}
                      >
                        <span className="relative z-10 tracking-wider font-bold">
                          {item.label.toUpperCase()}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Corner: Actions */}
          <div className="relative z-10 flex items-center gap-3 ml-auto">
            <motion.button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted border border-border flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </motion.button>

            {!minimal && user && <NotificationBell />}

            {!minimal && user && (
              <div className="hidden lg:flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold opacity-80 text-foreground">
                    LEVEL {profile?.level?.current || 1}
                  </span>
                </div>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-widest">
                      {profile?.nickname || user.name}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-[#ff4655] font-black tracking-widest">
                      <span>LVL</span>
                      <span className="text-sm">
                        {profile?.level?.current || 1}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-border group-hover:border-[#ff4655] transition-colors relative">
                    <img
                      src={
                        profile?.avatar
                          ? profile.avatar.startsWith("data:")
                            ? profile.avatar
                            : profile.avatar.startsWith("http")
                              ? profile.avatar
                              : `${import.meta.env.VITE_API_URL || ""}${profile.avatar}`
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <motion.button
                  onClick={logout}
                  className="w-8 h-8 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center hover:bg-destructive/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                </motion.button>
              </div>
            ) : (
              <Link to="/login">
                <motion.button
                  className="valo-btn px-6 py-2.5 bg-foreground text-background font-semibold text-sm shadow-lg hover:bg-primary hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  SIGN IN
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {!minimal && (
        <motion.div
          className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-2xl rounded-b-3xl"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="px-6 py-4 space-y-3">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-primary/15 text-primary shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-md"
                    }`}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    <span className="font-semibold text-lg">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
