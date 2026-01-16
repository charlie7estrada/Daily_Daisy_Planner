import { useState, useEffect } from 'react';
import { createTask, deleteTask } from '../services/taskService';
import TaskItem from './TaskItem';

export default function WeeklyView({ plannerId, tasks, onTasksChange }) {
  const [addingToSlot, setAddingToSlot] = useState(null); // {day: index, hour: hour}
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [showAllHours, setShowAllHours] = useState(() => {
    const saved = localStorage.getItem('weeklyView_showAllHours');
    return saved ? JSON.parse(saved) : false;
  });
  const [startHour, setStartHour] = useState(() => {
    const saved = localStorage.getItem('weeklyView_startHour');
    return saved ? Number(saved) : 8;
  });
  const [endHour, setEndHour] = useState(() => {
    const saved = localStorage.getItem('weeklyView_endHour');
    return saved ? Number(saved) : 20;
  });
  const [weekStart, setWeekStart] = useState(() => {
    // Get the Sunday of the current week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('weeklyView_showAllHours', JSON.stringify(showAllHours));
  }, [showAllHours]);

  useEffect(() => {
    localStorage.setItem('weeklyView_startHour', startHour);
  }, [startHour]);

  useEffect(() => {
    localStorage.setItem('weeklyView_endHour', endHour);
  }, [endHour]);

  // Navigate to previous week
  const previousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStart(newDate);
  };

  // Navigate to next week
  const nextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStart(newDate);
  };

  // Go to current week
  const goToThisWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    setWeekStart(new Date(today.setDate(diff)));
  };

  // Get array of 7 days starting from weekStart
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format date for display (e.g., "Jan 15")
  const formatDayDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format date for tags (YYYY-MM-DD)
  const getDateTag = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `[${year}-${month}-${day}]`;
  };

  // Format week range for header
  const formatWeekRange = () => {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const filteredHours = showAllHours ? hours : hours.filter(h => h >= startHour && h <= endHour);

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatHourShort = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  const getTasksForSlot = (date, hour) => {
    const dateTag = getDateTag(date);
    const hourTag = `[${formatHourShort(hour)}]`;
    const combinedTag = `${dateTag}${hourTag}`;
    return tasks.filter(task => task.title.includes(combinedTag));
  };

  const handleAddTask = async (dayIndex, hour) => {
    if (!newTaskTitle.trim()) return;

    const date = weekDays[dayIndex];
    const dateTag = getDateTag(date);
    const hourTag = `[${formatHourShort(hour)}]`;
    const titleWithTags = `${dateTag}${hourTag} ${newTaskTitle}`;

    try {
      await createTask(plannerId, titleWithTags);
      setNewTaskTitle('');
      setAddingToSlot(null);
      onTasksChange();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async () => {
    if (!editTaskText.trim() || !selectedTask) return;

    // Extract the date and hour tags from the original task
    const tagMatch = selectedTask.title.match(/(\[\d{4}-\d{2}-\d{2}\]\[\d{1,2}(AM|PM)\])/);
    const tags = tagMatch ? tagMatch[1] : '';
    const updatedTitle = `${tags} ${editTaskText}`;

    try {
      await deleteTask(selectedTask.id);
      await createTask(plannerId, updatedTitle);
      await onTasksChange();
      setSelectedTask(null);
      setEditTaskText('');
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await deleteTask(selectedTask.id);
      await onTasksChange();
      setSelectedTask(null);
      setEditTaskText('');
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with week navigation */}
      <div style={{ marginBottom: '15px' }}>
        {/* Week Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button
            onClick={previousWeek}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              border: '1px solid var(--lilac-ash)',
              borderRadius: '8px',
              background: 'white'
            }}
          >
            ← Previous
          </button>
          
          <h2 style={{ margin: 0, textAlign: 'center', flex: 1 }}>
            {formatWeekRange()}
          </h2>
          
          <button
            onClick={nextWeek}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              border: '1px solid var(--lilac-ash)',
              borderRadius: '8px',
              background: 'white'
            }}
          >
            Next →
          </button>
        </div>

        {/* Time Range Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={goToThisWeek}
            className="secondary"
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          >
            This Week
          </button>
          
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

      {/* Weekly Calendar Grid */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '2px solid var(--almond-silk)',
        overflow: 'auto'
      }}>
        {/* Day Headers */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px repeat(7, 1fr)',
          borderBottom: '2px solid var(--almond-silk)'
        }}>
          <div style={{ padding: '10px', fontWeight: 'bold', color: 'var(--dusty-grape)' }}>
            Time
          </div>
          {weekDays.map((date, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '10px', 
                textAlign: 'center',
                fontWeight: 'bold',
                color: isToday(date) ? 'var(--space-indigo)' : 'var(--dusty-grape)',
                backgroundColor: isToday(date) ? 'var(--almond-silk)' : 'transparent'
              }}
            >
              <div>{dayNames[index]}</div>
              <div style={{ fontSize: '0.85rem' }}>{formatDayDate(date)}</div>
            </div>
          ))}
        </div>

        {/* Hour Rows */}
        {filteredHours.map((hour, hourIndex) => (
          <div 
            key={hour}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(7, 1fr)',
              borderBottom: hourIndex < filteredHours.length - 1 ? '1px solid #e0e0e0' : 'none',
              minHeight: '60px'
            }}
          >
            {/* Hour Label */}
            <div style={{
              padding: '8px',
              color: 'var(--dusty-grape)',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              borderRight: '1px solid #e0e0e0'
            }}>
              {formatHour(hour)}
            </div>

            {/* Day Cells */}
            {weekDays.map((date, dayIndex) => {
              const slotTasks = getTasksForSlot(date, hour);
              const isAdding = addingToSlot?.day === dayIndex && addingToSlot?.hour === hour;

              return (
                <div
                  key={dayIndex}
                  style={{
                    padding: '4px',
                    borderRight: dayIndex < 6 ? '1px solid #e0e0e0' : 'none',
                    backgroundColor: isToday(date) ? 'rgba(201, 173, 167, 0.1)' : 'transparent',
                    minHeight: '60px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Tasks */}
                  {slotTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setEditTaskText(task.title.replace(/\[\d{4}-\d{2}-\d{2}\]\[\d{1,2}(AM|PM)\]\s*/, ''));
                      }}
                      style={{ 
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      <TaskItem task={task} onUpdate={onTasksChange} compact />
                    </div>
                  ))}

                  {/* Add Task Form or Button */}
                  {isAdding ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask(dayIndex, hour)}
                        placeholder="Task..."
                        autoFocus
                        style={{ 
                          width: '100%', 
                          padding: '4px', 
                          borderRadius: '4px', 
                          border: '1px solid #ccc',
                          fontSize: '0.8rem'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => handleAddTask(dayIndex, hour)}
                          className="primary"
                          style={{ 
                            padding: '2px 8px', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Add
                        </button>
                        <button 
                          onClick={() => {
                            setAddingToSlot(null);
                            setNewTaskTitle('');
                          }}
                          style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToSlot({ day: dayIndex, hour: hour })}
                      style={{ 
                        width: '100%',
                        padding: '2px', 
                        fontSize: '0.75rem', 
                        background: 'transparent',
                        border: '1px dashed var(--almond-silk)',
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        color: 'var(--dusty-grape)',
                        opacity: 0.5
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    {/* Task Edit/Delete Modal */}
      {selectedTask && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => {
            setSelectedTask(null);
            setEditTaskText('');
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h3 style={{ marginBottom: '15px', color: 'var(--space-indigo)' }}>Edit Task</h3>
            
            <textarea
              value={editTaskText}
              onChange={(e) => setEditTaskText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                fontSize: '1rem',
                border: '1px solid var(--lilac-ash)',
                borderRadius: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '20px'
              }}
              autoFocus
            />
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeleteTask}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #d32f2f',
                  color: '#d32f2f',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginRight: 'auto'
                }}
              >
                Delete
              </button>
              
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setEditTaskText('');
                }}
                className="secondary"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleUpdateTask}
                className="primary"
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                disabled={!editTaskText.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}