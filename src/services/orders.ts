import api from './api';

export interface Order {
  id: number;
  service_id: number;
  buyer_id: number;
  seller_id: number;
  price: number;
  status: 'pending' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  delivery_date?: string;
  created_at: string;
}

// Get user orders
export const getUserOrders = async (page: number = 1, limit: number = 10, status?: string): Promise<any> => {
  const response = await api.get('/orders', {
    params: {
      page,
      limit,
      ...(status && { status }),
    },
  });
  return response.data;
};

// Get seller orders
export const getSellerOrders = async (page: number = 1, limit: number = 10): Promise<any> => {
  const response = await api.get('/orders/seller', {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

// Get order by ID
export const getOrderById = async (id: number): Promise<any> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Create order
export const createOrder = async (data: any): Promise<any> => {
  const response = await api.post('/orders', data);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (id: number, status: string): Promise<any> => {
  const response = await api.put(`/orders/${id}/status`, {
    status,
  });
  return response.data;
};

// Cancel order
export const cancelOrder = async (id: number): Promise<any> => {
  const response = await api.put(`/orders/${id}/cancel`, {});
  return response.data;
};

// Get order stats
export const getOrderStats = async (): Promise<any> => {
  const response = await api.get('/orders/stats');
  return response.data;
};