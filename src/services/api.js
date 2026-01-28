import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const { state } = JSON.parse(authData);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (credentials) => api.post('/api/v1/auth/login', credentials);
export const register = (userData) => api.post('/api/v1/auth/register', userData);
export const validateToken = () => api.post('/api/v1/auth/validate');

// Task endpoints
export const getTasks = () => api.get('/api/v1/tasks');
export const getTask = (id) => api.get(`/api/v1/tasks/${id}`);
export const createTask = (task) => api.post('/api/v1/tasks', task);
export const updateTask = (id, task) => api.put(`/api/v1/tasks/${id}`, task);
export const deleteTask = (id) => api.delete(`/api/v1/tasks/${id}`);

// Session endpoints
export const getSessions = () => api.get('/api/v1/sessions');
export const getSession = (id) => api.get(`/api/v1/sessions/${id}`);
export const createSession = (session) => api.post('/api/v1/sessions', session);
export const endSession = (id) => api.patch(`/api/v1/sessions/${id}/end`);

export default api;
