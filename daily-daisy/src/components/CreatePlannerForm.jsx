// form to create a new planner

import { useState } from 'react';
import { createPlanner } from '../services/plannerService';

export default function CreatePlannerForm({ onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [viewType, setViewType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page refresh on form submit
    setError('');
    setLoading(true);

    try {
      await createPlanner(name, viewType);
      // Reset form
      setName('');
      setViewType('daily');
      // Call the success callback (Dashboard will refresh planner list)
      onSuccess();
    } catch (err) {
      setError('Failed to create planner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '2px solid var(--almond-silk)' }}>
      <h3 style={{ marginBottom: '15px' }}>Create New Planner</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Planner Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Work Tasks, Personal Goals"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            View Type
          </label>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
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
            {loading ? 'Creating...' : 'Create Planner'}
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