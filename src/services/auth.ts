import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'seller' | 'admin';
}

// Register
export const register = async (data: RegisterData): Promise<LoginResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Login
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

// Get profile
export const getProfile = async (): Promise<any> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Update profile
export const updateProfile = async (data: any): Promise<any> => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

// Change password
export const changePassword = async (oldPassword: string, newPassword: string): Promise<any> => {
  const response = await api.put('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Save token and user
export const saveAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Get stored user
export const getStoredUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get stored token
export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

// Check if authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};