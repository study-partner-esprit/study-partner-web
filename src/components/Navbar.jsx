import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, Trophy, Star, Zap, Target, BookOpen, Home, User, BarChart3, Sparkles, Crown, Rocket } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const Navbar = ({ minimal = false }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = minimal ? [] : [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/tasks', label: 'Tasks', icon: Target },
    { path: '/sessions', label: 'Sessions', icon: BookOpen },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-6 left-6 right-6 z-50 bg-transparent"
    >
      {/* Glossy Overlay - Removed for transparent effect 
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      */}
      
      {/* Floating Particles - Removed for transparent effect 
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`nav-particle-${i}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      */}

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Left Corner: Logo */}
          <Link to="/" className="relative z-10 flex items-center space-x-4 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all duration-300"
              >
                <BookOpen className="w-6 h-6 text-foreground" />
              </motion.div>
            </motion.div>

            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight text-foreground/90">
                StudyPartner
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links (Absolute Centered) */}
          {!minimal && (
            <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
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
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100'
                        }`}
                        whileHover={{ y: -2 }}
                      >
                        <span className="relative z-10 tracking-wider font-bold">{item.label.toUpperCase()}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Corner: Actions */}
          <div className="relative z-10 flex items-center gap-3">
             <motion.button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </motion.button>
            
            {!minimal && (
              <div className="hidden lg:flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold opacity-80">2,450 XP</span>
                </div>
              </div>
            )}

            <Link to="/login">
              <motion.button
                className="valo-btn px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-sm shadow-lg hover:bg-primary hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                SIGN IN
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {!minimal && (
        <motion.div
          className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-2xl rounded-b-3xl"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
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
                        ? 'bg-primary/15 text-primary shadow-lg shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-md'
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