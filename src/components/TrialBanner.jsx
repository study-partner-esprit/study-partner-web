import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Clock, Sparkles } from "lucide-react";

/**
 * A persistent banner shown at the top of the page for trial users.
 * Shows the number of days remaining and a CTA to upgrade.
 */
export default function TrialBanner() {
  const navigate = useNavigate();
  const tier = useAuthStore((s) => s.getTier());
  const daysRemaining = useAuthStore((s) => s.getTrialDaysRemaining());
  const isExpired = useAuthStore((s) => s.isTrialExpired());

  if (tier !== "trial") return null;

  const urgent = daysRemaining <= 3;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[90] flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium ${
        isExpired
          ? "bg-red-600/90 text-white"
          : urgent
            ? "bg-amber-500/90 text-black"
            : "bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white"
      } backdrop-blur-sm`}
    >
      <Clock size={16} />
      {isExpired ? (
        <span>Your trial has expired. Upgrade now to keep using AI features.</span>
      ) : (
        <span>
          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left in your free trial
        </span>
      )}
      <button
        onClick={() => navigate("/pricing")}
        className={`ml-2 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
          isExpired || urgent
            ? "bg-white text-black hover:bg-gray-100"
            : "bg-white/20 hover:bg-white/30 text-white"
        }`}
      >
        <Sparkles size={12} />
        Upgrade
      </button>
    </div>
  );
}
