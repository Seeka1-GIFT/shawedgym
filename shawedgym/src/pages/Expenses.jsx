import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
// DB-only mode: remove dummy expenses
import { 
  TrendingDown, Plus, Search, Filter, Calendar, DollarSign,
  Building, Zap, Wrench, Users, Package, Car,
  AlertTriangle, CheckCircle, Clock, Edit, Trash2, Eye,
  BarChart3, PieChart, Target, Award, FileText, Download,
  CreditCard, Receipt, Calculator, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

/**
 * Modern Expense Management System with budget tracking, analytics, and financial insights
 */
const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', 'analytics'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsExpense, setDetailsExpense] = useState(null);
  const [backendExpenses, setBackendExpenses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getExpenses();
        const apiExpenses = Array.isArray(res?.data) ? res.data : res?.data?.expenses || [];
        setBackendExpenses(apiExpenses);
      } catch (e) {
        setBackendExpenses([]);
      }
    };
    load();
  }, []);

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleDeleteExpense = (expense) => {
    setDeletingExpense(expense);
    setShowDeleteModal(true);
  };

  const handleShowDetails = (expense) => {
    setDetailsExpense(expense);
    setShowDetailsModal(true);
  };

  const confirmDeleteExpense = async () => {
    try {
      if (deletingExpense?.id) {
        await apiService.deleteExpense(deletingExpense.id);
        const refreshed = await apiService.getExpenses();
        const apiExpenses = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.expenses || [];
        setBackendExpenses(apiExpenses);
      }
    } catch (e) {
      console.error('Delete expense failed', e);
    } finally {
      setShowDeleteModal(false);
      setDeletingExpense(null);
    }
  };

  const submitCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload = {
        title: data.get('title') || '',
        amount: Number(data.get('amount')) || 0,
        category: data.get('category') || 'General',
        description: data.get('description') || '',
        expense_date: data.get('date') || new Date().toISOString().split('T')[0],
        vendor: data.get('vendor') || '',
        status: data.get('status') || 'approved'
      };
      await apiService.createExpense(payload);
      const refreshed = await apiService.getExpenses();
      const apiExpenses = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.expenses || [];
      setBackendExpenses(apiExpenses);
      setShowAddModal(false);
    } catch (err) {
      console.error('Create expense failed', err);
    }
  };

  const submitEditExpense = async (e) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload = {
        amount: Number(data.get('amount')) || editingExpense.amount,
        category: data.get('category') || editingExpense.category,
        description: data.get('description') || editingExpense.description,
        status: data.get('status') || editingExpense.status
      };
      await apiService.updateExpense(editingExpense.id, payload);
      const refreshed = await apiService.getExpenses();
      const apiExpenses = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.expenses || [];
      setBackendExpenses(apiExpenses);
      setShowEditModal(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Update expense failed', err);
    }
  };

  // Map backend expenses to the UI model (no dummy data)
  const enhancedExpenses = backendExpenses.map(e => ({
    id: e.id,
    title: e.title || '',
    amount: Number(e.amount) || 0,
    category: e.category || 'General',
    description: e.description || '',
    date: e.expense_date || e.date || new Date().toISOString().split('T')[0],
    vendor: e.vendor || '-',
    status: e.status || 'approved',
    // Defaults to avoid UI errors
    budget: 0,
    tags: []
  }));

  const filteredExpenses = enhancedExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Equipment':
        return Package;
      case 'Utilities':
        return Zap;
      case 'Maintenance':
        return Wrench;
      case 'Rent':
        return Building;
      case 'Staff':
        return Users;
      case 'Transportation':
        return Car;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Calculate statistics
  const stats = {
    totalExpenses: enhancedExpenses.length,
    totalAmount: enhancedExpenses.reduce((sum, e) => sum + e.amount, 0),
    pendingAmount: enhancedExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
    rejectedExpenses: enhancedExpenses.filter(e => e.status === 'rejected').length
  };

  // Chart data
  const monthlyExpenseData = [];

  const categoryData = [...new Set(enhancedExpenses.map(e => e.category))].map(category => ({
    name: category,
    value: enhancedExpenses.filter(e => e.category === category && e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
    color: category === 'Equipment' ? '#3B82F6' :
           category === 'Utilities' ? '#10B981' :
           category === 'Maintenance' ? '#F59E0B' : '#6B7280'
  }));

  const categories = [...new Set(enhancedExpenses.map(e => e.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Expense</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
              </div>
              <form onSubmit={submitCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input name="title" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input name="amount" type="number" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input name="category" placeholder="e.g. Utilities" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
                  <input name="vendor" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input name="date" type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select name="status" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea name="description" rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Edit Expense Modal */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Expense</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
              </div>
              <form onSubmit={submitEditExpense} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input name="amount" type="number" defaultValue={editingExpense.amount} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input name="category" defaultValue={editingExpense.category} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select name="status" defaultValue={editingExpense.status} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea name="description" defaultValue={editingExpense.description} rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

  {/* Details Modal */}
  {showDetailsModal && detailsExpense && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Details</h3>
            <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">ID</span><span className="font-medium text-gray-900 dark:text-white">{detailsExpense.id}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Category</span><span className="font-medium text-gray-900 dark:text-white">{detailsExpense.category}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Vendor</span><span className="font-medium text-gray-900 dark:text-white">{detailsExpense.vendor}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Date</span><span className="font-medium text-gray-900 dark:text-white">{detailsExpense.date}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Amount</span><span className="font-bold text-red-600">${detailsExpense.amount}</span></div>
            <div><span className="block text-gray-600 dark:text-gray-400 mb-1">Description</span><p className="text-gray-900 dark:text-white">{detailsExpense.description || '-'}</p></div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Delete Expense Modal */}
      {showDeleteModal && deletingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Expense</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete expense <strong>{deletingExpense.id}</strong>?</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                <button onClick={confirmDeleteExpense} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Expense Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Track expenses, manage budgets, and analyze spending patterns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExpenses}</p>
            </div>
            <FileText className="w-6 h-6 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.pendingAmount.toLocaleString()}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejectedExpenses}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        
        {/* Avg. Expense card removed per request */}
        
        {/* Total Budget card removed per request */}
        
        {/* Budget Used card removed per request */}
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'overview' 
                    ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'detailed' 
                    ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'analytics' 
                    ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Expenses Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Expenses vs Budget</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Bar dataKey="amount" fill="#EF4444" name="Actual" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="budget" fill="#E5E7EB" name="Budget" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses by Category</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div>
          {/* Search and Filter Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExpenses.map((expense) => {
              const CategoryIcon = getCategoryIcon(expense.category);
              const StatusIcon = getStatusIcon(expense.status);
              const budgetPercentage = (expense.amount / expense.budget) * 100;
              
              return (
                <div key={expense.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-6">
                    {/* Expense Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <CategoryIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{expense.category}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{expense.receiptNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-5 h-5 ${
                          expense.status === 'approved' ? 'text-green-500' :
                          expense.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                      </div>
                    </div>

                    {/* Expense Details */}
                    <div className="mb-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{expense.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Vendor:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{expense.vendor}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Date:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{expense.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                          <span className="text-lg font-bold text-red-600">${expense.amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(expense.priority)}`}>
                        {expense.priority} Priority
                      </span>
                      {expense.recurring && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">
                          Recurring
                        </span>
                      )}
                    </div>

                    {/* Budget Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Budget Utilization</span>
                        <span className={`font-medium ${budgetPercentage > 100 ? 'text-red-600' : budgetPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {budgetPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            budgetPercentage > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            budgetPercentage > 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-blue-500'
                          }`}
                          style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>${expense.amount}</span>
                        <span>${expense.budget} budget</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {expense.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button onClick={() => handleShowDetails(expense)} className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                      <button onClick={() => handleEditExpense(expense)} className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteExpense(expense)} className="p-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Expense Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Expense Trends</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Line type="monotone" dataKey="amount" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="budget" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#6B7280', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Budget Performance</h3>
              </div>
              <div className="space-y-4">
                {categories.slice(0, 5).map((category) => {
                  const categoryExpenses = enhancedExpenses.filter(e => e.category === category && e.status === 'approved');
                  const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                  const totalBudget = categoryExpenses.reduce((sum, e) => sum + e.budget, 0);
                  const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
                  
                  return (
                    <div key={category} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                        <span className={`text-sm font-bold ${
                          utilization > 100 ? 'text-red-600' : utilization > 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>${totalSpent.toLocaleString()} spent</span>
                        <span>${totalBudget.toLocaleString()} budget</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expense Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Expense Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800 dark:text-red-400">Highest Category</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Equipment expenses account for 35% of total spending
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-400">Recurring Costs</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Monthly recurring expenses: ${enhancedExpenses.filter(e => e.recurring).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-400">Budget Health</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Overall budget utilization: {stats.budgetUtilization}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredExpenses.length === 0 && viewMode === 'detailed' && (
        <div className="text-center py-12">
          <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Expenses;
