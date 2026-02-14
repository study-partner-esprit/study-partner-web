import React, { useState, useEffect } from 'react';
import './WeeklyCalendar.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

const WeeklyCalendar = ({ availability = [], onSave, onDelete }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [label, setLabel] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);

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
  }, [availability]);

  const handleSlotClick = (day, hour) => {
    // Check if slot is already blocked
    const existingSlot = selectedSlots.find(
      slot => slot.day === day && hour >= slot.startHour && hour < slot.endHour
    );

    if (existingSlot) {
      // Open modal to delete
      setModalData({ type: 'delete', slot: existingSlot });
      setShowModal(true);
    } else {
      // Start new selection
      setModalData({ type: 'create', day, hour });
      setShowModal(true);
    }
  };

  const handleCreateSlot = () => {
    if (!label.trim()) {
      alert('Please enter a label for this time slot');
      return;
    }

    const { day, hour } = modalData;
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

  const isSlotBlocked = (day, hour) => {
    return selectedSlots.some(
      slot => slot.day === day && hour >= slot.startHour && hour < slot.endHour
    );
  };

  const getSlotStyle = (day, hour) => {
    const slot = selectedSlots.find(
      slot => slot.day === day && hour >= slot.startHour && hour < slot.endHour
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

  const getSlotLabel = (day, hour) => {
    const slot = selectedSlots.find(
      slot => slot.day === day && hour === slot.startHour
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

        {/* Day columns */}
        {DAYS.map(day => (
          <div key={day} className="day-column">
            <div className="day-header">{day}</div>
            {HOURS.map(hour => (
              <div
                key={`${day}-${hour}`}
                className={`time-slot ${isSlotBlocked(day, hour) ? 'blocked' : ''}`}
                style={getSlotStyle(day, hour)}
                onClick={() => handleSlotClick(day, hour)}
              >
                {getSlotLabel(day, hour)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Modal for creating/deleting slots */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalData.type === 'create' ? (
              <>
                <h3>Block Time Slot</h3>
                <p>
                  <strong>{modalData.day}</strong> at{' '}
                  <strong>
                    {modalData.hour === 12
                      ? '12 PM'
                      : modalData.hour > 12
                      ? `${modalData.hour - 12} PM`
                      : `${modalData.hour} AM`}
                  </strong>
                </p>
                <div className="form-group">
                  <label>What's happening during this time?</label>
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
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;
