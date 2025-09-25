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
  timeout: 10000,
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await api.request({
      url: endpoint,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error.response?.data || error;
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
  }
};

// Legacy compatibility - export as default for existing imports
export default apiService;
export { apiService as api };
