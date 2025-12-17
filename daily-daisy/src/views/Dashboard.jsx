// displays all planners for the logged in user and allows creating new ones

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPlanners } from '../services/plannerService';
import CreatePlannerForm from '../components/CreatePlannerForm';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout, login } = useAuth();
  const [planners, setPlanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  // Fetch planners when component loads
  useEffect(() => {
    loadPlanners();
  }, []); // Empty array means this runs once when component mounts

  const loadPlanners = async () => {
    try {
      setLoading(true);
      const data = await getPlanners();
      setPlanners(data);
    } catch (err) {
      setError('Failed to load planners');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Update Profile and Logout buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Planners</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/profile')}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Update Profile
          </button>
          <button 
            onClick={logout} 
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Create Planner Button */}
      <button 
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="primary"
        style={{ padding: '10px 20px', marginBottom: '20px', cursor: 'pointer', border: 'none', borderRadius: '8px' }}
      >
        {showCreateForm ? 'Cancel' : '+ Create New Planner'}
      </button>

      {/* Create Planner Form */}
      {showCreateForm && (
        <CreatePlannerForm 
          onSuccess={() => {
            setShowCreateForm(false);
            loadPlanners(); // Refresh the planner list
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Error Message */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* Loading State */}
      {loading && <div>Loading planners...</div>}

      {/* Planners List */}
      {!loading && planners.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No planners yet. Create your first one!</p>
        </div>
      )}

      {!loading && planners.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {planners.map((planner) => (
            <div 
              key={planner.id} 
              onClick={() => navigate(`/planner/${planner.id}`)}
              style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '8px', 
                border: '2px solid var(--almond-silk)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3>{planner.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>View: {planner.view_type}</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                Created: {new Date(planner.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}