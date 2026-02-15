import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { profileAPI, tasksAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, tasksRes] = await Promise.all([
        profileAPI.get(),
        tasksAPI.getAll({ status: 'todo' })
      ]);

      setProfile(profileRes.data.profile);
      setTasks(tasksRes.data.tasks || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground text-xl font-bold tracking-wider">LOADING...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Content wrapper */}
      <div className="relative z-10 pt-24 pb-12">
        {/* Header with theme-aware design */}
        <div className="mb-8 border-b border-border/40 bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-5xl font-bold tracking-wider text-foreground uppercase">
                    <span className="text-primary">//</span> DASHBOARD
                  </h1>
                  <p className="text-muted-foreground mt-2 text-lg">
                    Welcome back, <span className="text-primary font-semibold">{user?.name}</span>
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-primary text-primary-foreground hover:brightness-110 transition-all duration-300 font-bold tracking-wider transform hover:scale-105 shadow-lg shadow-primary/20"
                >
                  LOGOUT
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive text-destructive font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="STUDY TIME"
              value={`${Math.floor((profile?.stats?.totalStudyTime || 0) / 60)}H`}
              subtitle={`${(profile?.stats?.totalStudyTime || 0) % 60}M`}
              icon="⏱"
            />
            <StatCard
              title="TASKS DONE"
              value={profile?.stats?.completedTasks || 0}
              subtitle="COMPLETED"
              icon="✓"
            />
            <StatCard
              title="STREAK"
              value={`${profile?.stats?.currentStreak || 0}`}
              subtitle="DAYS"
              icon="🔥"
            />
            <StatCard
              title="PENDING"
              value={tasks.length}
              subtitle="TASKS"
              icon="📋"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Tasks */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="card-valorant p-6 relative overflow-hidden bg-card/80 backdrop-blur-md">
                <div className="card-inner-sheen" />
                {/* Valorant corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-primary opacity-50"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="text-2xl font-bold tracking-wider text-foreground">
                    <span className="text-primary">//</span> PENDING TASKS
                  </h2>
                  <Link
                    to="/tasks"
                    className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors text-sm font-bold tracking-wider border border-border text-foreground"
                  >
                    VIEW ALL
                  </Link>
                </div>

                <div className="space-y-3 relative z-10">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-xl mb-2">NO PENDING TASKS</p>
                      <Link
                        to="/tasks"
                        className="text-primary hover:underline font-semibold"
                      >
                        Create your first task →
                      </Link>
                    </div>
                  ) : (
                    tasks.slice(0, 5).map((task, index) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-background/50 border-l-4 border-primary p-4 hover:bg-accent/50 transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 text-foreground group-hover:text-primary transition-colors">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-muted-foreground text-sm mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs">
                              <span className={`px-2 py-1 rounded ${
                                task.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                                'bg-green-500/10 text-green-500'
                              }`}>
                                {task.priority?.toUpperCase() || 'NORMAL'}
                              </span>
                              {task.estimatedTime && (
                                <span className="text-muted-foreground">
                                  ⏱ {task.estimatedTime}min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions & Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <div className="card-valorant p-6 relative overflow-hidden bg-card/80 backdrop-blur-md">
                <div className="card-inner-sheen" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent"></div>
                
                <h2 className="text-xl font-bold tracking-wider mb-4 text-foreground relative z-10">
                  <span className="text-primary">//</span> PROFILE
                </h2>
                
                <div className="space-y-3 text-sm relative z-10">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">EMAIL</span>
                    <span className="font-semibold text-xs text-foreground">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">ROLE</span>
                    <span className={`font-bold ${user?.role === 'admin' ? 'text-primary' : 'text-green-500'}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">THEME</span>
                    <span className="font-semibold text-foreground">{profile?.preferences?.theme?.toUpperCase() || 'DARK'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">STUDY TIME</span>
                    <span className="font-semibold text-foreground">{profile?.preferences?.studyTime?.toUpperCase() || 'EVENING'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card-valorant p-6 relative overflow-hidden bg-card/80 backdrop-blur-md">
                <div className="card-inner-sheen" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent"></div>
                
                <h2 className="text-xl font-bold tracking-wider mb-4 text-foreground relative z-10">
                  <span className="text-primary">//</span> QUICK ACTIONS
                </h2>
                
                <div className="space-y-3 relative z-10">
                  <Link
                    to="/tasks"
                    className="block px-4 py-3 bg-muted/30 hover:bg-primary transition-all duration-300 font-bold tracking-wider text-center border border-border hover:border-primary text-foreground hover:text-white group"
                  >
                    <span className="group-hover:scale-110 inline-block transition-transform mr-2">➕</span> CREATE TASK
                  </Link>
                  <Link
                    to="/sessions"
                    className="block px-4 py-3 bg-muted/30 hover:bg-primary transition-all duration-300 font-bold tracking-wider text-center border border-border hover:border-primary text-foreground hover:text-white group"
                  >
                    <span className="group-hover:scale-110 inline-block transition-transform mr-2">📚</span> RESUME SESSION
                  </Link>
                  <Link
                    to="/lobby"
                    className="block px-4 py-3 bg-[#ff4655] text-white hover:brightness-110 transition-all duration-300 font-bold tracking-wider text-center shadow-lg group"
                  >
                    <span className="group-hover:scale-110 inline-block transition-transform mr-2">🚀</span> PLAY (STUDY)
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Theme-aware StatCard
const StatCard = ({ title, value, subtitle, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card-valorant p-6 relative overflow-hidden group border border-border hover:border-primary transition-all duration-300 bg-card/80 backdrop-blur-md"
    >
      <div className="card-inner-sheen" />
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-border group-hover:border-primary transition-colors"></div>
      
      {/* Icon */}
      <div className="text-4xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity text-foreground">
        {icon}
      </div>
      
      {/* Stats */}
      <div className="text-3xl font-bold text-foreground mb-1 tracking-wider relative z-10">
        {value}
      </div>
      <div className="text-sm text-muted-foreground font-semibold tracking-wider relative z-10">
        {subtitle || title}
      </div>
      
      {/* Title */}
      <div className="absolute top-3 right-3 text-xs text-muted-foreground font-bold tracking-wider">
        {title}
      </div>
      
      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

export default Dashboard;
