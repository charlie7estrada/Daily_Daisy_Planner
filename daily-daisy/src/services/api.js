// base api configuration with token management

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper to get token from localStorage
export const getToken = () => localStorage.getItem('token');

// Helper to save token to localStorage
export const setToken = (token) => localStorage.setItem('token', token);

// Helper to remove token from localStorage
export const removeToken = () => localStorage.removeItem('token');

// Base fetch wrapper with auth headers
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Handle 401 Unauthorized (expired/invalid token)
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
  }

  return response;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await apiRequest('/auth/profile', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};