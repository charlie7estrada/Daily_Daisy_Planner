import { useState, useEffect } from 'react';
import { createTask } from '../services/taskService';
import TaskItem from './TaskItem';

export default function DailyView({ plannerId, tasks, onTasksChange }) {
  const [addingToHour, setAddingToHour] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAllHours, setShowAllHours] = useState(() => {
    const saved = localStorage.getItem('dailyView_showAllHours');
    return saved ? JSON.parse(saved) : false;
  });
  const [startHour, setStartHour] = useState(() => {
    const saved = localStorage.getItem('dailyView_startHour');
    return saved ? Number(saved) : 8;
  });
  const [endHour, setEndHour] = useState(() => {
    const saved = localStorage.getItem('dailyView_endHour');
    return saved ? Number(saved) : 20;
  });

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('dailyView_showAllHours', JSON.stringify(showAllHours));
  }, [showAllHours]);

  useEffect(() => {
    localStorage.setItem('dailyView_startHour', startHour);
  }, [startHour]);

  useEffect(() => {
    localStorage.setItem('dailyView_endHour', endHour);
  }, [endHour]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const filteredHours = showAllHours ? hours : hours.filter(h => h >= startHour && h <= endHour);

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getTasksForHour = (hour) => {
    const hourTag = `[${formatHour(hour).replace(':00 ', '')}]`;
    return tasks.filter(task => task.title.includes(hourTag));
  };

  const handleAddTask = async (hour) => {
    if (!newTaskTitle.trim()) return;

    const hourTag = `[${formatHour(hour).replace(':00 ', '')}]`;
    const titleWithHour = `${hourTag} ${newTaskTitle}`;

    try {
      await createTask(plannerId, titleWithHour);
      setNewTaskTitle('');
      setAddingToHour(null);
      onTasksChange();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with date and controls */}
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!showAllHours && (
            <>
              <label style={{ fontSize: '0.9rem' }}>From:</label>
              <select 
                value={startHour} 
                onChange={(e) => setStartHour(Number(e.target.value))}
                style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {hours.map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
              
              <label style={{ fontSize: '0.9rem' }}>To:</label>
              <select 
                value={endHour} 
                onChange={(e) => setEndHour(Number(e.target.value))}
                style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {hours.map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </>
          )}
          
          <button
            onClick={() => setShowAllHours(!showAllHours)}
            style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', whiteSpace: 'nowrap' }}
          >
            {showAllHours ? 'Custom hours' : 'Show all 24'}
          </button>
        </div>
      </div>

      {/* One big notebook-style block */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '2px solid var(--almond-silk)',
        overflow: 'hidden'
      }}>
        {filteredHours.map((hour, index) => (
          <div 
            key={hour}
            style={{
              display: 'flex',
              borderBottom: index < filteredHours.length - 1 ? '1px solid #e0e0e0' : 'none',
              minHeight: '60px',
              padding: '10px 0'
            }}
          >
            {/* Hour label on the left */}
            <div style={{
              width: '100px',
              padding: '10px 15px',
              color: 'var(--dusty-grape)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              {formatHour(hour)}
            </div>

            {/* Tasks and add button */}
            <div style={{ flex: 1, padding: '5px 15px 5px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Existing tasks */}
              {getTasksForHour(hour).map(task => (
                <TaskItem key={task.id} task={task} onUpdate={onTasksChange} />
              ))}

              {/* Add task form or button */}
              {addingToHour === hour ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(hour)}
                    placeholder="Enter task..."
                    autoFocus
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button 
                    onClick={() => handleAddTask(hour)}
                    className="primary"
                    style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                  <button 
                    onClick={() => {
                      setAddingToHour(null);
                      setNewTaskTitle('');
                    }}
                    style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingToHour(hour)}
                  style={{ 
                    alignSelf: 'flex-start',
                    padding: '4px 10px', 
                    fontSize: '0.85rem', 
                    background: 'transparent',
                    border: '1px dashed var(--almond-silk)',
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    color: 'var(--dusty-grape)'
                  }}
                >
                  + Add task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}