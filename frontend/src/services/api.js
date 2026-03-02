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
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password, name, promoCode) => 
    api.post('/auth/register', { email, password, name, promoCode }),
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Meals API
export const mealsAPI = {
  getToday: () => api.get('/meals/today'),
  getRange: (start, end) => api.get('/meals/range', { params: { start, end } }),
  add: (mealData) => api.post('/meals', mealData),
  delete: (id) => api.delete(`/meals/${id}`),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (favoriteData) => api.post('/favorites', favoriteData),
  delete: (id) => api.delete(`/favorites/${id}`),
};

// Workouts API
export const workoutsAPI = {
  getToday: () => api.get('/workouts/today'),
  add: (workoutData) => api.post('/workouts', workoutData),
  delete: (id) => api.delete(`/workouts/${id}`),
};

// Water API
export const waterAPI = {
  getToday: () => api.get('/water/today'),
  update: (glassesCount) => api.put('/water/today', { glasses_count: glassesCount }),
};

// AI API (Claude)
export const aiAPI = {
  analyzeFood: (imageBase64) => api.post('/ai/analyze', { imageBase64 }),
  generateMealPlan: (data) => api.post('/ai/meal-plan', data),
  getSuggestions: (macrosBudget) => api.post('/ai/suggest', macrosBudget),
};

// Shopping List / Grocery API
export const shoppingAPI = {
  getList: () => api.get('/shopping-list'),
  addItem: (itemData) => api.post('/shopping-list', itemData),
  toggleItem: (id, isChecked) => api.patch(`/shopping-list/${id}`, { is_checked: isChecked }),
  removeItem: (id) => api.delete(`/shopping-list/${id}`),
  clearCompleted: () => api.delete('/shopping-list/completed'),
};

export const groceryCacheAPI = {
  get: (barcode) => api.get(`/grocery/cache/${barcode}`),
  set: (barcode, productData) => api.post('/grocery/cache', { barcode, productData }),
};

export default api;
