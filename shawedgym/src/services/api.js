/**
 * ShawedGym API Service - Backend Integration
 * Connection to Express + PostgreSQL backend
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://shawedgym.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  // Increase timeout to tolerate Render cold starts (free tier)
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentGym');
      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'authToken',
        newValue: null,
        oldValue: localStorage.getItem('authToken')
      }));
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function for API calls with enhanced error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await api.request({
      url: endpoint,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    
    // Enhanced error handling
    const errorResponse = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || null
    };
    
    // Show user-friendly error messages
    if (error.response?.status === 401) {
      errorResponse.message = 'Authentication required. Please login again.';
    } else if (error.response?.status === 403) {
      errorResponse.message = 'Access denied. You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      errorResponse.message = 'Resource not found.';
    } else if (error.response?.status === 500) {
      errorResponse.message = 'Server error. Please try again later.';
    }
    
    // If timeout (cold start), retry up to 2 times with backoff
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
      for (let i = 0; i < 2; i++) {
        try {
          const waitMs = 1500 * (i + 1);
          await new Promise(r => setTimeout(r, waitMs));
          const retry = await api.request({ url: endpoint, ...options });
          return retry.data;
        } catch (e) {
          // continue to next retry
        }
      }
    }
    throw errorResponse;
  }
};

// API Methods
export const apiService = {
  // Health check
  getHealth: () => apiCall('/health'),
  
  // Dashboard
  getDashboardStats: () => apiCall('/dashboard/stats'),
  getRecentActivities: () => apiCall('/dashboard/recent-activities'),
  
  // Auth
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    data: credentials
  }),
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    data: userData
  }),
  getCurrentUser: () => apiCall('/auth/me'),
  resetPassword: (data) => apiCall('/auth/reset-password', {
    method: 'POST',
    data: data
  }),
  
  // Users (Admin only)
  getUsers: () => apiCall('/users'),
  getUser: (id) => apiCall(`/users/${id}`),
  createUser: (data) => apiCall('/users', {
    method: 'POST',
    data: data
  }),
  updateUser: (id, data) => apiCall(`/users/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteUser: (id) => apiCall(`/users/${id}`, {
    method: 'DELETE'
  }),

  // Gyms
  getGyms: () => apiCall('/gyms'),
  getGym: (id) => apiCall(`/gyms/${id}`),
  createGym: (data) => apiCall('/gyms', {
    method: 'POST',
    data: data
  }),
  updateGym: (id, data) => apiCall(`/gyms/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteGym: (id) => apiCall(`/gyms/${id}`, {
    method: 'DELETE'
  }),

  // Subscriptions
  getSubscriptionPlans: () => apiCall('/subscriptions/plans'),
  getSubscriptionPlan: (id) => apiCall(`/subscriptions/plans/${id}`),
  createSubscriptionPlan: (data) => apiCall('/subscriptions/plans', {
    method: 'POST',
    data: data
  }),
  updateSubscriptionPlan: (id, data) => apiCall(`/subscriptions/plans/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteSubscriptionPlan: (id) => apiCall(`/subscriptions/plans/${id}`, {
    method: 'DELETE'
  }),
  getGymSubscription: () => apiCall('/subscriptions/gym'),
  subscribeGym: (data) => apiCall('/subscriptions/gym', {
    method: 'POST',
    data: data
  }),
  cancelSubscription: () => apiCall('/subscriptions/gym', {
    method: 'DELETE'
  }),
  getSubscriptionUsage: () => apiCall('/subscriptions/usage'),
  
  // Members
  getMembers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/members${queryString ? '?' + queryString : ''}`);
  },
  getMemberStats: () => apiCall('/members/stats/dashboard'),
  getMember: (id) => apiCall(`/members/${id}`),
  createMember: (data) => apiCall('/members', {
    method: 'POST',
    data: data
  }),
  updateMember: (id, data) => apiCall(`/members/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteMember: (id) => apiCall(`/members/${id}`, {
    method: 'DELETE'
  }),
  checkInMember: (id) => apiCall(`/members/${id}/checkin`, {
    method: 'POST'
  }),
  
  // Payments
  getPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payments${queryString ? '?' + queryString : ''}`);
  },
  getPaymentStats: () => apiCall('/payments/stats/revenue'),
  getPayment: (id) => apiCall(`/payments/${id}`),
  createPayment: (data) => apiCall('/payments', {
    method: 'POST',
    data: data
  }),
  updatePayment: (id, data) => apiCall(`/payments/${id}`, {
    method: 'PUT',
    data: data
  }),
  deletePayment: (id) => apiCall(`/payments/${id}`, {
    method: 'DELETE'
  }),
  
  // Plans
  getPlans: () => apiCall('/plans'),
  getPlan: (id) => apiCall(`/plans/${id}`),
  createPlan: (data) => apiCall('/plans', {
    method: 'POST',
    data: data
  }),
  updatePlan: (id, data) => apiCall(`/plans/${id}`, {
    method: 'PUT',
    data: data
  }),
  deletePlan: (id) => apiCall(`/plans/${id}`, {
    method: 'DELETE'
  }),
  
  // Classes
  getClasses: () => apiCall('/classes'),
  getClass: (id) => apiCall(`/classes/${id}`),
  createClass: (data) => apiCall('/classes', {
    method: 'POST',
    data: data
  }),
  updateClass: (id, data) => apiCall(`/classes/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteClass: (id) => apiCall(`/classes/${id}`, {
    method: 'DELETE'
  }),
  bookClass: (classId, data) => apiCall(`/classes/${classId}/book`, {
    method: 'POST',
    data: data
  }),
  
  // Assets
  getAssets: () => apiCall('/assets'),
  getAsset: (id) => apiCall(`/assets/${id}`),
  createAsset: (data) => apiCall('/assets', {
    method: 'POST',
    data: data
  }),
  updateAsset: (id, data) => apiCall(`/assets/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteAsset: (id) => apiCall(`/assets/${id}`, {
    method: 'DELETE'
  }),
  
  // Trainers
  getTrainers: () => apiCall('/trainers'),
  getTrainer: (id) => apiCall(`/trainers/${id}`),
  createTrainer: (data) => apiCall('/trainers', {
    method: 'POST',
    data: data
  }),
  updateTrainer: (id, data) => apiCall(`/trainers/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteTrainer: (id) => apiCall(`/trainers/${id}`, {
    method: 'DELETE'
  }),
  
  // Attendance
  getAttendance: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance${queryString ? '?' + queryString : ''}`);
  },
  createAttendance: (data) => apiCall('/attendance', {
    method: 'POST',
    data: data
  }),
  updateAttendance: (id, data) => apiCall(`/attendance/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteAttendance: (id) => apiCall(`/attendance/${id}`, {
    method: 'DELETE'
  }),
  
  // Expenses
  getExpenses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/expenses${queryString ? '?' + queryString : ''}`);
  },
  getExpense: (id) => apiCall(`/expenses/${id}`),
  createExpense: (data) => apiCall('/expenses', {
    method: 'POST',
    data: data
  }),
  updateExpense: (id, data) => apiCall(`/expenses/${id}`, {
    method: 'PUT',
    data: data
  }),
  deleteExpense: (id) => apiCall(`/expenses/${id}`, {
    method: 'DELETE'
  }),
  
  // Equipment (mock endpoint for now)
  getEquipment: () => apiCall('/equipment'),
  
  // Reports
  getFinancialReports: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/reports/financial${queryString ? '?' + queryString : ''}`);
  },
  getMembershipReports: () => apiCall('/reports/membership')
};

// Reports snapshots
apiService.getReports = () => apiCall('/reports');
apiService.createReport = (data) => apiCall('/reports', {
  method: 'POST',
  data
});

// Connection status - check backend connection
export const getConnectionStatus = () => {
  return {
    isConnected: true,
    backendUrl: API_BASE_URL,
    usingMockData: false,
    type: 'Express + PostgreSQL Backend'
  };
};

// Test connection
export const testConnection = async () => {
  try {
    const response = await apiService.getHealth();
    return {
      success: true,
      data: response,
      message: 'Connection successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Connection failed'
    };
  }
};

// Auth helper functions
export const authHelpers = {
  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },
  
  removeAuthToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },
  
  // Login helper that stores both token and user data
  login: async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data.token) {
        authHelpers.setAuthToken(response.data.token);
        authHelpers.setUser(response.data.user);
        return response;
      }
      throw new Error('Login failed: No token received');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout helper
  logout: () => {
    authHelpers.removeAuthToken();
    window.location.href = '/login';
  }
};

// Utility functions for common operations
export const apiUtils = {
  // Handle API responses with loading states
  withLoading: async (apiCall, setLoading) => {
    try {
      if (setLoading) setLoading(true);
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error('API call with loading failed:', error);
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  },
  
  // Retry failed requests
  withRetry: async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  },
  
  // Batch operations
  batch: async (operations) => {
    try {
      const results = await Promise.allSettled(operations);
      return results.map((result, index) => ({
        index,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('Batch operations failed:', error);
      throw error;
    }
  }
};

// Legacy compatibility - export as default for existing imports
export default apiService;
export { apiService as api };
