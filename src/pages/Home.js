import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="container">
          <div className="nav-brand">
            <h2>📚 Study Partner</h2>
          </div>
          <div className="nav-links">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <h1>Your AI-Powered Study Companion</h1>
          <p>Enhance your learning with personalized study sessions, intelligent task management, and real-time focus tracking.</p>
          <Link to="/register" className="btn btn-primary btn-large">Start Learning Today</Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Task Management</h3>
              <p>Organize and prioritize your study tasks efficiently</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Study Sessions</h3>
              <p>Track your study time and productivity</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Assistance</h3>
              <p>Get personalized recommendations and insights</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your learning progress over time</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Study Partner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
