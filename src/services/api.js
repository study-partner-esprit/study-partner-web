import axios from 'axios';

// Use relative URLs in development so Vite proxy can intercept /api/* requests
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance (no default Content-Type so FormData can set boundary)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // Increased timeout for complex operations like study plan creation (3 mins)
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log('[API] Interceptor running for:', config.url);

    // Skip token for auth endpoints (login, register, refresh)
    if (config.url?.includes('/auth/') && !config.url?.includes('/auth/me')) {
      console.log('[API] Skipping token for auth endpoint');
      return config;
    }

    try {
      // Import auth store dynamically to avoid circular imports
      const { useAuthStore } = await import('../store/authStore');

      // Get a valid token (will refresh if needed)
      const token = await useAuthStore.getState().getValidToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] ✓ Using valid token (first 20 chars):', token.substring(0, 20) + '...');
      } else {
        console.log('[API] ✗ No valid token available');
        // Don't reject here - let the request go through and handle 401 in response interceptor
      }
    } catch (error) {
      console.error('[API] Error in request interceptor:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Import auth store dynamically
        const { useAuthStore } = await import('../store/authStore');
        const authStore = useAuthStore.getState();

        // Try to refresh token
        console.log('[API] 401 received, attempting token refresh...');
        const refreshed = await authStore.refreshTokenAsync();

        if (refreshed) {
          // Retry the original request with new token
          const newToken = authStore.token;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('[API] Retrying request with refreshed token');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
      }

      // If refresh failed or no refresh token, logout user
      console.log('[API] Authentication failed, logging out user');
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().logout();

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

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
  refresh: (refreshToken) => api.post('/api/v1/auth/refresh', { refreshToken }),
  getMe: () => api.get('/api/v1/auth/me'),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/api/v1/users/profile'),
  update: (data) => api.put('/api/v1/users/profile', data),
};

// Subject & Course Management (through main backend)
export const subjectAPI = {
  list: () => api.get('/api/v1/study/subjects'),
  create: (formData) => api.post('/api/v1/study/subjects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  get: (subjectId) => api.get(`/api/v1/study/subjects/${subjectId}`),
  update: (subjectId, formData) => api.put(`/api/v1/study/subjects/${subjectId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (subjectId) => api.delete(`/api/v1/study/subjects/${subjectId}`)
};

export const courseAPI = {
  list: (subjectId = null) => api.get('/api/v1/study/courses', { params: subjectId ? { subject_id: subjectId } : {} }),
  create: (formData) => api.post('/api/v1/study/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  get: (courseId) => api.get(`/api/v1/study/courses/${courseId}`),
  addFiles: (courseId, formData) => api.post(`/api/v1/study/courses/${courseId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (courseId) => api.delete(`/api/v1/study/courses/${courseId}`)
};

// AI Services API (connects to Python FastAPI service)
const AI_API_BASE = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

export const aiAPI = {
  // Study Planning - Now goes through API Gateway → ai-orchestrator → Python AI
  createStudyPlan: (data) => api.post('/api/v1/ai/plan/create', data),
  getUserPlans: () => api.get('/api/v1/ai/plan/list'),
  
  // Coaching
  getCoachDecision: (data) => axios.post(`${AI_API_BASE}/api/ai/coach/decision`, data),
  getCoachHistory: (userId, limit = 20) => axios.get(`${AI_API_BASE}/api/ai/coach/history/${userId}`, { params: { limit } }),
  
  // Signal Processing
  getCurrentSignals: (userId) => axios.get(`${AI_API_BASE}/api/ai/signals/current/${userId}`),
  getSignalHistory: (userId, limit = 50) => axios.get(`${AI_API_BASE}/api/ai/signals/history/${userId}`, { params: { limit } }),
  processSignals: (userId) => axios.post(`${AI_API_BASE }/api/ai/signals/process`, { user_id: userId }),
  
  // Health check
  healthCheck: () => axios.get(`${AI_API_BASE}/health`),
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

// Study Plans API (replaces old task generation)
export const studyPlanAPI = {
  create: (data) => api.post('/api/v1/study/plans/create', data),
  getAll: (params) => api.get('/api/v1/study/plans', { params }),
  getById: (planId) => api.get(`/api/v1/study/plans/${planId}`),
  schedule: (planId, contextData) => api.post(`/api/v1/study/plans/${planId}/schedule`, contextData),
  getSchedule: (planId) => api.get(`/api/v1/study/plans/${planId}/schedule`),
  delete: (planId) => api.delete(`/api/v1/study/plans/${planId}`),
  scheduleTasks: (data) => api.post('/api/v1/study/plans/schedule-tasks', data),
  getCalendar: (params) => api.get('/api/v1/study/plans/calendar', { params }),
};

// Availability API (Weekly Calendar) - Goes through Node.js backend
export const availabilityAPI = {
  get: () => api.get('/api/v1/users/availability').then(res => res.data),
  save: (data) => api.post('/api/v1/users/availability', data).then(res => res.data),
  delete: (id) => api.delete(`/api/v1/users/availability/${id}`).then(res => res.data),
  getFreeSlots: (params) => api.get('/api/v1/users/availability/free-slots', { params }).then(res => res.data),
};

// Gamification API - Goes through Node.js backend
export const gamificationAPI = {
  getProfile: () => api.get('/api/v1/users/gamification').then(res => res.data),
  awardXP: (data) => api.post('/api/v1/users/gamification/award-xp', data).then(res => res.data),
  getLeaderboard: (limit = 10) => api.get('/api/v1/users/gamification/leaderboard', { params: { limit } }).then(res => res.data),
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
