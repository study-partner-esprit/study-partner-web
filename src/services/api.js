import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance (no default Content-Type so FormData can set boundary)
const api = axios.create({
  baseURL: API_BASE_URL,
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
  getMe: () => api.get('/api/v1/auth/me'),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/api/v1/users/profile'),
  update: (data) => api.put('/api/v1/users/profile', data),
  getStats: () => api.get('/api/v1/users/profile/stats'),
  updateStats: (data) => api.patch('/api/v1/users/profile/stats', data),
  getGoals: () => api.get('/api/v1/users/profile/goals'),
  addGoal: (data) => api.post('/api/v1/users/profile/goals', data),
  updateGoal: (goalId, data) => api.patch(`/api/v1/users/profile/goals/${goalId}`, data),
  deleteGoal: (goalId) => api.delete(`/api/v1/users/profile/goals/${goalId}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/api/v1/study/tasks', { params }),
  getById: (taskId) => api.get(`/api/v1/study/tasks/${taskId}`),
  create: (data) => api.post('/api/v1/study/tasks', data),
  update: (taskId, data) => api.put(`/api/v1/study/tasks/${taskId}`, data),
  delete: (taskId) => api.delete(`/api/v1/study/tasks/${taskId}`),
};

// Topics API
export const topicsAPI = {
  getAll: () => api.get('/api/v1/study/topics'),
  getById: (topicId) => api.get(`/api/v1/study/topics/${topicId}`),
  create: (data) => api.post('/api/v1/study/topics', data),
  update: (topicId, data) => api.put(`/api/v1/study/topics/${topicId}`, data),
  delete: (topicId) => api.delete(`/api/v1/study/topics/${topicId}`),
};

// Sessions API
export const sessionsAPI = {
  getAll: (params) => api.get('/api/v1/study/sessions', { params }),
  getById: (sessionId) => api.get(`/api/v1/study/sessions/${sessionId}`),
  create: (data) => api.post('/api/v1/study/sessions', data),
  update: (sessionId, data) => api.put(`/api/v1/study/sessions/${sessionId}`, data),
  endSession: (sessionId) => api.put(`/api/v1/study/sessions/${sessionId}`, { status: 'completed' }),
  getStats: (params) => api.get('/api/v1/study/sessions/stats/summary', { params }),
};

// AI API
export const aiAPI = {
  ingestCourse: (data) => api.post('/api/v1/ai/ingest', data),
  generatePlan: (data) => api.post('/api/v1/ai/plan', data),
  scheduleTasks: (data) => api.post('/api/v1/ai/schedule', data),
  getCoachAdvice: (data) => api.post('/api/v1/ai/coach', data),
  getStatus: () => api.get('/api/v1/ai/status'),
};

// Focus Tracking API
export const focusAPI = {
  startSession: (data) => api.post('/api/v1/signals/focus/start', data),
  addDataPoint: (sessionId, data) => api.post(`/api/v1/signals/focus/${sessionId}/data`, data),
  endSession: (sessionId) => api.post(`/api/v1/signals/focus/${sessionId}/end`),
  getSession: (sessionId) => api.get(`/api/v1/signals/focus/${sessionId}`),
  getAllSessions: (params) => api.get('/api/v1/signals/focus', { params }),
  getStats: (params) => api.get('/api/v1/signals/focus/stats/summary', { params }),
};

// Analytics API
export const analyticsAPI = {
  trackEvent: (data) => api.post('/api/v1/analytics/track', data),
  getTimeline: (params) => api.get('/api/v1/analytics/timeline', { params }),
  getSummary: (params) => api.get('/api/v1/analytics/summary', { params }),
  getStatsByType: (eventType, params) => api.get(`/api/v1/analytics/stats/${eventType}`, { params }),
  getInsights: (params) => api.get('/api/v1/analytics/insights', { params }),
};

// Legacy support - maintain backward compatibility
export const login = (credentials) => authAPI.login(credentials);
export const register = (userData) => authAPI.register(userData);
export const validateToken = () => authAPI.getMe();
export const getTasks = () => tasksAPI.getAll();
export const getTask = (id) => tasksAPI.getById(id);
export const createTask = (task) => tasksAPI.create(task);
export const updateTask = (id, task) => tasksAPI.update(id, task);
export const deleteTask = (id) => tasksAPI.delete(id);

// Session endpoints
export const getSessions = () => api.get('/api/v1/sessions');
export const getSession = (id) => api.get(`/api/v1/sessions/${id}`);
export const createSession = (session) => api.post('/api/v1/sessions', session);
export const endSession = (id) => api.patch(`/api/v1/sessions/${id}/end`);

export default api;
