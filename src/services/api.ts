import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: async (data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'user' | 'seller';
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default api;