function TaskItem({ task, isActive, onSelect, onToggleComplete, onDelete }) {
  return (
    <div className={`task-item ${isActive ? 'active' : ''} ${task.completed ? 'completed' : ''}`}>
      {/* Checkbox for completion */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggleComplete}
        className="task-checkbox"
      />

      {/* Task content - clicking selects for Pomodoro */}
      <div className="task-content" onClick={onSelect}>
        <h3 className="task-title">{task.title}</h3>
        <div className="task-meta">
          {task.pomodoroCount > 0 && (
            <span className="pomodoro-badge">
              🍅 × {task.pomodoroCount}
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="delete-button"
        aria-label="Delete task"
      >
        🗑️
      </button>
    </div>
  );
}

export default TaskItem;
