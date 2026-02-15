import React, { useState, useEffect } from 'react';
import './WeeklyCalendar.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

const WeeklyCalendar = ({ availability = [], events = [], currentWeekStart, weeksView = 2, onSave, onDelete }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [eventSlots, setEventSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [label, setLabel] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);

  // Generate time slots for the specified number of weeks
  useEffect(() => {
    if (!currentWeekStart) return;

    const slots = [];
    for (let week = 0; week < weeksView; week++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(weekStart.getDate() + (week * 7));

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + dayIndex);

        const dayName = DAYS[dayIndex];
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        for (let hour of HOURS) {
          slots.push({
            week,
            dayIndex,
            dayName,
            date,
            dateStr,
            hour,
            key: `${week}-${dayIndex}-${hour}`
          });
        }
      }
    }
    setTimeSlots(slots);
  }, [currentWeekStart, weeksView]);

  useEffect(() => {
    // Convert availability to selected slots format
    const slots = availability.map(av => ({
      id: av._id,
      day: av.day_of_week,
      startHour: parseInt(av.start_time.split(':')[0]),
      endHour: parseInt(av.end_time.split(':')[0]),
      label: av.label || 'Blocked',
      backgroundColor: av.color || '#ff6b6b'
    }));
    setSelectedSlots(slots);
    // Convert events (scheduled sessions) to calendar slot format
    const evSlots = (events || []).map(ev => {
      const start = new Date(ev.startTime);
      const end = new Date(ev.endTime);
      const dayOfWeek = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-6 Monday-Sunday
      const weekStart = new Date(currentWeekStart);
      const eventDate = new Date(start);
      eventDate.setHours(0, 0, 0, 0);
      weekStart.setHours(0, 0, 0, 0);
      const weekDiff = Math.floor((eventDate - weekStart) / (7 * 24 * 60 * 60 * 1000));
      const week = Math.max(0, weekDiff); // Ensure non-negative

      return {
        id: ev.taskId || ev.id || `${ev.title}-${start.toISOString()}`,
        week,
        dayIndex,
        startHour: start.getHours(),
        endHour: end.getHours(),
        label: ev.title,
        backgroundColor: ev.color || '#2e86de',
        isEvent: true,
        meta: ev
      };
    });
    setEventSlots(evSlots);
  }, [availability, events, currentWeekStart, weeksView]);

  const handleSlotClick = (week, dayIndex, hour) => {
    // If an event (scheduled session) occupies this slot, show event details
    const eventSlot = eventSlots.find(
      slot => slot.week === week && slot.dayIndex === dayIndex && hour >= slot.startHour && hour < slot.endHour
    );
    if (eventSlot) {
      setModalData({ type: 'event', slot: eventSlot });
      setShowModal(true);
      return;
    }

    // Check if an availability slot is already blocked
    const existingSlot = selectedSlots.find(
      slot => slot.day === DAYS[dayIndex] && hour >= slot.startHour && hour < slot.endHour
    );

    if (existingSlot) {
      // Open modal to delete
      setModalData({ type: 'delete', slot: existingSlot });
      setShowModal(true);
    } else {
      // Start new selection
      setModalData({ type: 'create', week, dayIndex, hour });
      setShowModal(true);
    }
  };

  const handleCreateSlot = () => {
    if (!label.trim()) {
      alert('Please enter a label for this time slot');
      return;
    }

    const { dayIndex, hour } = modalData;
    const day = DAYS[dayIndex];
    const endHour = hour + 1; // Default 1-hour slot

    const newSlot = {
      day,
      startHour: hour,
      endHour,
      label: label.trim(),
      backgroundColor: getRandomColor(),
      isRecurring
    };

    // Call parent save handler
    if (onSave) {
      onSave({
        day_of_week: day,
        start_time: `${hour.toString().padStart(2, '0')}:00`,
        end_time: `${endHour.toString().padStart(2, '0')}:00`,
        label: label.trim(),
        is_recurring: isRecurring,
        color: newSlot.backgroundColor
      });
    }

    setSelectedSlots([...selectedSlots, newSlot]);
    closeModal();
  };

  const handleDeleteSlot = () => {
    const { slot } = modalData;
    
    // Call parent delete handler
    if (onDelete && slot.id) {
      onDelete(slot.id);
    }

    setSelectedSlots(selectedSlots.filter(s => s !== slot));
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
    setLabel('');
    setIsRecurring(true);
  };

  const getRandomColor = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const isSlotBlocked = (week, dayIndex, hour) => {
    // Events should show as occupied first
    const eventOccupied = eventSlots.some(
      slot => slot.week === week && slot.dayIndex === dayIndex && hour >= slot.startHour && hour < slot.endHour
    );
    if (eventOccupied) return true;
    return selectedSlots.some(
      slot => slot.day === DAYS[dayIndex] && hour >= slot.startHour && hour < slot.endHour
    );
  };

  const getSlotStyle = (week, dayIndex, hour) => {
    // Events take precedence
    const ev = eventSlots.find(
      slot => slot.week === week && slot.dayIndex === dayIndex && hour >= slot.startHour && hour < slot.endHour
    );
    if (ev) {
      return {
        backgroundColor: ev.backgroundColor,
        color: 'white',
        fontWeight: '700',
        fontSize: '0.8rem',
        textAlign: 'center',
        padding: '6px',
        cursor: 'default'
      };
    }

    const slot = selectedSlots.find(
      slot => slot.day === DAYS[dayIndex] && hour >= slot.startHour && hour < slot.endHour
    );
    if (slot) {
      return {
        backgroundColor: slot.backgroundColor,
        color: 'white',
        fontWeight: '600',
        fontSize: '0.75rem',
        textAlign: 'center',
        padding: '4px',
        cursor: 'pointer'
      };
    }
    return {};
  };

  const getSlotLabel = (week, dayIndex, hour) => {
    const ev = eventSlots.find(slot => slot.week === week && slot.dayIndex === dayIndex && hour === slot.startHour);
    if (ev) return ev.label;
    const slot = selectedSlots.find(
      slot => slot.day === DAYS[dayIndex] && hour === slot.startHour
    );
    return slot ? slot.label : '';
  };

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <div className="calendar-instructions">
          <h3>📅 Set Your Weekly Schedule</h3>
          <p>Click on time slots to block them (classes, work, commitments). The AI will schedule study sessions in your free time.</p>
        </div>
      </div>

      {Array.from({ length: weeksView }, (_, weekIndex) => (
        <div key={weekIndex} className="week-section">
          <div className="week-header">
            Week {weekIndex + 1}: {(() => {
              const weekStart = new Date(currentWeekStart);
              weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            })()}
          </div>

          <div className="calendar-grid">
            {/* Time labels */}
            <div className="time-column">
              <div className="corner-cell">Time</div>
              {HOURS.map(hour => (
                <div key={hour} className="time-cell">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Day columns with dates */}
            {DAYS.map((day, dayIndex) => {
              const date = new Date(currentWeekStart);
              date.setDate(date.getDate() + (weekIndex * 7) + dayIndex);
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div key={`${weekIndex}-${day}`} className="day-column">
                  <div className={`day-header ${isToday ? 'today' : ''}`}>
                    {day}<br/>{dateStr}
                  </div>
                  {HOURS.map(hour => (
                    <div
                      key={`${weekIndex}-${dayIndex}-${hour}`}
                      className={`time-slot ${isSlotBlocked(day, hour) ? 'blocked' : ''} ${eventSlots.some(s => s.week === weekIndex && s.dayIndex === dayIndex && hour >= s.startHour && hour < s.endHour) ? 'event-slot' : ''}`}
                      style={getSlotStyle(weekIndex, dayIndex, hour)}
                      onClick={() => handleSlotClick(weekIndex, dayIndex, hour)}
                      title={eventSlots.find(s => s.week === weekIndex && s.dayIndex === dayIndex && hour === s.startHour)?.meta?.title || undefined}
                    >
                      {getSlotLabel(weekIndex, dayIndex, hour)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal for creating/deleting slots */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalData.type === 'create' ? (
              <>
                <h3>Block This Time</h3>
                <div className="form-group">
                  <label>Label:</label>
                  <input
                    type="text"
                    placeholder="e.g., Math Class, Work, Gym"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                    />
                    Repeat every week
                  </label>
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn-save" onClick={handleCreateSlot}>
                    Block Time
                  </button>
                </div>
              </>
            ) : modalData.type === 'delete' ? (
              <>
                <h3>Delete Time Block</h3>
                <p>
                  Remove <strong>{modalData.slot.label}</strong> on{' '}
                  <strong>{modalData.slot.day}</strong>?
                </p>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn-delete" onClick={handleDeleteSlot}>
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Scheduled Session</h3>
                <p>
                  <strong>{modalData.slot.label}</strong>
                </p>
                <p className="muted">
                  {new Date(modalData.slot.meta.startTime).toLocaleString()} — {new Date(modalData.slot.meta.endTime).toLocaleTimeString()}
                </p>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;
