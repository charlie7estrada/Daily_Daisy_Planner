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
      {/* Header with logout button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Planners</h1>
        <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Location Setting */}
      <div style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '8px', border: '2px solid var(--almond-silk)' }}>
        <h3 style={{ marginBottom: '10px' }}>Your Location</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const location = e.target.location.value;
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ location })
            });
            if (response.ok) {
              const data = await response.json();
              // Update the user in AuthContext with the new location
              login(localStorage.getItem('token'), data.user);
              alert('Location saved!');
            }
          } catch (err) {
            alert('Failed to save location');
          }
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="location"
              placeholder="Enter your city (e.g., New York)"
              defaultValue={user?.location || ''}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button 
              type="submit"
              className="primary"
              style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Save Location
            </button>
          </div>
        </form>
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