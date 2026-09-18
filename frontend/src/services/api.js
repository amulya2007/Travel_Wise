import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer token into all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('travelwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear local storage
      localStorage.removeItem('travelwise_token');
      localStorage.removeItem('travelwise_user');
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// --- Places APIs ---
export const placesApi = {
  getPlaces: (params) => api.get('/places', { params }),
  getPlace: (id) => api.get(`/places/${id}`),
  getCategories: () => api.get('/places/categories'),
  getCities: () => api.get('/places/cities'),
  getRecommendations: (data) => api.post('/places/recommendations', data),
};

// --- Trips APIs ---
export const tripsApi = {
  createTrip: (data) => api.post('/trips', data),
  getTrips: () => api.get('/trips'),
  getTrip: (id) => api.get(`/trips/${id}`),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
};

// --- Itinerary APIs ---
export const itineraryApi = {
  generateItinerary: (tripId) => api.post(`/trips/${tripId}/generate`),
  getItinerary: (tripId) => api.get(`/trips/${tripId}/itinerary`),
};

// --- Budget APIs ---
export const budgetApi = {
  getBudget: (tripId) => api.get(`/trips/${tripId}/budget`),
};

// --- Checklist APIs ---
export const checklistApi = {
  getChecklist: (tripId) => api.get(`/trips/${tripId}/checklist`),
  addItem: (tripId, data) => api.post(`/trips/${tripId}/checklist/items`, data),
  updateItem: (itemId, data) => api.put(`/checklist/items/${itemId}`, data),
  deleteItem: (itemId) => api.delete(`/checklist/items/${itemId}`),
};

export default api;
