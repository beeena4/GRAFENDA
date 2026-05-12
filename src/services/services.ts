import api from './api';

export interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  seller_id: number;
  image?: string;
  rating?: number;
  reviews_count?: number;
}

export interface ServicePackage {
  id: number;
  name: string;
  description?: string;
  price: number;
  delivery_time: number;
  revisions: number;
}

// Get services
export const getServices = async (page: number = 1, limit: number = 10, filters?: any): Promise<any> => {
  const response = await api.get('/services', {
    params: {
      page,
      limit,
      ...filters,
    },
  });
  return response.data;
};

// Get service by ID
export const getServiceById = async (id: number): Promise<any> => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

// Create service (seller)
export const createService = async (data: any): Promise<any> => {
  const response = await api.post('/services', data);
  return response.data;
};

// Update service (seller)
export const updateService = async (id: number, data: any): Promise<any> => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};

// Delete service (seller)
export const deleteService = async (id: number): Promise<any> => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};

// Search services
export const searchServices = async (query: string, filters?: any): Promise<any> => {
  const response = await api.get('/services', {
    params: {
      search: query,
      ...filters,
    },
  });
  return response.data;
};

// Get featured services
export const getFeaturedServices = async (): Promise<any> => {
  const response = await api.get('/services/featured');
  return response.data;
};

// Get service categories
export const getCategories = async (): Promise<any> => {
  const response = await api.get('/services/categories');
  return response.data;
};