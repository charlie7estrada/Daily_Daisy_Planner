import { useState } from 'react';
import { createTask, deleteTask } from '../services/taskService';

export default function MonthlyView({ plannerId, tasks, onTasksChange }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Days of the week for header
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get number of days in the current month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get the day of week the month starts on (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Get month name
  const getMonthName = (month) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month];
  };
  
  // Navigate to previous month
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfWeek = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Create empty cells for days before the month starts
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // Get note for a specific day
  const getNoteForDay = (day) => {
    const dayTag = `[${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}]`;
    return tasks.find(task => task.title.startsWith(dayTag));
  };

  // Handle clicking on a day
  const handleDayClick = (day) => {
    const existingNote = getNoteForDay(day);
    setSelectedDay(day);
    if (existingNote) {
      // Strip the [DayX] tag from the title for editing
      const noteWithoutTag = existingNote.title.replace(/\[\d{4}-\d{2}-\d{2}\]\s*/, '');
      setNoteText(noteWithoutTag);
      setEditingTaskId(existingNote.id);
    } else {
      setNoteText('');
      setEditingTaskId(null);
    }
  };

  // Handle saving note
  const handleSaveNote = async () => {
    if (!noteText.trim()) return;

    const dateTag = `[${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}]`;
    const noteWithTag = `${dateTag} ${noteText}`;

  try {
    if (editingTaskId) {
      // Delete old note and create new one (since we don't have update endpoint)
      await deleteTask(editingTaskId);
      await createTask(plannerId, noteWithTag);
    } else {
      // Create new note
      await createTask(plannerId, noteWithTag);
    }
    await onTasksChange();
    setSelectedDay(null);
    setNoteText('');
    setEditingTaskId(null);
  } catch (err) {
    console.error('Failed to save note:', err);
  }
};

  // Handle deleting note
  const handleDeleteNote = async () => {
    if (!editingTaskId) return;

    try {
      await deleteTask(editingTaskId);
      await onTasksChange();
      setSelectedDay(null);
      setNoteText('');
      setEditingTaskId(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <div>
      {/* Month/Year Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <button
          onClick={previousMonth}
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
        
        <h1 style={{ margin: 0 }}>
          {getMonthName(currentMonth)} {currentYear}
        </h1>
        
        <button
          onClick={nextMonth}
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

      {/* Day of week header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '8px'
      }}>
        {daysOfWeek.map(day => (
          <div key={day} style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'var(--dusty-grape)',
            padding: '8px'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px'
      }}>
        {/* Empty cells before month starts */}
        {emptyDays.map(i => (
          <div key={`empty-${i}`} style={{ minHeight: '100px' }} />
        ))}
        
        {days.map(day => {
          const note = getNoteForDay(day);
          const hasNote = !!note;
          
          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              style={{
                border: '1px solid var(--lilac-ash)',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '100px',
                cursor: 'pointer',
                backgroundColor: 'white',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--dusty-grape)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--lilac-ash)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Day number */}
              <div style={{
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: 'var(--space-indigo)',
                marginBottom: '8px'
              }}>
                {day}
              </div>

              {/* Note preview */}
              {hasNote && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-dark)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3'
                }}>
                  {note.title.replace(/\[\d{4}-\d{2}-\d{2}\]\s*/, '')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note editing modal */}
      {selectedDay && (
        <div style={{
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
        onClick={() => setSelectedDay(null)}
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
            <h2 style={{ marginBottom: '20px' }}>{getMonthName(currentMonth)} {selectedDay}, {currentYear}</h2>
            
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note for this day..."
              style={{
                width: '100%',
                minHeight: '120px',
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
              {editingTaskId && (
                <button
                  onClick={handleDeleteNote}
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
              )}
              
              <button
                onClick={() => setSelectedDay(null)}
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
                onClick={handleSaveNote}
                className="primary"
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                disabled={!noteText.trim()}
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