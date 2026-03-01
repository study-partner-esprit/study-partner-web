import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Lock, Sparkles, X } from "lucide-react";

/**
 * Modal overlay that appears when a user attempts to access a tier-gated feature.
 * Listens for the custom 'tier-upgrade-required' event dispatched from the API interceptor.
 * Can also be triggered manually via the `show` prop.
 */
export default function UpgradePrompt({ show: showProp, onClose: onCloseProp }) {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState(null);
  const navigate = useNavigate();
  const tier = useAuthStore((s) => s.getTier());

  useEffect(() => {
    const handler = (e) => {
      setDetail(e.detail);
      setVisible(true);
    };
    window.addEventListener("tier-upgrade-required", handler);
    return () => window.removeEventListener("tier-upgrade-required", handler);
  }, []);

  // Allow parent-controlled visibility
  useEffect(() => {
    if (showProp !== undefined) setVisible(showProp);
  }, [showProp]);

  const close = () => {
    setVisible(false);
    setDetail(null);
    onCloseProp?.();
  };

  const tierLabel = {
    normal: "Free",
    vip: "VIP",
    vip_plus: "VIP+",
    trial: "Trial",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 rounded-2xl bg-gray-900 border border-purple-500/30 p-8 text-center shadow-2xl"
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-purple-500/20 p-4">
                <Lock className="text-purple-400" size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {detail?.code === "TRIAL_EXPIRED"
                ? "Your Trial Has Expired"
                : "Upgrade Required"}
            </h2>

            <p className="text-gray-400 mb-6">
              {detail?.code === "TRIAL_EXPIRED" ? (
                <>Your 15-day free trial has ended. Upgrade to continue using AI-powered features.</>
              ) : (
                <>
                  This feature requires{" "}
                  <span className="text-purple-300 font-semibold">
                    {detail?.requiredTier
                      ? Array.isArray(detail.requiredTier)
                        ? detail.requiredTier.map((t) => tierLabel[t] || t).join(" or ")
                        : tierLabel[detail.requiredTier] || detail.requiredTier
                      : "a higher plan"}
                  </span>
                  . You&apos;re currently on the{" "}
                  <span className="text-white font-semibold">
                    {tierLabel[tier] || tier}
                  </span>{" "}
                  plan.
                </>
              )}
            </p>

            <button
              onClick={() => {
                close();
                navigate("/pricing");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 transition-all shadow-lg hover:shadow-purple-500/25"
            >
              <Sparkles size={18} />
              View Plans &amp; Upgrade
            </button>

            <button
              onClick={close}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-300 transition"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
