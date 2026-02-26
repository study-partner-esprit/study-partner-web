import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Eye,
  Heart,
  FileText,
  Bot,
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Gamepad2,
} from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";

const features = [
  {
    icon: Gamepad2,
    title: "Gamified Learning",
    description:
      "Turn studying into an engaging game with XP, levels, achievements, and leaderboards.",
    color: "text-primary",
    bg: "bg-gradient-to-br from-primary/20 to-red-900/20 border-primary/30",
    badge: "🎮",
    xp: "+50 XP",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description:
      "Unlock badges and rewards for milestones like study streaks, completed courses, and perfect scores.",
    color: "text-yellow-500",
    bg: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    badge: "🏆",
    xp: "+100 XP",
  },
  {
    icon: Target,
    title: "Quest-Based Tasks",
    description:
      "Complete daily quests and challenges to maintain motivation and track progress.",
    color: "text-primary",
    bg: "bg-gradient-to-br from-primary/20 to-red-900/20 border-primary/30",
    badge: "🎯",
    xp: "+25 XP",
  },
  {
    icon: Calendar,
    title: "Smart Planning",
    description:
      "AI-powered study planning that adapts to your learning style and schedule constraints.",
    color: "text-primary",
    bg: "bg-gradient-to-br from-primary/20 to-red-900/20 border-primary/30",
    badge: "📅",
    xp: "+15 XP",
  },
  {
    icon: Bot,
    title: "AI Study Coach",
    description:
      "Get instant feedback and guidance during study sessions to optimize your learning.",
    color: "text-primary",
    bg: "bg-gradient-to-br from-primary/20 to-red-900/20 border-primary/30",
    badge: "🤖",
    xp: "+30 XP",
  },
  {
    icon: Eye,
    title: "Focus Analytics",
    description:
      "Monitor your attention levels and prevent burnout with intelligent fatigue alerts.",
    color: "text-red-500",
    bg: "bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30",
    badge: "👁️",
    xp: "+20 XP",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 border-l-2 border-primary mb-6 animate-pulse">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-primary font-valorant tracking-wider">
              SYSTEM.FEATURES // GAMIFIED
            </span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-valorant mb-4 text-gray-900 dark:text-white uppercase tracking-tighter loading-none">
            Level Up Your <span className="text-outline">Learning</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Transform studying into an addictive game with rewards,
            achievements, and progress tracking.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <TiltCard key={index} className="h-full group">
              {/* Glossy sheen overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none rounded-2xl" />

              <motion.div
                className="h-full p-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* XP Badge */}
                <div className="absolute top-0 right-0 px-4 py-1 bg-yellow-500/10 border-b border-l border-yellow-500/50 text-xs font-bold text-yellow-600 dark:text-yellow-400 font-valorant tracking-widest">
                  {feature.xp}
                </div>

                {/* Feature Badge - Replaced with tech decoration */}
                <div className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-primary/30 pointer-events-none select-none font-valorant">
                  // {feature.badge}
                </div>

                <div
                  className={`w-16 h-16 flex items-center justify-center mb-6 ${feature.bg} relative z-10`}
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
                  }}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white font-valorant uppercase tracking-wide relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10 pl-4 border-l-2 border-primary/20">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </motion.div>
            </TiltCard>
          ))}
        </div>

        {/* Achievement Showcase */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
              🎉 Unlock 50+ unique achievements as you study!
            </span>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
