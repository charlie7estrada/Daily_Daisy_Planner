// individual task item with checkbox and delete button

import { useState } from 'react';
import { updateTaskStatus, deleteTask } from '../services/taskService';

export default function TaskItem({ task, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTaskStatus(task.id, newStatus);
      onUpdate(); // Tell parent to refresh task list
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    
    setLoading(true);
    try {
      await deleteTask(task.id);
      onUpdate(); // Tell parent to refresh task list
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        padding: '15px', 
        background: 'white', 
        borderRadius: '8px', 
        marginBottom: '10px',
        border: '1px solid #ddd',
        opacity: loading ? 0.6 : 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input 
          type="checkbox" 
          checked={task.status === 'completed'} 
          onChange={handleToggle}
          disabled={loading}
          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
        />
        <span 
          style={{ 
            flex: 1, 
            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            color: task.status === 'completed' ? '#999' : '#000'
          }}
        >
          {/* hide both date and time tags in title of tasks */}
          {task.title
            .replace(/\[\d{4}-\d{2}-\d{2}\]\s*/, '')
            .replace(/\[\d{1,2}(AM|PM)\]\s*/, '')
          }
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{ 
            padding: '4px 12px', 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}