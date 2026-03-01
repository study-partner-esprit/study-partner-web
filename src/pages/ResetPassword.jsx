import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authAPI } from "../services/api";
import { Lock, CheckCircle, XCircle } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("form"); // form | success | error
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8"
      >
        {status === "success" ? (
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-gray-400 mb-6">
              Your password has been updated. You can now log in.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 transition"
            >
              Go to Login
            </button>
          </div>
        ) : status === "error" && !error ? (
          <div className="text-center">
            <XCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Reset Failed</h2>
            <p className="text-gray-400 mb-6">This link may have expired.</p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 transition"
            >
              Request New Link
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Lock className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Set New Password</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={6}
                className="w-full rounded-xl bg-gray-800 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-purple-500 transition"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-xl bg-gray-800 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-3 transition"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
