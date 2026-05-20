/// <reference types="vite/client" />
import axios from 'axios';

// API Base URL
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';
export const API_ASSET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

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
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = /\/auth\/(login|register|forgot-password|reset-password)/.test(requestUrl);

    if (status === 401 && !isAuthEndpoint) {
      // Token expired or invalid for authenticated requests
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

  updateSellerProfile: async (data: {
    location?: string | null;
    skills?: string | null;
    portfolio_url?: string | null;
    bio?: string | null;
  }) => {
    const response = await api.put('/profile/seller', data);
    return response.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data.data;
  },

  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data.message;
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

export const dashboardAPI = {
  getBuyerDashboard: async () => {
    const response = await api.get('/dashboard/buyer');
    return response.data.data;
  },

  getSellerDashboard: async () => {
    const response = await api.get('/dashboard/seller');
    return response.data.data;
  }
};

export const profileAPI = {
  getSellerPortfolio: async (userId: number) => {
    const response = await api.get(`/profile/portfolio/${userId}`);
    return response.data.data;
  },

  addSellerPortfolio: async (formData: FormData) => {
    const response = await api.post('/profile/portfolio', formData);
    return response.data.data;
  },

  deleteSellerPortfolio: async (portfolioId: number) => {
    const response = await api.delete(`/profile/portfolio/${portfolioId}`);
    return response.data.data;
  }
};

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  getUsers: async (page = 1, limit = 10, role?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (role) {
      params.set('role', role);
    }

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data.data;
  },

  updateUser: async (id: number, data: { role?: 'user' | 'seller' | 'admin'; is_verified?: boolean }) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data.data;
  },

  getOrders: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) {
      params.set('status', status);
    }

    const response = await api.get(`/admin/orders?${params.toString()}`);
    return response.data.data;
  },

  getPendingPayments: async (page = 1, limit = 10) => {
    const response = await api.get(`/payments/admin/pending?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  verifyPayment: async (paymentId: number, action: 'verify' | 'reject') => {
    const response = await api.put(`/payments/${paymentId}/verify`, { action });
    return response.data.data;
  },
};

export const withdrawAPI = {
  requestWithdraw: async (data: {
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
  }) => {
    const response = await api.post('/withdraws/request', data);
    return response.data.data;
  },

  getSellerWithdraws: async (page = 1, limit = 10) => {
    const response = await api.get(`/withdraws/seller?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  cancelWithdraw: async (id: number) => {
    const response = await api.put(`/withdraws/${id}/cancel`);
    return response.data;
  }
};

export const serviceAPI = {
  createService: async (data: any) => {
    try {
      const response = await api.post('/services', data);
      return response.data.data;
    } catch (err: any) {
      console.log('Detail error:', JSON.stringify(err.response?.data, null, 2));
      throw err;
    }
  },

  getServiceById: async (id: number) => {
    const response = await api.get(`/services/${id}`);
    return response.data.data;
  },

  getServices: async (page = 1, limit = 10, search?: string, category?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set('search', search);
    if (category) {
      if (/^\d+$/.test(category)) {
        params.set('category_id', category);
      } else {
        params.set('category', category);
      }
    }

    const response = await api.get(`/services?${params.toString()}`);
    return response.data.data;
  },

  updateService: async (id: number, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data.data;
  },

  deleteService: async (id: number) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  // ===== TAMBAHAN REALTIME (POLLING) =====
  subscribeToService: (id: number, onSuccess: (data: any) => void, onError?: (err: any) => void) => {
    serviceAPI.getServiceById(id).then(onSuccess).catch(onError || console.error);
    
    const interval = setInterval(() => {
      serviceAPI.getServiceById(id)
        .then(onSuccess)
        .catch(() => {}); // Abaikan error minor saat polling
    }, 3000);
    
    return () => clearInterval(interval);
  },
};

// Chat API functions
export const chatAPI = {
  sendMessage: async (data: {
    order_id: number;
    receiver_id: number;
    message?: string;
    message_type?: 'text' | 'image' | 'file';
    file_url?: string;
  }) => {
    const response = await api.post('/chats/send', data);
    return response.data.data;
  },

  getOrderMessages: async (orderId: number) => {
    const response = await api.get(`/chats/order/${orderId}`);
    return response.data.data;
  },

  getUserChats: async () => {
    const response = await api.get('/chats/user/chats');
    return response.data.data;
  },

  markAsRead: async (orderId: number) => {
    const response = await api.put(`/chats/order/${orderId}/read`);
    return response.data.data;
  },

  uploadChatFile: async (formData: FormData) => {
    const response = await api.post('/chats/upload', formData);
    return response.data.data;
  },

  // ===== TAMBAHAN REALTIME (POLLING) =====
  subscribeToOrderMessages: (orderId: number, onSuccess: (data: any) => void) => {
    chatAPI.getOrderMessages(orderId).then(onSuccess).catch(console.error);

    const interval = setInterval(() => {
      chatAPI.getOrderMessages(orderId)
        .then(onSuccess)
        .catch(() => {}); 
    }, 2000); // Update setiap 2 detik untuk chat

    return () => clearInterval(interval);
  },
};

// Reviews API functions
export const reviewAPI = {
  createReview: async (data: {
    order_id: number;
    rating: number;
    comment?: string;
    images?: string[];
  }) => {
    const response = await api.post('/reviews', data);
    return response.data.data;
  },

  getSellerReviews: async (sellerId: number, page = 1, limit = 10) => {
    const response = await api.get(`/reviews/seller/${sellerId}?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  getSellerStats: async (sellerId: number) => {
    const response = await api.get(`/reviews/stats/${sellerId}`);
    return response.data.data;
  },

  getReviewById: async (id: number) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data.data;
  },

  updateReview: async (id: number, data: {
    rating?: number;
    comment?: string;
  }) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data.data;
  },

  deleteReview: async (id: number) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data.data;
  },

  // ===== TAMBAHAN REALTIME (POLLING) =====
  subscribeToSellerReviews: (sellerId: number, onSuccess: (data: any) => void) => {
    reviewAPI.getSellerReviews(sellerId, 1, 100)
      .then(data => onSuccess(data?.reviews || []))
      .catch(console.error);

    const interval = setInterval(() => {
      reviewAPI.getSellerReviews(sellerId, 1, 100)
        .then(data => onSuccess(data?.reviews || []))
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  },

  subscribeToSellerStats: (sellerId: number, onSuccess: (data: any) => void) => {
    reviewAPI.getSellerStats(sellerId).then(onSuccess).catch(console.error);

    const interval = setInterval(() => {
      reviewAPI.getSellerStats(sellerId)
        .then(onSuccess)
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  },
};

// Orders API functions
export const orderAPI = {
  createOrder: async (data: {
    service_id: number;
    package_id: number;
    title?: string;
    description?: string;
  }) => {
    const response = await api.post('/orders', data);
    return response.data.data;
  },

  getUserOrders: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.set('status', status);
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data.data;
  },

  getOrderById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  cancelOrder: async (id: number) => {
    const response = await api.put(`/orders/${id}/cancel`, {});
    return response.data.data;
  },
};

// Payments API functions
export const paymentAPI = {
  uploadPaymentProof: async (data: {
    order_id: number;
    payment_method: 'bank_transfer' | 'virtual_account' | 'e_wallet';
    proof_image?: File;
  }) => {
    const formData = new FormData();
    formData.append('order_id', String(data.order_id));
    formData.append('payment_method', data.payment_method);
    if (data.proof_image) {
      formData.append('proof_image', data.proof_image);
    }
    const response = await api.post('/payments/upload-proof', formData);
    return response.data.data;
  },

  getPaymentByOrderId: async (orderId: number) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data.data;
  },

  generateReceipt: async (paymentId: number) => {
    const response = await api.get(`/payments/${paymentId}/receipt`, { responseType: 'blob' });
    return response;
  },

  // ===== TAMBAHAN REALTIME (POLLING) =====
  subscribeToPaymentStatus: (orderId: number, onSuccess: (data: any) => void) => {
    paymentAPI.getPaymentByOrderId(orderId).then(onSuccess).catch(console.error);

    const interval = setInterval(() => {
      paymentAPI.getPaymentByOrderId(orderId)
        .then(onSuccess)
        .catch(() => {});
    }, 4000); 

    return () => clearInterval(interval);
  },
};

export default api;