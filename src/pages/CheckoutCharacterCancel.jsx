import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function CheckoutCharacterCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1923] text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-[#ffffff12] bg-[#1a2633] p-8 text-center">
        <XCircle
          className="mx-auto mb-4 text-[var(--accent-color-dynamic)]"
          size={52}
        />
        <h1 className="text-2xl font-bold mb-2">Purchase canceled</h1>
        <p className="text-gray-400 mb-6">
          No charges were applied. You can continue unlocking characters through
          progression or retry checkout anytime.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 rounded-lg bg-[var(--accent-color-dynamic)] hover:bg-[var(--accent-color-dynamic-hover)] transition-colors"
          >
            Back to profile
          </button>
          <button
            onClick={() => navigate("/session-setup")}
            className="px-4 py-2 rounded-lg border border-[#ffffff20] hover:bg-[#ffffff0a] transition-colors"
          >
            Go to session setup
          </button>
        </div>
      </div>
    </div>
  );
}
