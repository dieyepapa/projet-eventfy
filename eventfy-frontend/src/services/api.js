import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Auth:', !!token);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
  getMyEvents: () => api.get('/auth/my-events/'),
};

// Events API
export const eventsAPI = {
  getEvents: (params = {}) => api.get('/events/', { params }),
  getEvent: (id) => {
    console.log('API: Fetching event with ID:', id);
    return api.get(`/events/${id}/`);
  },
  createEvent: (eventData) => {
    console.log('API: Creating event with data:', eventData);
    return api.post('/events/', eventData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateEvent: (id, eventData) => {
    console.log('API: Updating event with ID:', id, 'Data:', eventData);
    return api.put(`/events/${id}/`, eventData);
  },
  deleteEvent: (id) => api.delete(`/events/${id}/`),
  getEventParticipants: (id) => api.get(`/events/${id}/participants/`),
  exportEventParticipants: (id) => api.get(`/events/${id}/export_participants/`, { responseType: 'blob' }),
  registerForEvent: (eventId) => {
    console.log('Registering for event:', eventId);
    return api.post(`/events/${eventId}/register/`);
  },
  unregisterFromEvent: (eventId) => {
    console.log('Unregistering from event:', eventId);
    return api.delete(`/events/${eventId}/unregister/`);
  },
  getFeaturedEvents: () => api.get('/events/featured/'),
  getUpcomingEvents: () => api.get('/events/upcoming/'),
  getNearbyEvents: (city) => api.get('/events/nearby/', { params: { city } }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories/'),
  createCategory: (categoryData) => api.post('/categories/', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}/`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}/`),
};

// Utility functions
export const isAuthenticated = () => {
  return !!getToken();
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const logout = () => {
  clearTokens();
  window.location.href = '/login';
};

export { setTokens, clearTokens };
export default api;
