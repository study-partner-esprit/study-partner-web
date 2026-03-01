import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Users, ArrowRight } from "lucide-react";
import useFriendsStore from "../store/friendsStore";

function JoinSessionModal({ onClose, onJoined }) {
  const { joinTeamSession } = useFriendsStore();
  const [inviteCode, setInviteCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async () => {
    if (!inviteCode.trim() || !sessionId.trim()) {
      setError("Both session ID and invite code are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await joinTeamSession(sessionId.trim(), inviteCode.trim());
      onJoined?.(result);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            Join Team Session
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Session ID
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g., A1B2C3"
              maxLength={6}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none font-mono tracking-wider text-center text-lg"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              {error}
            </p>
          )}

          <button
            onClick={handleJoin}
            disabled={loading || !inviteCode.trim() || !sessionId.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
            ) : (
              <>
                Join Session <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default JoinSessionModal;
