import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificationAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Trophy, Crown, Star, Zap, Medal, TrendingUp, Award, Loader2 } from 'lucide-react';

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
const RANK_ICONS = [Crown, Medal, Award];

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lb, profile] = await Promise.all([
          gamificationAPI.getLeaderboard(20),
          gamificationAPI.getProfile()
        ]);
        setLeaderboard(lb);
        setMyProfile(profile);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const myRank = leaderboard.findIndex(e => e.userId === user?._id) + 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">See how you stack up against other students</p>
      </motion.div>

      {/* My Stats Card */}
      {myProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Star className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-2xl font-bold text-foreground">#{myRank || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-xl font-bold text-foreground">{myProfile.level}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-xl font-bold text-primary">{myProfile.total_xp?.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tasks Done</p>
                <p className="text-xl font-bold text-foreground">{myProfile.stats?.tasksCompleted || 0}</p>
              </div>
            </div>
            {/* XP Progress to next level */}
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Level {myProfile.level}</span>
                <span>{myProfile.total_xp % 100}/100 XP</span>
                <span>Level {myProfile.level + 1}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${myProfile.total_xp % 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Achievements Section */}
      {myProfile?.achievements && myProfile.achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Your Achievements
          </h2>
          <div className="flex flex-wrap gap-3">
            {myProfile.achievements.map((ach) => (
              <div
                key={ach.id}
                className="px-4 py-2 rounded-xl bg-card border border-border flex items-center gap-2 text-sm"
                title={ach.description}
              >
                <span className="text-lg">{ach.icon}</span>
                <span className="font-medium text-foreground">{ach.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">XP</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Courses</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isMe = entry.userId === user?._id;
                const RankIcon = RANK_ICONS[idx] || TrendingUp;
                const rankColor = RANK_COLORS[idx] || 'text-muted-foreground';

                return (
                  <motion.tr
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className={`border-b border-border/50 transition-colors ${
                      isMe ? 'bg-primary/10' : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <RankIcon className={`w-5 h-5 ${rankColor}`} />
                        <span className={`font-bold ${rankColor}`}>#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {entry.userId?.slice(-2).toUpperCase()}
                        </div>
                        <span className={`font-medium ${isMe ? 'text-primary' : 'text-foreground'}`}>
                          {isMe ? 'You' : `Student ${entry.userId?.slice(-4)}`}
                        </span>
                        {isMe && <Zap className="w-4 h-4 text-primary" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                        <Star className="w-3 h-3" /> {entry.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-foreground">
                      {entry.totalXp?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {entry.stats?.tasksCompleted || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {entry.stats?.coursesUploaded || 0}
                    </td>
                  </motion.tr>
                );
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No players yet. Be the first to earn XP!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
