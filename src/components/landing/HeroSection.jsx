import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Trophy, Star, Zap, Target, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import TiltCard from '@/components/ui/TiltCard';
import DecryptedText from '@/components/ui/DecryptedText';
// import LightRays from '@/components/ui/LightRays'; // Moved to App.jsx global

const HeroSection = () => {
  const stats = [
    { icon: Users, value: '10K+', label: 'Active Learners', color: 'text-primary' },
    { icon: Trophy, value: '50K+', label: 'Achievements Earned', color: 'text-yellow-500' },
    { icon: TrendingUp, value: '85%', label: 'Success Rate', color: 'text-emerald-500' },
    { icon: Star, value: '4.9/5', label: 'User Rating', color: 'text-yellow-500' },
  ];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center p-0 md:p-0 overflow-hidden overflow-x-hidden">
      {/* Background Typography "GAMEDAY" style */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <span className="text-[20vw] leading-none font-bold font-valorant text-outline-lg opacity-20 dark:opacity-10 scale-150 tracking-tighter transform rotate-[-5deg]">
          GAMEDAY
        </span>
      </div>

        <div className="relative w-full z-10">
          <TiltCard className="rect-card w-full h-screen p-0">
          <div className="relative z-10 text-center p-6 md:p-12 flex flex-col justify-center items-center h-full">

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-red-900/20 border border-primary/30 text-primary text-sm font-medium mb-6 shadow-lg"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>🎮 Gamified Learning Experience</span>
              <Zap className="w-4 h-4 animate-pulse" />
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white font-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Level Up Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500 animate-pulse">
                Study Game 
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl text-muted mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <DecryptedText 
                text="Level up your learning with AI-powered gamification, earn XP, unlock achievements, and turn studying into a fun, personalized adventure."
                animateOn="view"
                revealDirection="start"
                sequential={true}
                speed={50}
                maxIterations={10}
                useOriginalCharsOnly={false}
                encryptedClassName="text-primary"
              />
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 70, 85, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="valo-btn inline-flex items-center bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                >
                  Start Your Journey <ChevronRight className="ml-2 w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="valo-btn inline-flex items-center border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 bg-transparent text-gray-900 dark:text-white"
              >
                <Target className="mr-2 w-5 h-5" />
                View Demo
              </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    className="text-center p-4 valo-card-sm backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 font-valorant">{stat.value}</div>
                    <div className="text-xs uppercase tracking-wider font-bold text-muted">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
};

export default HeroSection;
