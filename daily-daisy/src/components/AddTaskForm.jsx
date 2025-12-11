// form to add a new task to a planner

import { useState } from 'react';
import { createTask } from '../services/taskService';

export default function AddTaskForm({ plannerId, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createTask(plannerId, title);
      setTitle(''); // Clear the input
      onSuccess(); // Tell parent to refresh task list
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '2px solid var(--almond-silk)', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>Add New Task</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What do you need to do?"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            className="primary"
            style={{ flex: 1, padding: '10px', cursor: 'pointer', border: 'none', borderRadius: '8px' }}
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            style={{ flex: 1, padding: '10px', cursor: 'pointer', background: '#ccc', border: 'none', borderRadius: '8px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}