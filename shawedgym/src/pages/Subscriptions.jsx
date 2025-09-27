import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  Calendar, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useGym } from '../contexts/GymContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

const Subscriptions = () => {
  const { showSuccess, showError } = useToast();
  const { currentGym, getCurrentGymId } = useGym();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    max_members: '',
    features: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse, usageResponse] = await Promise.all([
        apiService.getSubscriptionPlans(),
        apiService.getGymSubscription().catch(() => null),
        apiService.getSubscriptionUsage().catch(() => null)
      ]);

      if (plansResponse.success) {
        setPlans(plansResponse.data.plans);
      }

      if (subscriptionResponse?.success) {
        setCurrentSubscription(subscriptionResponse.data.subscription);
      }

      if (usageResponse?.success) {
        setUsage(usageResponse.data.usage);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      showError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createSubscriptionPlan(formData);
      if (response.success) {
        showSuccess('Subscription plan created successfully');
        setShowCreateModal(false);
        setFormData({ name: '', price: '', max_members: '', features: [] });
        loadData();
      }
    } catch (error) {
      showError('Failed to create subscription plan');
    }
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.updateSubscriptionPlan(editingPlan.id, formData);
      if (response.success) {
        showSuccess('Subscription plan updated successfully');
        setShowEditModal(false);
        setEditingPlan(null);
        setFormData({ name: '', price: '', max_members: '', features: [] });
        loadData();
      }
    } catch (error) {
      showError('Failed to update subscription plan');
    }
  };

  const handleDeletePlan = async (plan) => {
    if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      try {
        const response = await apiService.deleteSubscriptionPlan(plan.id);
        if (response.success) {
          showSuccess('Subscription plan deleted successfully');
          loadData();
        }
      } catch (error) {
        showError('Failed to delete subscription plan');
      }
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const response = await apiService.subscribeGym({ plan_id: planId });
      if (response.success) {
        showSuccess('Successfully subscribed to plan');
        loadData();
      }
    } catch (error) {
      showError('Failed to subscribe to plan');
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        const response = await apiService.cancelSubscription();
        if (response.success) {
          showSuccess('Subscription cancelled successfully');
          loadData();
        }
      } catch (error) {
        showError('Failed to cancel subscription');
      }
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      max_members: plan.max_members,
      features: Array.isArray(plan.features) ? plan.features : []
    });
    setShowEditModal(true);
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Star className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Zap className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'premium':
        return 'from-purple-500 to-purple-600';
      case 'enterprise':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your gym's subscription plans and billing
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Plan</span>
          </button>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-gradient-to-r ${getPlanColor(currentSubscription.plan_name)} rounded-lg text-white`}>
                  {getPlanIcon(currentSubscription.plan_name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentSubscription.plan_name} Plan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ${currentSubscription.plan_price}/month
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Expires: {new Date(currentSubscription.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  Active
                </span>
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usage.active_members}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Usage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usage.usage_percentage}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usage.remaining_members}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative ${
                currentSubscription?.plan_id === plan.id
                  ? 'ring-2 ring-green-500'
                  : ''
              }`}
            >
              {currentSubscription?.plan_id === plan.id && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                    Current
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-3 bg-gradient-to-r ${getPlanColor(plan.name)} rounded-lg text-white mb-4`}>
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Up to {plan.max_members} members
                  </span>
                </div>
                {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {currentSubscription?.plan_id === plan.id ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Subscribe
                  </button>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="flex-1 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Plan Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Plan</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Basic, Premium, Enterprise"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="29.99"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Members *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="100"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Create Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Plan Modal */}
        {showEditModal && editingPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Plan</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleEditPlan} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Members *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Update Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Subscriptions;
