// displays all tasks for a specific planner

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks } from '../services/taskService';
import AddTaskForm from '../components/AddTaskForm';
import TaskItem from '../components/TaskItem';
import Weather from '../components/Weather';
import { useAuth } from '../context/AuthContext';
import { getPlanners } from '../services/plannerService';
import DailyView from '../components/DailyView';
import MonthlyView from '../components/MonthlyView';

export default function PlannerView() {
  const { plannerId } = useParams(); // Gets plannerId from URL (e.g., /planner/5)
  const navigate = useNavigate(); // For navigation back to dashboard
  
  const [planner, setPlanner] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  // Load planner and tasks when component mounts
  useEffect(() => {
    loadPlannerAndTasks();
  }, [plannerId]);

  const loadPlannerAndTasks = async () => {
    try {
      setLoading(true);
      // Get all planners and find the current one
      const planners = await getPlanners();
      const currentPlanner = planners.find(p => p.id === parseInt(plannerId));
      setPlanner(currentPlanner);
      
      // Get tasks
      const tasksData = await getTasks(plannerId);
      setTasks(tasksData);
    } catch (err) {
      setError('Failed to load planner');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await getTasks(plannerId);
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!planner) {
    return <div style={{ padding: '20px' }}>Planner not found</div>;
  }

// Render Daily View for daily planners
if (planner.view_type === 'daily') {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ padding: '8px 16px', marginBottom: '10px', cursor: 'pointer' }}
      >
        ← Back to Dashboard
      </button>

      {user?.location && (
        <div style={{ marginBottom: '20px' }}>
          <Weather city={user.location} />
        </div>
      )}

      <DailyView plannerId={plannerId} tasks={tasks} onTasksChange={loadTasks} />
    </div>
  );
}

// Render Monthly View for monthly planners
if (planner.view_type === 'monthly') {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ padding: '8px 16px', marginBottom: '10px', cursor: 'pointer' }}
      >
        ← Back to Dashboard
      </button>

      {user?.location && (
        <div style={{ marginBottom: '20px' }}>
          <Weather city={user.location} />
        </div>
      )}

      <MonthlyView plannerId={plannerId} tasks={tasks} onTasksChange={loadTasks} />
    </div>
  );
}

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header with back button */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', marginBottom: '10px', cursor: 'pointer' }}
        >
          ← Back to Dashboard
        </button>
        <h1>Tasks</h1>
      </div>

      {/* Weather Widget */}
      {user?.location && (
        <div style={{ marginBottom: '20px' }}>
          <Weather city={user.location} />
        </div>
      )}

      {/* Add Task Button */}
      <button 
        onClick={() => setShowAddForm(!showAddForm)}
        className="primary"
        style={{ padding: '10px 20px', marginBottom: '20px', cursor: 'pointer', border: 'none', borderRadius: '8px' }}
      >
        {showAddForm ? 'Cancel' : '+ Add Task'}
      </button>

      {/* Add Task Form */}
      {showAddForm && (
        <AddTaskForm 
          plannerId={plannerId}
          onSuccess={() => {
            setShowAddForm(false);
            loadTasks(); // Refresh task list
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Error Message */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* Loading State */}
      {loading && <div>Loading tasks...</div>}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No tasks yet. Add your first task!</p>
        </div>
      )}

      {/* Tasks List */}
      {!loading && tasks.length > 0 && (
        <div>
          {tasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onUpdate={loadTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}