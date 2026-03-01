import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password, name) => 
    api.post('/auth/register', { email, password, name }),
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Meals API
export const mealsAPI = {
  add: (mealData) => 
    api.post('/meals', mealData),
  getTodayMeals: () => 
    api.get('/meals/today'),
  getMealsByRange: (startDate, endDate) => 
    api.get('/meals/range', { params: { startDate, endDate } }),
  deleteMeal: (mealId) => 
    api.delete(`/meals/${mealId}`),
};

// Settings API
export const settingsAPI = {
  getSettings: () => 
    api.get('/settings'),
  updateSettings: (settings) => 
    api.put('/settings', settings),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => 
    api.get('/favorites'),
  add: (mealData) => 
    api.post('/favorites', mealData),
  delete: (favoriteId) => 
    api.delete(`/favorites/${favoriteId}`),
};

// Workouts API
export const workoutsAPI = {
  add: (workoutData) => 
    api.post('/workouts', workoutData),
  getTodayWorkouts: () => 
    api.get('/workouts/today'),
  getWorkoutsByRange: (startDate, endDate) => 
    api.get('/workouts/range', { params: { startDate, endDate } }),
  deleteWorkout: (workoutId) => 
    api.delete(`/workouts/${workoutId}`),
};

// Water API
export const waterAPI = {
  add: (waterData) => 
    api.post('/water', waterData),
  getTodayWater: () => 
    api.get('/water/today'),
  getWaterByRange: (startDate, endDate) => 
    api.get('/water/range', { params: { startDate, endDate } }),
  deleteWater: (waterId) => 
    api.delete(`/water/${waterId}`),
};

export default api;
