import React, { useState, useEffect } from 'react';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { availabilityAPI } from '../services/api';
import './Calendar.css';

const Calendar = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await availabilityAPI.get();
      setAvailability(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load your schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlot = async (slotData) => {
    try {
      const newSlot = await availabilityAPI.save(slotData);
      setAvailability([...availability, newSlot]);
      showSuccess('Time slot blocked successfully! ✅');
    } catch (err) {
      console.error('Error saving slot:', err);
      setError('Failed to save time slot. Please try again.');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await availabilityAPI.delete(slotId);
      setAvailability(availability.filter(slot => slot._id !== slotId));
      showSuccess('Time slot removed successfully! 🗑️');
    } catch (err) {
      console.error('Error deleting slot:', err);
      setError('Failed to delete time slot. Please try again.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire schedule?')) {
      return;
    }

    try {
      // Delete all slots
      await Promise.all(availability.map(slot => availabilityAPI.delete(slot._id)));
      setAvailability([]);
      showSuccess('Schedule cleared successfully! 🧹');
    } catch (err) {
      console.error('Error clearing schedule:', err);
      setError('Failed to clear schedule. Please try again.');
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getFreeHours = () => {
    const totalHours = 7 * 14; // 7 days * 14 hours (7 AM to 9 PM)
    const blockedHours = availability.reduce((sum, slot) => {
      const start = parseInt(slot.start_time.split(':')[0]);
      const end = parseInt(slot.end_time.split(':')[0]);
      return sum + (end - start);
    }, 0);
    return totalHours - blockedHours;
  };

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <div className="calendar-header-section">
          <div className="header-content">
            <h1 className="page-title">📅 Weekly Schedule</h1>
            <p className="page-subtitle">
              Block your busy times (classes, work, commitments) and let the AI schedule your study sessions in free slots.
            </p>
          </div>

          <div className="stats-panel">
            <div className="stat-card">
              <div className="stat-value">{availability.length}</div>
              <div className="stat-label">Blocked Slots</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{getFreeHours()}h</div>
              <div className="stat-label">Free Time/Week</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your schedule...</p>
          </div>
        ) : (
          <>
            <WeeklyCalendar
              availability={availability}
              onSave={handleSaveSlot}
              onDelete={handleDeleteSlot}
            />

            <div className="calendar-actions">
              <button className="btn-secondary" onClick={fetchAvailability}>
                🔄 Refresh
              </button>
              <button className="btn-danger" onClick={handleClearAll}>
                🗑️ Clear All
              </button>
            </div>

            <div className="info-panel">
              <h3>💡 How It Works</h3>
              <ol>
                <li><strong>Click time slots</strong> to block your busy times (classes, work, etc.)</li>
                <li><strong>Label each block</strong> so you know what's scheduled</li>
                <li><strong>The AI scheduler</strong> will automatically fill your free time with study sessions</li>
                <li><strong>Update anytime</strong> - your schedule adapts automatically</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Calendar;
