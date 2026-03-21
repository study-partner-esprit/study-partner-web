import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { authAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const syncUser = async () => {
      try {
        const response = await authAPI.getMe();
        const user = response.data?.user;
        if (user) {
          useAuthStore.getState().updateUser(user);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Unable to refresh account status.");
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1923] text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-[#ffffff12] bg-[#1a2633] p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 text-green-400" size={52} />
        <h1 className="text-2xl font-bold mb-2">Payment successful</h1>
        <p className="text-gray-400 mb-6">
          Your subscription has been activated. Your new tier is now applied.
        </p>

        {loading && <p className="text-sm text-gray-500 mb-4">Refreshing account status...</p>}
        {error && <p className="text-sm text-red-300 mb-4">{error}</p>}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-lg bg-[#ff4655] hover:bg-[#ff2a3a] transition-colors"
          >
            Go to dashboard
          </button>
          <Link
            to="/pricing"
            className="px-4 py-2 rounded-lg border border-[#ffffff20] hover:bg-[#ffffff0a] transition-colors"
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
