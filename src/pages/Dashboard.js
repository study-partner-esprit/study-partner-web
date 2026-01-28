import React from 'react';
import { useAuthStore } from '../store/authStore';
import './Dashboard.css';

function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.email}! 👋</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Study Time</h3>
            <p className="stat-value">0h</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Streak</h3>
            <p className="stat-value">0 days</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h2>Recent Activity</h2>
          <p className="empty-state">No recent activity. Start by creating a task!</p>
        </div>

        <div className="card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="btn btn-primary">Create Task</button>
            <button className="btn btn-secondary">Start Session</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
