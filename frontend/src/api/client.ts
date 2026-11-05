import axios from 'axios';

// Get base URL from environment or fallback to relative URL (leveraging Vite dev proxy)
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to requests if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('railblock_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardized API error handling
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      'An unexpected error occurred communicating with RailBlock AI backend';
    console.error('[API Error]:', errorMessage, error);
    return Promise.reject(error);
  }
);
