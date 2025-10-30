import React, { useState, useEffect } from 'react';
import { apiService, authHelpers } from '../services/api.js';
// Removed dummy payments to keep only backend data
import { useToast } from '../contexts/ToastContext.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { 
  DollarSign, Plus, Search, Filter, Calendar, CreditCard,
  TrendingUp, TrendingDown, CheckCircle, XCircle, Clock,
  Printer, Download, Eye, RefreshCw, AlertTriangle,
  BarChart3, PieChart, Users, Award, Target, FileText, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import QuickActions from '../components/QuickActions.jsx';
import RelatedData from '../components/RelatedData.jsx';

// Add Payment Form Component
const AddPaymentModal = ({ onClose, onPaymentAdded, memberOptions, planOptions }) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    memberId: '',
    planId: '',
    amount: '',
    method: 'cash',
    description: '',
    status: 'completed'
  });
  const [loading, setLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.memberId || !formData.amount) {
        showError('Please select a member and enter an amount');
        setLoading(false);
        return;
      }

      await onPaymentAdded(formData);
      showSuccess('Payment created successfully!');
    } catch (error) {
      const errorMessage = error.message || 'Failed to create payment';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Payment</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member *</label>
              <div className="relative">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  placeholder="Search member..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
                {showMemberDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {memberOptions
                      .filter(member => {
                        const memberName = member.first_name ? `${member.first_name} ${member.last_name || ''}`.trim() : member.name || 'Unknown Member';
                        return memberName.toLowerCase().includes(memberSearch.toLowerCase());
                      })
                      .map(member => {
                        const memberName = member.first_name ? `${member.first_name} ${member.last_name || ''}`.trim() : member.name || 'Unknown Member';
                        return (
                          <div
                            key={member.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, memberId: member.id }));
                              setMemberSearch(memberName);
                              setShowMemberDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                          >
                            {memberName}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan (Optional)</label>
              <select name="planId" value={formData.planId} onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white">
                <option value="">No Plan</option>
                {planOptions.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name} - ${plan.price}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($) *</label>
              <input type="number" min="0" step="0.01" name="amount" value={formData.amount} onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" 
                placeholder="20.00" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select name="method" value={formData.method} onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white">
                <option value="EVC-PLUS">EVC-PLUS</option>
                <option value="E-DAHAB">E-DAHAB</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Payment description..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white">
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create Payment'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Modern Payment Management System with transaction tracking, analytics, and financial insights
 */
const Payments = () => {
  const { showSuccess, showError } = useToast();
  const currentUser = authHelpers.getUser();
  const isAdmin = currentUser?.role === 'admin';
  const isCashier = currentUser?.role === 'cashier';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'transactions', 'analytics'
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    memberId: '',
    amount: '',
    method: 'Cash',
    description: '',
    planId: ''
  });

  const [backendPayments, setBackendPayments] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [planOptions, setPlanOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gymName, setGymName] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiService.getPayments();
        const apiPayments = Array.isArray(res?.data) ? res.data : res?.data?.payments || [];
        setBackendPayments(apiPayments);
        setError(null);
      } catch (e) {
        console.error('Failed to load payments:', e);
        setError(e.message || 'Failed to load payments');
        showError(e.message || 'Failed to load payments');
        setBackendPayments([]);
      } finally {
        setLoading(false);
      }
    };
    const loadRefs = async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          apiService.getMembers({ limit: 500 }),
          apiService.getPlans()
        ]);
        setMemberOptions(mRes?.data?.members || []);
        const p = Array.isArray(pRes?.data) ? pRes.data : pRes?.data?.plans || [];
        setPlanOptions(p);
      } catch (e) {
        console.error('Failed to load references:', e);
        setMemberOptions([]);
        setPlanOptions([]);
      }
    };
    const loadGym = async () => {
      try {
        const g = await apiService.getMyGym();
        const name = g?.data?.gym?.name || g?.data?.name || g?.name || '';
        if (name) setGymName(name);
      } catch (e) {
        // Fallback to user first/last name if gym name missing
        const fallback = currentUser?.gym_name || [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ');
        if (fallback) setGymName(fallback);
      }
    };
    load();
    loadRefs();
    loadGym();
  }, [showError]);

  const sourcePayments = backendPayments;

  // Enhanced payments data with additional transaction details
  const enhancedPayments = sourcePayments.map(payment => {
    const rawMethod = payment.method ?? payment.payment_method ?? payment.paymentMethod;
    // Normalize common variants to a consistent display label
    const normalizedMethod = (() => {
      const m = String(rawMethod || '').trim();
      if (!m) return 'Unknown';
      const lower = m.toLowerCase();
      if (lower === 'evc-plus' || lower === 'evc' || lower === 'evcplus') return 'EVC-PLUS';
      if (lower === 'e-dahab' || lower === 'edahab') return 'E-DAHAB';
      if (lower === 'bank_transfer' || lower === 'bank transfer' || lower === 'transfer') return 'Bank Transfer';
      if (lower === 'wallet') return 'Wallet';
      if (lower === 'cash') return 'Cash';
      if (lower === 'credit card' || lower === 'card') return 'Credit Card';
      return m; // Keep as-is for any custom methods
    })();

    return {
      ...payment,
      // Normalize foreign keys from backend/dummy
      _memberId: payment.memberId ?? payment.member_id ?? payment.memberid ?? payment.member_id_fk ?? null,
      _planId: payment.planId ?? payment.plan_id ?? payment.planid ?? payment.plan_id_fk ?? null,
      amount: Number(payment.amount) || 0,
      memberPhoto: `https://images.unsplash.com/photo-${
        ((payment.memberId ?? payment.member_id ?? 1) % 2 === 0) ? '1507003211169-0a1dd7228f2d' : '1494790108755-2616b612b47c'
      }?w=150&h=150&fit=crop&crop=face`,
      // Persist exact status from backend; no randomization
      status: payment.status || 'completed',
      // Persist method from backend; no randomization
      paymentMethod: normalizedMethod,
      transactionId: `TXN${String(payment.id).padStart(6, '0')}`,
      processingFee: 0,
      netAmount: Number(payment.amount) || 0,
      currency: 'USD',
      // Keep auxiliary fields but avoid random method/status
      refundable: Boolean(payment.refundable),
      invoiceNumber: `INV-2024-${String(payment.id).padStart(4, '0')}`,
      dueDate: payment.dueDate || payment.payment_date || payment.created_at || null,
      paymentType: payment.paymentType || (payment.id % 3 === 0 ? 'Membership' : payment.id % 3 === 1 ? 'Personal Training' : 'Class Fee')
    };
  });

  const getMember = (memberId) => memberOptions.find((mm) => mm.id === memberId);
  const getMemberName = (memberId) => {
    const m = getMember(memberId);
    if (!m) return 'Unknown Member';
    return m.first_name ? `${m.first_name} ${m.last_name || ''}`.trim() : (m.name || 'Unknown Member');
  };
  const getPlanNameById = (planId) => planOptions.find((p) => p.id === planId)?.name;
  const resolvePlanName = (payment) => {
    // Prefer explicit id
    const byId = getPlanNameById(payment._planId);
    if (byId && byId.trim()) return byId;
    // Backend may already include plan_name
    const apiName = payment.plan_name || payment.planName;
    if (apiName && String(apiName).trim()) return apiName;
    // Try to parse from description
    const desc = String(payment.description || '').toLowerCase();
    const fromDesc = planOptions.find(p => desc.includes(String(p.name || '').toLowerCase()));
    if (fromDesc) return fromDesc.name;
    return '-';
  };
  // Backwards-compatible helper used elsewhere in this component
  const getPlanName = (planId) => (getPlanNameById(planId) || '-');
  
  const getMemberPhoto = (memberId) => {
    const m = getMember(memberId);
    return (m && m.photo_url) ? m.photo_url : '';
  };

  const getPaymentDate = (p) => p.payment_date || p.created_at || p.createdAt || p.date || null;
  const formatDate = (d) => {
    const raw = d || '';
    if (!raw) return '-';
    try {
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return '-';
      return dt.toLocaleDateString();
    } catch { return '-'; }
  };

  const formatCurrency = (n) => `$${(Number(n) || 0).toFixed(2)}`;

  const filteredPayments = enhancedPayments.filter(payment => {
    const memberName = getMemberName(payment._memberId);
    const planName = getPlanName(payment._planId);
    
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || String(payment._planId || '') === filterPlan;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'failed':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card':
        return CreditCard;
      case 'Cash':
        return DollarSign;
      case 'Bank Transfer':
        return FileText;
      case 'Mobile Payment':
      case 'EVC-PLUS':
      case 'E-DAHAB':
      case 'Wallet':
        return CreditCard;
      default:
        return DollarSign;
    }
  };

  // Hook edit/delete buttons in Transactions list/table if present later
  const onEditPayment = (payment) => {
    setEditingPayment({
      id: payment.id,
      amount: payment.amount || 0,
      paymentMethod: payment.paymentMethod || payment.method || 'EVC-PLUS',
      status: payment.status || 'completed'
    });
    setShowEditModal(true);
  };

  const onDeletePayment = (payment) => {
    setDeletingPayment(payment);
    setShowDeleteModal(true);
  };

  const confirmDeletePayment = async () => {
    try {
      if (deletingPayment?.id) {
        await apiService.deletePayment(deletingPayment.id);
        const refreshed = await apiService.getPayments();
        const apiPayments = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.payments || [];
        setBackendPayments(apiPayments);
        showSuccess('Payment deleted successfully!');
      }
    } catch (e) {
      console.error('Delete payment failed', e);
      showError(e.message || 'Failed to delete payment');
    } finally {
      setShowDeleteModal(false);
      setDeletingPayment(null);
    }
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      const response = await apiService.createPayment(paymentData);
      if (response.success) {
        const refreshed = await apiService.getPayments();
        const apiPayments = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.payments || [];
        setBackendPayments(apiPayments);
        setShowAddPaymentModal(false);
        showSuccess('Payment created successfully!');
      }
    } catch (error) {
      console.error('Create payment error:', error);
      showError(error.message || 'Failed to create payment');
      throw error; // Re-throw to be handled by the form
    }
  };

  const submitEditPayment = async (e) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload = {
        amount: Number(data.get('amount')) || editingPayment.amount,
        method: data.get('paymentMethod') || editingPayment.paymentMethod,
        status: data.get('status') || editingPayment.status
      };
      await apiService.updatePayment(editingPayment.id, payload);
      const refreshed = await apiService.getPayments();
      const apiPayments = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.payments || [];
      setBackendPayments(apiPayments);
      setShowEditModal(false);
      setEditingPayment(null);
      showSuccess('Payment updated successfully!');
    } catch (err) {
      console.error('Update payment failed', err);
      showError(err.message || 'Failed to update payment');
    }
  };


  // Handle edit payment
  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  // Handle delete payment
  const handleDeletePayment = (payment) => {
    setDeletingPayment(payment);
    setShowDeleteModal(true);
  };

  // Confirm delete payment handled above (async) to call backend

  // Calculate statistics
  const completedPayments = enhancedPayments.filter(p => p.status === 'completed');
  const pendingPayments = enhancedPayments.filter(p => p.status === 'pending');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const stats = {
    totalTransactions: enhancedPayments.length,
    totalRevenue,
    pendingAmount: pendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    failedTransactions: enhancedPayments.filter(p => p.status === 'failed').length,
    processingFees: 0
  };

  // Chart data
  const monthlyData = [
    { month: 'Jan', revenue: 12500, transactions: 45 },
    { month: 'Feb', revenue: 13200, transactions: 52 },
    { month: 'Mar', revenue: 11800, transactions: 48 },
    { month: 'Apr', revenue: 14500, transactions: 58 },
    { month: 'May', revenue: 15200, transactions: 62 },
    { month: 'Jun', revenue: 16800, transactions: 68 }
  ];

  const paymentMethodData = [
    { name: 'EVC-PLUS', value: enhancedPayments.filter(p => p.paymentMethod === 'EVC-PLUS').length, color: '#3B82F6' },
    { name: 'E-DAHAB', value: enhancedPayments.filter(p => p.paymentMethod === 'E-DAHAB').length, color: '#10B981' },
    { name: 'Bank Transfer', value: enhancedPayments.filter(p => p.paymentMethod === 'Bank Transfer').length, color: '#8B5CF6' },
    { name: 'Wallet', value: enhancedPayments.filter(p => p.paymentMethod === 'Wallet').length, color: '#F59E0B' }
  ];

  // Export functionality
  const handleExport = () => {
    try {
      // Prepare CSV data
      const csvHeaders = ['Member Name', 'Plan', 'Amount', 'Method', 'Date', 'Status', 'Transaction ID'];
      const csvData = filteredPayments.map(payment => [
        getMemberName(payment._memberId),
        resolvePlanName(payment),
        `$${Number(payment.amount).toFixed(2)}`,
        payment.paymentMethod || payment.method || 'Unknown',
        formatDate(getPaymentDate(payment)),
        payment.status,
        payment.transactionId || payment.id
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Payments exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export payments. Please try again.');
    }
  };

  const handlePrint = async (payment) => {
    try {
      // Fetch enriched payment by id to ensure correct receipt data
      let enriched = null;
      try {
        const res = await apiService.getPayment(payment.id || payment.paymentId);
        enriched = res?.data?.payment || res?.data || null;
      } catch {}
      // Prefer enriched names; fall back to normalized ids from the list (_memberId/_planId)
      const memberName = enriched?.memberName || getMemberName(payment._memberId);
      const planName = enriched?.planName || getPlanName(payment._planId);
      const headerGymName = gymName || enriched?.gymName || (authHelpers.getUser()?.gym_name || '');
      // Prefer rgFee and planFee from API; fallback to best-effort
      const rgFee = Number(enriched?.rgFee ?? payment.rgFee ?? payment.registrationFee ?? 0) || 0;
      const planFee = Number(enriched?.planFee ?? payment.planFee ?? ((payment.amount && rgFee) ? (Number(payment.amount) - rgFee) : payment.amount) ?? 0) || 0;
      const netAmount = Number(enriched?.total ?? (planFee + rgFee)) || 0;
      const date = payment.date || new Date().toISOString().split('T')[0];
      // Force POS-80 layout for thermal printers
      const format = 'pos80';
      const pageSize = '80mm auto';
      const containerWidth = '80mm';
      const fontSize = '12px';
      const headingSize = '14px';
      const html = `
        <html>
          <head>
            <title>Receipt ${payment.transactionId || ''}</title>
            <style>
              *{box-sizing:border-box}
              @page { size: ${pageSize}; margin: 0; }
              body{font-family:Arial,Helvetica,sans-serif;padding:0;margin:0;color:#0f172a;background:#fff}
              .paper{width:${containerWidth}; margin:0 auto;}
              .receipt{width:${containerWidth}; font-size:${fontSize}; margin:0 auto}
              .card{background:#fff;border:none;overflow:hidden}
              .header{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:linear-gradient(90deg,#2563eb,#8b5cf6);color:#fff}
              .brand{font-weight:800;letter-spacing:.3px}
              .badge{display:inline-block;padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.15);font-size:10px}
              .section{padding:8px 10px}
              h2{margin:0 0 6px 0; font-size:${headingSize}; text-align:center;color:#111827}
              .meta{margin:6px 0 2px 0; font-size:${fontSize}; display:grid; grid-template-columns: 1fr 1fr;gap:6px}
              .meta div{background:#fff;border:1px dashed #e5e7eb;border-radius:6px;padding:6px 8px}
              .meta strong{color:#111827}
              table{width:100%;border-collapse:separate;border-spacing:0 6px;font-size:${fontSize}}
              td{padding:6px 8px; vertical-align:top;background:#fff;border:1px dashed #e5e7eb}
              tr td:first-child{border-radius:6px 0 0 6px;color:#475569}
              tr td:last-child{border-radius:0 6px 6px 0;text-align:right;color:#111827}
              .total-row td{background:#ecfeff;border-color:#bae6fd}
              .total-row td:first-child{font-weight:700}
              .footer{padding:8px 10px 10px 10px;text-align:center;color:#64748b;font-size:10px}
              @media print {
                body{margin:0;padding:0}
                .receipt{width:80mm !important;margin:0 auto;font-size:12px}
              }
            </style>
          </head>
          <body>
            <div class="paper receipt">
              <div class="card">
                <div class="header">
                  <div class="brand">${headerGymName || 'ShawedGym'}</div>
                  <div class="badge">Payment Receipt</div>
                </div>
                <div class="section">
                  <div class="meta">
                    <div>Receipt #: <strong>${payment.transactionId || '-'}</strong></div>
                    <div style="text-align:right">Date: <strong>${date}</strong></div>
                  </div>
                </div>
                <div class="section" style="padding-top:0">
                  <table>
                    <tr><td>Member</td><td>${memberName}</td></tr>
                    <tr><td>Plan</td><td>${planName}</td></tr>
                    <tr><td>Method</td><td>${enriched?.method || payment.paymentMethod || payment.method || 'Cash'}</td></tr>
                  </table>
                </div>
                <div class="section" style="padding-top:0">
                  <table>
                    <tr><td>RG Fee</td><td>$${rgFee.toLocaleString()}</td></tr>
                    <tr><td>Plan Fee</td><td>$${planFee.toLocaleString()}</td></tr>
                    <tr class="total-row"><td>Net Amount</td><td>$${netAmount.toLocaleString()}</td></tr>
                  </table>
                </div>
                <div class="footer">Thanks for your payment.</div>
              </div>
            </div>
          </body>
        </html>`;

      // Try hidden iframe first
      const printViaIFrame = () => new Promise((resolve, reject) => {
        try {
          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          document.body.appendChild(iframe);
          const doc = iframe.contentWindow?.document;
          if (!doc) throw new Error('no-iframe-doc');
          doc.open();
          doc.write(html);
          doc.close();
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
              resolve(true);
            } catch (e) {
              reject(e);
            } finally {
              document.body.removeChild(iframe);
            }
          }, 150);
        } catch (e) {
          reject(e);
        }
      });

      // Fallback: open a new window using Blob URL (works when iframes are blocked)
      const printViaWindow = () => new Promise((resolve, reject) => {
        try {
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const w = window.open(url, '_blank', 'noopener');
          if (!w) throw new Error('popup-blocked');
          const done = () => {
            try { w.focus(); w.print(); } catch {}
            setTimeout(() => { try { w.close(); URL.revokeObjectURL(url); } catch {}; resolve(true); }, 250);
          };
          // In most browsers print after load
          w.onload = done;
          // Safety fallback
          setTimeout(done, 700);
        } catch (e) {
          reject(e);
        }
      });

      printViaIFrame().catch(() => printViaWindow()).catch(() => {
        window.alert('Print failed. Please try again or allow pop-ups.');
      });
    } catch (e) {
      console.error('Print failed', e);
      window.alert('Print failed. Please try again.');
    }
  };

  const safeMembers = Array.isArray(memberOptions) ? memberOptions : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <ErrorBoundary 
        error={error ? { message: error } : null} 
        onRetry={() => window.location.reload()}
        onDismiss={() => setError(null)}
      >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Payment Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Track transactions, manage payments, and analyze revenue streams</p>
        {(isAdmin || isCashier) && (
          <div className="mt-4">
            <button onClick={() => setShowAddPaymentModal(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Add New Payment</button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTransactions}</p>
            </div>
            <FileText className="w-6 h-6 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${Number(stats.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        {/* Avg. Transaction card removed per request */}
        
        {false && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Fees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.processingFees}</p>
              </div>
              <TrendingDown className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        )}
      </div>

      {/* Simplified UI per request */}

      {/* View Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'overview' 
                    ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('transactions')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'transactions' 
                    ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Transactions
              </button>
                  <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'analytics' 
                    ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            {(isAdmin || isCashier) && (
              <button onClick={() => setShowAddPaymentModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="w-4 h-4" />
                <span>New Payment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Revenue</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
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
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'transactions' && (
        <div>
          {/* Search and Filter Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Plans</option>
                    {planOptions.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Transaction List */}
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const StatusIcon = getStatusIcon(payment.status);
              const PaymentMethodIcon = getPaymentMethodIcon(payment.paymentMethod);
              return (
                <div key={payment.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow px-4 py-3">
                  {/* Left: avatar + name */}
                  <div className="flex items-center space-x-3 min-w-[220px]">
                    {getMemberPhoto(payment._memberId) ? (
                      <img
                        src={getMemberPhoto(payment._memberId)}
                        alt={getMemberName(payment._memberId)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white leading-tight">{getMemberName(payment._memberId)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{payment.transactionId}</div>
                    </div>
                  </div>

                  {/* Middle: columns */}
                  <div className="hidden md:grid grid-cols-5 items-center flex-1 text-sm">
                    <div className="px-4 py-2 whitespace-nowrap text-left">
                      <div className="text-gray-500 dark:text-gray-400">Plan</div>
                      <div className="font-medium text-gray-900 dark:text-white">{resolvePlanName(payment)}</div>
                    </div>
                    <div className="px-4 py-2 text-center whitespace-nowrap">
                      <div className="text-gray-500 dark:text-gray-400">Amount</div>
                      <div className="font-bold text-green-600 text-center">{formatCurrency(payment.amount)}</div>
                    </div>
                    <div className="px-4 py-2 text-left whitespace-nowrap">
                      <div className="text-gray-500 dark:text-gray-400">Method</div>
                      <div className="inline-flex items-center space-x-1 font-medium text-gray-900 dark:text-white">
                        <PaymentMethodIcon className="w-4 h-4 text-gray-400" />
                        <span>{payment.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 text-center whitespace-nowrap">
                      <div className="text-gray-500 dark:text-gray-400">Date</div>
                      <div className="font-medium text-gray-900 dark:text-white text-center">{formatDate(getPaymentDate(payment))}</div>
                    </div>
                    <div className="px-4 py-2 text-center whitespace-nowrap">
                      <div className="text-gray-500 dark:text-gray-400">Status</div>
                      <div className="inline-flex items-center justify-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center justify-center space-x-2 ml-4 whitespace-nowrap">
                    <button 
                      onClick={() => handlePrint(payment)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                    <button className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {payment.status === 'failed' && (
                      <button className="p-2 border border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Payment</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
              </div>
              <form onSubmit={submitEditPayment} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input name="amount" type="number" defaultValue={editingPayment.amount} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Method</label>
                  <select name="paymentMethod" defaultValue={editingPayment.paymentMethod} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Credit Card</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Mobile Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select name="status" defaultValue={editingPayment.status} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Payment</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete payment <strong>{deletingPayment.transactionId || deletingPayment.id}</strong>?</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                <button onClick={confirmDeletePayment} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue Trends</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Top Paying Members</h3>
              </div>
              <div className="space-y-4">
                {[...safeMembers]
                  .map(m => {
                    const total = enhancedPayments
                      .filter(p => p._memberId === m.id && p.status === 'completed')
                      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                    return {
                      id: m.id,
                      name: m.first_name ? `${m.first_name} ${m.last_name || ''}`.trim() : (m.name || 'Unknown Member'),
                      total
                    };
                  })
                  .filter(x => x.total > 0)
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((row, index) => (
                    <div key={row.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <img
                          src={getMemberPhoto(row.id)}
                          alt={row.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">${row.total.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Payment Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Success Rate</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    95% of payments processed successfully
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-400">Popular Method</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Credit cards account for 60% of transactions
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800 dark:text-purple-400">Peak Days</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Month-end shows 40% increase in payments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPayments.length === 0 && viewMode === 'transactions' && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payments found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
      </div>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowAddPaymentModal(false)}
          onPaymentAdded={handleCreatePayment}
          memberOptions={memberOptions}
          planOptions={planOptions}
        />
      )}
      </ErrorBoundary>
    </div>
  );
};

export default Payments;
