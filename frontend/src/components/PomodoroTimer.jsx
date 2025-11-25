import { useState, useEffect, useRef } from 'react';

function PomodoroTimer({ onComplete }) {
  const WORK_TIME = 1 * 60; // 25 minutes in seconds
  const BREAK_TIME = 5 * 60;  // 5 minutes in seconds

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      // Work session completed - notify parent
      onComplete();
      alert('🎉 Pomodoro complete! Take a break.');
      // Switch to break
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
    } else {
      // Break completed
      alert('Break over! Ready for another Pomodoro?');
      setIsBreak(false);
      setTimeLeft(WORK_TIME);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_TIME);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`pomodoro-timer ${isBreak ? 'break-mode' : 'work-mode'}`}>
      <div className="timer-mode">
        {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
      </div>
      
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>

      <div className="timer-controls">
        <button onClick={toggleTimer} className="control-button primary">
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer} className="control-button secondary">
          Reset
        </button>
      </div>

      <div className="timer-progress">
        <div 
          className="progress-bar"
          style={{
            width: `${((isBreak ? BREAK_TIME : WORK_TIME) - timeLeft) / (isBreak ? BREAK_TIME : WORK_TIME) * 100}%`
          }}
        />
      </div>
    </div>
  );
}

export default PomodoroTimer;
