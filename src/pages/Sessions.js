import React from 'react';
import './Sessions.css';

function Sessions() {
  return (
    <div className="sessions">
      <div className="sessions-header">
        <h1>Study Sessions</h1>
        <button className="btn btn-primary">+ Start Session</button>
      </div>

      <div className="sessions-list">
        <div className="empty-state">
          <p>⏱️ No study sessions yet. Start your first session!</p>
        </div>
      </div>
    </div>
  );
}

export default Sessions;
