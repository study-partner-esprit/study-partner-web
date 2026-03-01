import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authAPI } from "../services/api";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
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
        {sent ? (
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 mb-6">
              If an account exists with that email, we&apos;ve sent a password reset link.
            </p>
            <Link to="/login" className="text-purple-400 hover:text-purple-300 text-sm">
              &larr; Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Mail className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Forgot Password</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl bg-gray-800 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-3 transition"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm transition"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
