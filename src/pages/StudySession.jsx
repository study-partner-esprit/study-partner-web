import { useState, useEffect, useRef } from "react";
import {
  aiAPI,
  notificationAPI,
  focusAPI,
  sessionsAPI,
  gamificationAPI,
} from "../services/api";
import { useAuthStore } from "../store/authStore";
import WebcamCapture from "../components/WebcamCapture";
import "./StudySession.css";

const StudySession = () => {
  const user = useAuthStore((state) => state.user);

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [ignoredCount, setIgnoredCount] = useState(0);

  // Session ID refs (persist across renders without triggering re-renders)
  const studySessionIdRef = useRef(null);
  const focusSessionIdRef = useRef(null);

  // Break detection state
  const [breakCount, setBreakCount] = useState(0);
  const [currentBreakDuration, setCurrentBreakDuration] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [lastBreakNotification, setLastBreakNotification] = useState(0);

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

  // Handle frame capture from webcam
  const handleFrameCapture = async (frameBlob) => {
    if (!sessionActive || !user?._id) return;

    try {
      const formData = new FormData();
      formData.append("user_id", user._id);
      formData.append("frame", frameBlob, "frame.jpg");

      const response = await aiAPI.analyzeFrame(formData);
      const analysis = response.data;

      // Update signals state
      setSignals({
        timestamp: analysis.timestamp,
        focus: analysis.focus,
        fatigue: analysis.fatigue,
      });

      // Add to history
      setSignalHistory((prev) => [
        ...prev.slice(-50),
        {
          timestamp: new Date(analysis.timestamp),
          focus: analysis.focus.score,
          fatigue: analysis.fatigue.score,
        },
      ]);

      // Record focus data point in the FocusSession (signal-processing service)
      if (focusSessionIdRef.current) {
        try {
          await focusAPI.addDataPoint(focusSessionIdRef.current, {
            focusLevel: Math.round(analysis.focus.score * 100),
            isDistracted: analysis.focus.score < 0.4,
            gazeData: { x: 0, y: 0 },
          });
        } catch (err) {
          // Silent fail — don't interrupt the session for a data point
        }
      }

      // Break detection logic
      const isDistracted = analysis.focus.score < 0.3; // Low focus indicates distraction
      const breakThreshold = 30; // 30 seconds of continuous distraction
      const notificationCooldown = 300; // 5 minutes between break notifications

      if (isDistracted) {
        setCurrentBreakDuration((prev) => {
          const newDuration = prev + 10; // 10 seconds (polling interval)

          // Check if this constitutes a break
          if (newDuration >= breakThreshold && !isOnBreak) {
            setIsOnBreak(true);
            setBreakCount((prev) => prev + 1);

            // Send break notification if enough time has passed since last notification
            const now = Date.now();
            if (now - lastBreakNotification > notificationCooldown * 1000) {
              // Create break notification
              createBreakNotification();
              setLastBreakNotification(now);
            }
          }

          return newDuration;
        });
      } else {
        // Reset break detection if user is focused again
        if (isOnBreak) {
          setIsOnBreak(false);
          // Optionally notify user that break has ended
        }
        setCurrentBreakDuration(0);
      }
    } catch (error) {
      console.error("Failed to analyze frame:", error);
    }
  };

  // Create break notification
  const createBreakNotification = async () => {
    if (!user?._id) return;

    try {
      await notificationAPI.create({
        userId: user._id,
        type: "break_suggestion",
        title: "Break Detected",
        message: `You've been distracted for ${Math.round(currentBreakDuration)} seconds. Consider taking a short break to recharge.`,
        priority: "normal",
        metadata: {
          breakDuration: currentBreakDuration,
          sessionDuration: sessionDuration,
          breakCount: breakCount + 1,
        },
      });
    } catch (error) {
      console.error("Failed to create break notification:", error);
    }
  };

  // Start/stop session
  const toggleSession = () => {
    if (sessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const startSession = async () => {
    setSessionActive(true);
    setSessionDuration(0);
    setIgnoredCount(0);

    // Reset break detection state
    setBreakCount(0);
    setCurrentBreakDuration(0);
    setIsOnBreak(false);
    setLastBreakNotification(0);

    // Create a StudySession record in the backend
    try {
      const sessionRes = await sessionsAPI.create({ status: "active" });
      const session = sessionRes.data?.session || sessionRes.data;
      studySessionIdRef.current = session._id;
      console.log("[StudySession] Created study session:", session._id);
    } catch (err) {
      console.error("[StudySession] Failed to create study session:", err);
    }

    // Start focus tracking session linked to the study session
    try {
      const focusRes = await focusAPI.startSession({
        studySessionId: studySessionIdRef.current,
      });
      focusSessionIdRef.current = focusRes.data?.sessionId;
      console.log(
        "[StudySession] Started focus tracking:",
        focusSessionIdRef.current,
      );
    } catch (err) {
      console.error("[StudySession] Failed to start focus tracking:", err);
    }

    // Start session timer
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
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

  const stopSession = async () => {
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

    // End focus tracking session and get summary
    let focusScore = 0;
    let focusSummary = null;
    if (focusSessionIdRef.current) {
      try {
        const focusEndRes = await focusAPI.endSession(
          focusSessionIdRef.current,
        );
        focusScore = focusEndRes.data?.focusScore || 0;
        focusSummary = focusEndRes.data?.summary;
        console.log(
          "[StudySession] Focus session ended:",
          focusScore,
          focusSummary,
        );
      } catch (err) {
        console.error("[StudySession] Failed to end focus session:", err);
      }
    }

    // End study session record with focus data
    if (studySessionIdRef.current) {
      try {
        await sessionsAPI.update(studySessionIdRef.current, {
          status: "completed",
          duration: sessionDuration,
          focusScore: focusSummary?.avgFocusLevel || focusScore,
          endTime: new Date().toISOString(),
        });
        console.log("[StudySession] Study session ended");
      } catch (err) {
        console.error("[StudySession] Failed to end study session:", err);
      }
    }

    // Award XP for perfect focus session (score > 80)
    if (
      focusScore > 80 ||
      (focusSummary?.avgFocusLevel && focusSummary.avgFocusLevel > 80)
    ) {
      try {
        await gamificationAPI.awardXP({ action: "perfect_focus_session" });
        console.log("[StudySession] Awarded XP for perfect focus session!");
      } catch (err) {
        console.error("[StudySession] Failed to award XP:", err);
      }
    }

    // Clean up refs
    studySessionIdRef.current = null;
    focusSessionIdRef.current = null;
  };

  // Fetch current signals (focus/fatigue)
  const fetchSignals = async () => {
    try {
      const response = await aiAPI.getCurrentSignals(user._id);
      setSignals(response.data);

      // Add to history for charting
      setSignalHistory((prev) => [
        ...prev.slice(-50),
        {
          timestamp: new Date(response.data.timestamp),
          focus: response.data.focus.score,
          fatigue: response.data.fatigue.score,
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch signals:", error);
    }
  };

  // Request coach decision
  const requestCoachDecision = async () => {
    try {
      const response = await aiAPI.getCoachDecision({
        user_id: user._id,
        ignored_count: ignoredCount,
        do_not_disturb: doNotDisturb,
      });

      const decision = response.data.coach_action;
      setCoachDecision(decision);

      // Show coach popup if action is not silence
      if (decision.action_type !== "silence") {
        setCoachVisible(true);
      }
    } catch (error) {
      console.error("Failed to get coach decision:", error);
    }
  };

  // Handle coach actions
  const acceptCoachSuggestion = () => {
    setCoachVisible(false);
    setIgnoredCount(0);

    // Implement the suggestion (e.g., take break)
    if (coachDecision?.action_type === "suggest_break") {
      stopSession();
    }
  };

  const ignoreCoachSuggestion = () => {
    setCoachVisible(false);
    setIgnoredCount((prev) => prev + 1);
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
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get state badge class
  const getStateBadgeClass = (state) => {
    const stateMap = {
      Focused: "badge-success",
      Drifting: "badge-warning",
      Lost: "badge-danger",
      Alert: "badge-success",
      Moderate: "badge-info",
      High: "badge-warning",
      Critical: "badge-danger",
    };
    return stateMap[state] || "badge-default";
  };

  return (
    <div className="study-session-container">
      <h1>Live Study Session</h1>
      <p className="subtitle">
        AI-powered coaching with real-time focus and fatigue monitoring
      </p>

      {/* Session Controls */}
      <div className="session-controls">
        <button
          onClick={toggleSession}
          className={`session-btn ${sessionActive ? "session-active" : ""}`}
        >
          {sessionActive ? "End Session" : "Start Study Session"}
        </button>

        {sessionActive && (
          <div className="session-stats">
            <div className="stat">
              <span className="stat-label">Session Time</span>
              <span className="stat-value">
                {formatDuration(sessionDuration)}
              </span>
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

      {/* Webcam Monitoring */}
      {sessionActive && (
        <div className="webcam-section">
          <h3>📹 Live Monitoring</h3>
          <WebcamCapture
            onFrameCapture={handleFrameCapture}
            captureInterval={3000}
            enabled={sessionActive}
          />
          <p className="webcam-note">
            Your camera is being used to detect focus and fatigue levels. Data
            is processed locally and not stored.
          </p>
        </div>
      )}

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
                <span
                  className={`state-badge ${getStateBadgeClass(signals.focus.state)}`}
                >
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
                <span
                  className={`state-badge ${getStateBadgeClass(signals.fatigue.state)}`}
                >
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

      {/* Break Detection Status */}
      {sessionActive && (
        <div className="signals-dashboard" style={{ marginTop: "16px" }}>
          <div
            className={`signal-card ${isOnBreak ? "fatigue-signal" : "focus-signal"}`}
          >
            <h3>☕ Break Detection</h3>
            <div className="signal-content">
              <div
                className="signal-details"
                style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
              >
                <span
                  className={`state-badge ${isOnBreak ? "badge-danger" : "badge-success"}`}
                >
                  {isOnBreak ? "🔴 On Break" : "🟢 Studying"}
                </span>
                <span className="signal-score">Breaks: {breakCount}</span>
                {isOnBreak && (
                  <span className="signal-confidence">
                    Break duration:{" "}
                    {formatDuration(Math.floor(currentBreakDuration))}
                  </span>
                )}
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
              <button onClick={ignoreCoachSuggestion} className="close-btn">
                ×
              </button>
            </div>

            <div className="coach-body">
              <div className="coach-action-type">
                {coachDecision.action_type.replace("_", " ").toUpperCase()}
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
              <p>
                Detects signs of fatigue to prevent burnout and optimize
                learning
              </p>
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
