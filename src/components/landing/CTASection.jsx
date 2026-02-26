import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Star,
  Zap,
  Gift,
  Crown,
  Rocket,
} from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";

const CTASection = () => {
  const rewards = [
    {
      icon: Star,
      text: "Earn 500 XP on signup",
      color: "text-yellow-500",
      glow: "shadow-yellow-500/50",
    },
    {
      icon: Trophy,
      text: "Unlock welcome badge",
      color: "text-primary",
      glow: "shadow-primary/50",
    },
    {
      icon: Gift,
      text: "Get free study templates",
      color: "text-red-400",
      glow: "shadow-red-400/50",
    },
    {
      icon: Zap,
      text: "Start your first quest",
      color: "text-primary",
      glow: "shadow-primary/50",
    },
  ];

  return (
    <section className="relative min-h-screen w-full px-0 overflow-hidden flex items-center overflow-x-hidden">
      {/* Light rays removed */}

      <div className="relative w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <TiltCard className="relative overflow-hidden group p-0 md:p-0 text-center w-full rect-card h-screen flex items-center">
            {/* Glossy sheen overlay (CTA) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-40 pointer-events-none cta-inner-sheen" />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full flex flex-col justify-center items-center h-full"
            >
              {/* Enhanced Badge */}
              <motion.div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent-purple/20 border border-primary/30 mb-8 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </motion.div>
                <span className="font-bold text-primary tracking-wide uppercase text-sm">
                  🎮 Ready to Level Up?
                </span>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <Trophy className="w-5 h-5 text-primary animate-pulse" />
                </motion.div>
              </motion.div>

              {/* Enhanced Title */}
              <motion.h2
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white font-display tracking-tight cta-title"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Join the Study <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500 animate-pulse">
                  Revolution
                </span>
              </motion.h2>
              {/* Enhanced Description */}
              <motion.p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Start your gamified learning journey today and unlock your full
                academic potential. Join thousands of students already leveling
                up their grades!
              </motion.p>

              {/* Enhanced Reward Grid */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {rewards.map((reward, index) => {
                  const Icon = reward.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center p-6 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 group/reward"
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.1,
                      }}
                    >
                      <motion.div
                        className={`p-3 rounded-xl bg-gradient-to-br from-white/20 to-white/10 mb-4 ${reward.glow}`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`w-8 h-8 ${reward.color}`} />
                      </motion.div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">
                        {reward.text}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Enhanced CTA Button */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link to="/register">
                  <motion.button
                    className="group relative inline-flex items-center px-10 py-5 text-xl font-bold text-white valo-btn bg-primary hover:bg-primary/90 shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 25px 50px rgba(255, 70, 85, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Button Background Animation */}
                    <motion.div
                      className="absolute inset-0 bg-primary/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />

                    {/* Button Content */}
                    <div className="relative flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Zap className="mr-3 w-6 h-6" />
                      </motion.div>
                      <span>Start Free Trial</span>
                      <motion.div
                        className="ml-3"
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Enhanced Footer Text */}
              <motion.div
                className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-4 h-4 text-yellow-500" />
                  No credit card required
                </motion.span>
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Rocket className="w-4 h-4 text-primary" />
                  14-day free trial
                </motion.span>
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="w-4 h-4 text-primary" />
                  Cancel anytime
                </motion.span>
              </motion.div>
            </motion.div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
