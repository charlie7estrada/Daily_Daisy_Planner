// Task management functions 

import { apiRequest } from './api';

// Get all tasks
export const getTasks = async (plannerId) => {
  const response = await apiRequest(`/planners/${plannerId}/tasks`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};
// Create new task
export const createTask = async (plannerId, title) => {
  const response = await apiRequest(`/planners/${plannerId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
};

// Update task
export const updateTaskStatus = async (taskId, status) => {
    const response = await apiRequest(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({status}),
    });

    if (!response.ok) {
        throw new Error('Failed to update task status');
    }

    return response.json();
};

// Delete task
export const deleteTask = async (taskId) => {
    const response = await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete task');
    }

    return response.json();
}