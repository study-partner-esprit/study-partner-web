import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import './StudyPlanner.css';

const StudyPlanner = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState('');
  const [availableTime, setAvailableTime] = useState(120);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [creating, setCreating] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user?._id) {
      console.warn('User ID not available, skipping course load');
      return;
    }
    try {
      const response = await aiAPI.listCourses(user._id);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!goal || availableTime < 30) {
      setError('Please provide a valid goal and at least 30 minutes of study time');
      return;
    }

    setCreating(true);
    setError(null);
    setStudyPlan(null);

    try {
      const response = await aiAPI.createStudyPlan({
        user_id: user._id,
        goal: goal,
        available_time_minutes: parseInt(availableTime),
        course_id: selectedCourse || null,
        start_date: new Date().toISOString()
      });

      setStudyPlan(response.data.plan);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create study plan');
    } finally {
      setCreating(false);
    }
  };

  const startStudySession = () => {
    if (studyPlan) {
      navigate('/study-session');
    }
  };

  return (
    <div className="study-planner-container">
      <h1>AI Study Planner</h1>
      <p className="subtitle">Create a personalized study plan powered by AI</p>

      <div className="planner-form-section">
        <form onSubmit={handleSubmit} className="planner-form">
          <div className="form-group">
            <label htmlFor="goal">Learning Goal</label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Master linear transformations and eigenvalues in Linear Algebra"
              rows="3"
              disabled={creating}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="time">Available Time (minutes)</label>
              <input
                id="time"
                type="number"
                min="30"
                max="480"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label htmlFor="course">Course (Optional)</label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={creating}
              >
                <option value="">No specific course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={creating} className="create-plan-btn">
            {creating ? 'Creating Plan...' : 'Generate Study Plan'}
          </button>
        </form>

        {error && (
          <div className="error-message">{error}</div>
        )}
      </div>

      {studyPlan && (
        <div className="study-plan-result">
          <h2>Your Personalized Study Plan</h2>
          
          <div className="plan-summary">
            <div className="summary-card">
              <span className="summary-label">Total Tasks</span>
              <span className="summary-value">
                {studyPlan.task_graph?.atomic_tasks?.length || 0}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Estimated Time</span>
              <span className="summary-value">
                {studyPlan.task_graph?.total_estimated_minutes || 0} min
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Difficulty</span>
              <span className="summary-value">
                {studyPlan.task_graph?.difficulty_rating || 'N/A'}
              </span>
            </div>
          </div>

          <div className="tasks-list">
            <h3>Study Tasks</h3>
            {studyPlan.task_graph?.atomic_tasks?.map((task, idx) => (
              <div key={task.id || idx} className="task-card">
                <div className="task-header">
                  <span className="task-number">{idx + 1}</span>
                  <h4>{task.title}</h4>
                  <span className="task-duration">{task.estimated_minutes} min</span>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-meta">
                  <span className="task-difficulty">
                    Difficulty: {(task.difficulty * 10).toFixed(1)}/10
                  </span>
                  {task.prerequisites && task.prerequisites.length > 0 && (
                    <span className="task-prereqs">
                      Prerequisites: {task.prerequisites.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={startStudySession} className="start-session-btn">
            Start Study Session
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
