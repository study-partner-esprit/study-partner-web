import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { characterAPI } from "@/services/api";

export default function CheckoutCharacterSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasedCharacterName, setPurchasedCharacterName] = useState("");

  useEffect(() => {
    const confirmPurchase = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          setError("Missing checkout session id.");
          return;
        }

        const result = await characterAPI.confirmCharacterPurchase(sessionId);
        const purchaseName =
          result?.data?.purchase?.character_id?.name ||
          result?.data?.purchase?.metadata?.metadata?.characterName ||
          "Character";

        setPurchasedCharacterName(purchaseName);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to confirm character purchase.",
        );
      } finally {
        setLoading(false);
      }
    };

    confirmPurchase();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1923] text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-[#ffffff12] bg-[#1a2633] p-8 text-center">
        <CheckCircle2
          className="mx-auto mb-4 text-[var(--accent-color-dynamic)]"
          size={52}
        />
        <h1 className="text-2xl font-bold mb-2">
          Character purchase successful
        </h1>
        <p className="text-gray-400 mb-6">
          {purchasedCharacterName
            ? `${purchasedCharacterName} is now in your owned characters list.`
            : "Your new character is now unlocked and ready to use in lobby."}
        </p>

        {loading && (
          <p className="text-sm text-gray-500 mb-4">Finalizing purchase...</p>
        )}

        {error && (
          <p className="text-sm text-[var(--accent-color-dynamic)] mb-4">
            {error}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 rounded-lg bg-[var(--accent-color-dynamic)] hover:bg-[var(--accent-color-dynamic-hover)] transition-colors"
          >
            Go to profile
          </button>
          <button
            onClick={() => navigate("/session-setup")}
            className="px-4 py-2 rounded-lg border border-[#ffffff20] hover:bg-[#ffffff0a] transition-colors"
          >
            Choose in session
          </button>
        </div>
      </div>
    </div>
  );
}
