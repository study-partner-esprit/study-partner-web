import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import './StudySession.css';

const StudySession = () => {
  const user = useAuthStore((state) => state.user);
  
  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [ignoredCount, setIgnoredCount] = useState(0);
  
  // Signal state
  const [signals, setSignals] = useState(null);
  const [signalHistory, setSignalHistory] = useState([]);
  
  // Coach state
  const [coachDecision, setCoachDecision] = useState(null);
  const [coachVisible, setCoachVisible] = useState(false);
  
  // Timers
  const sessionTimerRef = useRef(null);
  const signalPollingRef = useRef(null);
  const coachPollingRef = useRef(null);

  // Start/stop session
  const toggleSession = () => {
    if (sessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const startSession = () => {
    setSessionActive(true);
    setSessionDuration(0);
    setIgnoredCount(0);
    
    // Start session timer
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    
    // Start polling signals every 10 seconds
    signalPollingRef.current = setInterval(() => {
      fetchSignals();
    }, 10000);
    
    // Start polling coach every 30 seconds
    coachPollingRef.current = setInterval(() => {
      requestCoachDecision();
    }, 30000);
    
    // Initial fetch
    fetchSignals();
    setTimeout(() => requestCoachDecision(), 5000);
  };

  const stopSession = () => {
    setSessionActive(false);
    
    // Clear all timers
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (signalPollingRef.current) {
      clearInterval(signalPollingRef.current);
      signalPollingRef.current = null;
    }
    if (coachPollingRef.current) {
      clearInterval(coachPollingRef.current);
      coachPollingRef.current = null;
    }
  };

  // Fetch current signals (focus/fatigue)
  const fetchSignals = async () => {
    try {
      const response = await aiAPI.getCurrentSignals(user._id);
      setSignals(response.data);
      
      // Add to history for charting
      setSignalHistory(prev => [...prev.slice(-50), {
        timestamp: new Date(response.data.timestamp),
        focus: response.data.focus.score,
        fatigue: response.data.fatigue.score
      }]);
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    }
  };

  // Request coach decision
  const requestCoachDecision = async () => {
    try {
      const response = await aiAPI.getCoachDecision({
        user_id: user._id,
        ignored_count: ignoredCount,
        do_not_disturb: doNotDisturb
      });
      
      const decision = response.data.coach_action;
      setCoachDecision(decision);
      
      // Show coach popup if action is not silence
      if (decision.action_type !== 'silence') {
        setCoachVisible(true);
      }
    } catch (error) {
      console.error('Failed to get coach decision:', error);
    }
  };

  // Handle coach actions
  const acceptCoachSuggestion = () => {
    setCoachVisible(false);
    setIgnoredCount(0);
    
    // Implement the suggestion (e.g., take break)
    if (coachDecision?.action_type === 'suggest_break') {
      stopSession();
    }
  };

  const ignoreCoachSuggestion = () => {
    setCoachVisible(false);
    setIgnoredCount(prev => prev + 1);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (signalPollingRef.current) clearInterval(signalPollingRef.current);
      if (coachPollingRef.current) clearInterval(coachPollingRef.current);
    };
  }, []);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get state badge class
  const getStateBadgeClass = (state) => {
    const stateMap = {
      'Focused': 'badge-success',
      'Drifting': 'badge-warning',
      'Lost': 'badge-danger',
      'Alert': 'badge-success',
      'Moderate': 'badge-info',
      'High': 'badge-warning',
      'Critical': 'badge-danger'
    };
    return stateMap[state] || 'badge-default';
  };

  return (
    <div className="study-session-container">
      <h1>Live Study Session</h1>
      <p className="subtitle">AI-powered coaching with real-time focus and fatigue monitoring</p>

      {/* Session Controls */}
      <div className="session-controls">
        <button 
          onClick={toggleSession} 
          className={`session-btn ${sessionActive ? 'session-active' : ''}`}
        >
          {sessionActive ? 'End Session' : 'Start Study Session'}
        </button>
        
        {sessionActive && (
          <div className="session-stats">
            <div className="stat">
              <span className="stat-label">Session Time</span>
              <span className="stat-value">{formatDuration(sessionDuration)}</span>
            </div>
            <div className="stat">
              <label className="dnd-toggle">
                <input 
                  type="checkbox" 
                  checked={doNotDisturb} 
                  onChange={(e) => setDoNotDisturb(e.target.checked)} 
                />
                Do Not Disturb
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Signal Dashboard */}
      {sessionActive && signals && (
        <div className="signals-dashboard">
          <div className="signal-card focus-signal">
            <h3>Focus State</h3>
            <div className="signal-content">
              <div className="signal-gauge">
                <div 
                  className="gauge-fill focus-gauge" 
                  style={{ width: `${signals.focus.score * 100}%` }}
                ></div>
              </div>
              <div className="signal-details">
                <span className={`state-badge ${getStateBadgeClass(signals.focus.state)}`}>
                  {signals.focus.state}
                </span>
                <span className="signal-score">
                  {(signals.focus.score * 100).toFixed(0)}%
                </span>
                <span className="signal-confidence">
                  Confidence: {(signals.focus.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="signal-card fatigue-signal">
            <h3>Fatigue Level</h3>
            <div className="signal-content">
              <div className="signal-gauge">
                <div 
                  className="gauge-fill fatigue-gauge" 
                  style={{ width: `${signals.fatigue.score * 100}%` }}
                ></div>
              </div>
              <div className="signal-details">
                <span className={`state-badge ${getStateBadgeClass(signals.fatigue.state)}`}>
                  {signals.fatigue.state}
                </span>
                <span className="signal-score">
                  {(signals.fatigue.score * 100).toFixed(0)}%
                </span>
                <span className="signal-confidence">
                  Confidence: {(signals.fatigue.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signal History Chart */}
      {sessionActive && signalHistory.length > 0 && (
        <div className="signal-history">
          <h3>Signal History</h3>
          <div className="history-chart">
            {signalHistory.map((point, idx) => (
              <div key={idx} className="chart-bar">
                <div 
                  className="bar-focus" 
                  style={{ height: `${point.focus * 100}%` }}
                  title={`Focus: ${(point.focus * 100).toFixed(0)}%`}
                ></div>
                <div 
                  className="bar-fatigue" 
                  style={{ height: `${point.fatigue * 100}%` }}
                  title={`Fatigue: ${(point.fatigue * 100).toFixed(0)}%`}
                ></div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color focus-color"></span> Focus
            </span>
            <span className="legend-item">
              <span className="legend-color fatigue-color"></span> Fatigue
            </span>
          </div>
        </div>
      )}

      {/* Coach Popup */}
      {coachVisible && coachDecision && (
        <div className="coach-overlay">
          <div className="coach-popup">
            <div className="coach-header">
              <h3>🤖 AI Coach Recommendation</h3>
              <button onClick={ignoreCoachSuggestion} className="close-btn">×</button>
            </div>
            
            <div className="coach-body">
              <div className="coach-action-type">
                {coachDecision.action_type.replace('_', ' ').toUpperCase()}
              </div>
              
              {coachDecision.message && (
                <p className="coach-message">{coachDecision.message}</p>
              )}
              
              <div className="coach-reasoning">
                <strong>Reasoning:</strong> {coachDecision.reasoning}
              </div>
            </div>
            
            <div className="coach-actions">
              <button onClick={acceptCoachSuggestion} className="accept-btn">
                Accept
              </button>
              <button onClick={ignoreCoachSuggestion} className="ignore-btn">
                Ignore
              </button>
            </div>
            
            {ignoredCount > 0 && (
              <div className="ignored-count">
                You've ignored {ignoredCount} suggestion(s) recently
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Section */}
      {!sessionActive && (
        <div className="session-info">
          <h2>How It Works</h2>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">🎯</span>
              <h4>Focus Detection</h4>
              <p>AI monitors your focus state in real-time using ML models</p>
            </div>
            <div className="info-card">
              <span className="info-icon">😴</span>
              <h4>Fatigue Monitoring</h4>
              <p>Detects signs of fatigue to prevent burnout and optimize learning</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🤖</span>
              <h4>Smart Coaching</h4>
              <p>Personalized recommendations based on your current state</p>
            </div>
            <div className="info-card">
              <span className="info-icon">📅</span>
              <h4>Adaptive Scheduling</h4>
              <p>Automatically adjusts your study plan based on progress</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySession;
