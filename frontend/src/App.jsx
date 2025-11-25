import { useState, useEffect } from 'react';
import './App.css';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks';

function App() {
  // State management
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks from database on mount
  useEffect(() => {
    loadTasks();
  }, []);

  /**
   * Fetch all tasks from backend
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new task
   */
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      // 1. Save to database via backend
      const newTask = await createTask({ title: newTaskTitle });
      
      // 2. Update React state (add to beginning of list)
      setTasks([newTask, ...tasks]);
      
      // 3. Clear input
      setNewTaskTitle('');
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to add task');
    }
  };

  /**
   * Toggle task completion
   */
  const handleToggleComplete = async (taskId) => {
    try {
      // Find the task to get current completion status
      const task = tasks.find(t => t._id === taskId);
      
      // 1. Update in database
      const updatedTask = await updateTask(taskId, { 
        completed: !task.completed 
      });
      
      // 2. Update in React state
      setTasks(tasks.map(t => 
        t._id === taskId ? updatedTask : t
      ));
    } catch (err) {
      console.error('Error toggling task:', err);
      setError('Failed to update task');
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async (taskId) => {
    try {
      // 1. Delete from database
      await deleteTask(taskId);
      
      // 2. Remove from React state
      setTasks(tasks.filter(t => t._id !== taskId));
      
      // 3. Clear active task if it was deleted
      if (activeTask?._id === taskId) {
        setActiveTask(null);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  /**
   * Select a task to work on with Pomodoro
   */
  const handleSelectTask = (task) => {
    setActiveTask(task);
  };

  /**
   * When a Pomodoro completes, increment the task's count
   */
  const handlePomodoroComplete = async () => {
    if (!activeTask) return;

    try {
      // 1. Update in database (increment pomodoroCount)
      const updatedTask = await updateTask(activeTask._id, {
        pomodoroCount: activeTask.pomodoroCount + 1
      });
      
      // 2. Update in React state
      setTasks(tasks.map(t => 
        t._id === activeTask._id ? updatedTask : t
      ));
      
      // 3. Update active task reference
      setActiveTask(updatedTask);
    } catch (err) {
      console.error('Error updating Pomodoro count:', err);
      setError('Failed to update Pomodoro count');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>🍅 FocusTools</h1>
        <p>Pomodoro Timer + Task Manager</p>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="main-content">
        {/* Left side: Task List */}
        <div className="task-section">
          <h2>Tasks</h2>
          
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="add-task-form">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What do you need to focus on?"
              className="task-input"
            />
            <button type="submit" className="add-button">
              Add Task
            </button>
          </form>

          {/* Task List */}
          <TaskList
            tasks={tasks}
            activeTask={activeTask}
            onSelectTask={handleSelectTask}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        {/* Right side: Pomodoro Timer */}
        <div className="timer-section">
          <h2>Focus Time</h2>
          {activeTask ? (
            <>
              <div className="active-task-display">
                <p>Working on:</p>
                <h3>{activeTask.title}</h3>
                <p className="pomodoro-count">
                  🍅 {activeTask.pomodoroCount} Pomodoro{activeTask.pomodoroCount !== 1 ? 's' : ''} completed
                </p>
              </div>
              <PomodoroTimer
                onComplete={handlePomodoroComplete}
              />
            </>
          ) : (
            <div className="no-task-selected">
              <p>← Select a task to start focusing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
