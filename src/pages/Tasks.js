import React from 'react';
import './Tasks.css';

function Tasks() {
  return (
    <div className="tasks">
      <div className="tasks-header">
        <h1>Tasks</h1>
        <button className="btn btn-primary">+ New Task</button>
      </div>

      <div className="tasks-list">
        <div className="empty-state">
          <p>📝 No tasks yet. Create your first task to get started!</p>
        </div>
      </div>
    </div>
  );
}

export default Tasks;
