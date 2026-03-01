import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Check, X, Sparkles, Crown, Star, Zap } from "lucide-react";

const tiers = [
  {
    id: "normal",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: <Star size={28} />,
    color: "from-gray-600 to-gray-700",
    borderColor: "border-gray-600/30",
    features: {
      "Manual course creation": true,
      "Task management": true,
      "Study sessions": true,
      "Calendar view": true,
      "Subjects & topics": true,
      "Leaderboard": true,
      "AI course ingestion": false,
      "AI study planner": false,
      "AI scheduler": false,
      "AI coach": false,
      "Signal processing (webcam)": false,
      "AI search": false,
      "Spaced repetition reviews": false,
    },
  },
  {
    id: "vip",
    name: "VIP",
    price: "$9.99",
    period: "/month",
    icon: <Zap size={28} />,
    color: "from-blue-600 to-cyan-600",
    borderColor: "border-blue-500/30",
    popular: false,
    features: {
      "Manual course creation": true,
      "Task management": true,
      "Study sessions": true,
      "Calendar view": true,
      "Subjects & topics": true,
      "Leaderboard": true,
      "AI course ingestion": true,
      "AI study planner": true,
      "AI scheduler": true,
      "AI coach": false,
      "Signal processing (webcam)": false,
      "AI search": true,
      "Spaced repetition reviews": true,
    },
  },
  {
    id: "vip_plus",
    name: "VIP+",
    price: "$19.99",
    period: "/month",
    icon: <Crown size={28} />,
    color: "from-purple-600 to-pink-600",
    borderColor: "border-purple-500/30",
    popular: true,
    features: {
      "Manual course creation": true,
      "Task management": true,
      "Study sessions": true,
      "Calendar view": true,
      "Subjects & topics": true,
      "Leaderboard": true,
      "AI course ingestion": true,
      "AI study planner": true,
      "AI scheduler": true,
      "AI coach": true,
      "Signal processing (webcam)": true,
      "AI search": true,
      "Spaced repetition reviews": true,
    },
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const currentTier = useAuthStore((s) => s.getTier());
  const user = useAuthStore((s) => s.user);

  const handleSelect = (tierId) => {
    if (tierId === currentTier) return;
    // TODO: integrate real payment flow (Stripe)
    alert(
      `Payment integration coming soon! You selected the ${tierId.toUpperCase()} plan.`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="text-purple-400" size={24} />
            <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm">
              Choose Your Plan
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Unlock Your Full{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Study Potential
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl mx-auto"
          >
            Start free and upgrade when you need AI-powered study tools.
          </motion.p>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, i) => {
            const isCurrent = tier.id === currentTier;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i }}
                className={`relative rounded-2xl border ${tier.borderColor} bg-gray-900/80 backdrop-blur-sm p-8 flex flex-col ${
                  tier.popular ? "ring-2 ring-purple-500/50 scale-[1.02]" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div
                  className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${tier.color} p-3 w-fit text-white mb-4`}
                >
                  {tier.icon}
                </div>

                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    {tier.price}
                  </span>
                  <span className="text-gray-400 text-sm ml-1">
                    {tier.period}
                  </span>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {Object.entries(tier.features).map(([feature, enabled]) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      {enabled ? (
                        <Check className="text-green-400 mt-0.5 shrink-0" size={16} />
                      ) : (
                        <X className="text-gray-600 mt-0.5 shrink-0" size={16} />
                      )}
                      <span className={enabled ? "text-gray-200" : "text-gray-600"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => (isCurrent ? null : handleSelect(tier.id))}
                  disabled={isCurrent}
                  className={`w-full rounded-xl py-3 font-semibold transition-all ${
                    isCurrent
                      ? "bg-gray-700 text-gray-400 cursor-default"
                      : tier.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/25"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                >
                  {isCurrent ? "Current Plan" : "Get Started"}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Back */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-300 transition text-sm"
          >
            &larr; Go back
          </button>
        </div>
      </div>
    </div>
  );
}
