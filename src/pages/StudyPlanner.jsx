import { useState, useEffect } from 'react';
import { studyPlanAPI, courseAPI } from '../services/api';
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
  const [studyPlans, setStudyPlans] = useState([]);
  const [creating, setCreating] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    console.log('StudyPlanner useEffect running, user:', user);
    if (user) {
      loadCourses();
      loadStudyPlans();
    } else {
      console.log('No user, loading study plans anyway for testing');
      loadStudyPlans();
    }
  }, [user]);

  const loadCourses = async () => {
    if (!user?._id) {
      console.warn('User ID not available, skipping course load');
      return;
    }
    try {
      const response = await courseAPI.list();
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadStudyPlans = async () => {
    // Temporarily use hardcoded user ID for testing
    const testUserId = '698e506959e37b6793e748dc';
    try {
      console.log('Loading study plans...');
      const response = await studyPlanAPI.getAll();
      console.log('Study plans response:', response.data);
      setStudyPlans(response.data.plans || []);
      console.log('Study plans set:', response.data.plans || []);
    } catch (error) {
      console.error('Failed to load study plans:', error);
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
    setSchedule(null);

    try {
      const response = await studyPlanAPI.create({
        goal: goal,
        availableTimeMinutes: parseInt(availableTime),
        courseId: selectedCourse || null,
        startDate: new Date().toISOString()
      });

      setStudyPlan(response.data.plan);
      // Reload study plans list
      loadStudyPlans();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create study plan');
    } finally {
      setCreating(false);
    }
  };

  const handleSchedulePlan = async () => {
    if (!studyPlan) return;

    setScheduling(true);
    setError(null);

    try {
      const response = await studyPlanAPI.schedule(studyPlan.id, {
        maxMinutesPerDay: 240, // 4 hours per day
        allowLateNight: false
      });

      setSchedule(response.data.schedule);
      
      // Update plan status
      setStudyPlan(prev => ({ ...prev, status: 'scheduled' }));
      
      alert('Study plan scheduled successfully! Check the Tasks page to see your scheduled tasks.');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to schedule study plan');
    } finally {
      setScheduling(false);
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

      {/* Existing Study Plans Section */}
      {studyPlans.length > 0 && (
        <div className="existing-plans-section">
          <h2>Your Study Plans</h2>
          <div className="plans-list">
            {studyPlans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.goal}</h3>
                  <span className={`status-badge ${plan.status}`}>{plan.status}</span>
                </div>
                <div className="plan-meta">
                  <span>{plan.tasksCount} tasks</span>
                  <span>{plan.totalEstimatedMinutes} min total</span>
                  <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
                {plan.warning && (
                  <div className="plan-warning">{plan.warning}</div>
                )}
                <div className="plan-actions">
                  <button 
                    onClick={() => setStudyPlan(plan)}
                    className="view-plan-btn"
                  >
                    View Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          
          {studyPlan.warning && (
            <div className="warning-message">{studyPlan.warning}</div>
          )}
          
          <div className="plan-summary">
            <div className="summary-card">
              <span className="summary-label">Total Tasks</span>
              <span className="summary-value">
                {studyPlan.tasksCount || 0}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Estimated Time</span>
              <span className="summary-value">
                {studyPlan.totalEstimatedMinutes || 0} min
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Status</span>
              <span className="summary-value">
                {studyPlan.status || 'created'}
              </span>
            </div>
          </div>

          <div className="tasks-list">
            <h3>Study Tasks</h3>
            {studyPlan.taskGraph?.tasks?.map((task, idx) => (
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

          <div className="action-buttons">
            {studyPlan.status === 'created' && (
              <button 
                onClick={handleSchedulePlan} 
                disabled={scheduling}
                className="schedule-plan-btn"
              >
                {scheduling ? 'Scheduling...' : 'Schedule This Plan'}
              </button>
            )}
            
            {studyPlan.status === 'scheduled' && (
              <div className="scheduled-info">
                <p className="success-message">✓ Plan scheduled successfully!</p>
                <button onClick={() => navigate('/tasks')} className="view-tasks-btn">
                  View Tasks
                </button>
              </div>
            )}
          </div>

          {schedule && (
            <div className="schedule-preview">
              <h3>Schedule Preview</h3>
              <p>Your tasks have been scheduled across {schedule.spanDays} days</p>
              <p>Total time: {schedule.totalMinutes} minutes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
