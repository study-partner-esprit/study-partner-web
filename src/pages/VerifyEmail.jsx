import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authAPI } from "../services/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    authAPI
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified! You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.error || "Verification failed. The link may have expired."
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8 text-center"
      >
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto text-purple-400 animate-spin mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 transition"
            >
              Go to Login
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 transition"
            >
              Go to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
