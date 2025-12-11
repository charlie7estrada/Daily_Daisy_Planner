// Planner functions that communicate with backend planner routes

import { apiRequest } from './api';

// Get all planners for the logged-in user
export const getPlanners = async () => {
  const response = await apiRequest('/planners', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch planners');
  }

  return response.json();
};

// Create a new planner
export const createPlanner = async (name, viewType = 'daily') => {
  const response = await apiRequest('/planners', {
    method: 'POST',
    body: JSON.stringify({ name, view_type: viewType }),
  });

  if (!response.ok) {
    throw new Error('Failed to create planner');
  }

  return response.json();
};