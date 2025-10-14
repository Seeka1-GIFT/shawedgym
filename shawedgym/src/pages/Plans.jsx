import React, { useState, useEffect } from 'react';
import { plans } from '../data/dummy.js';
import { apiService } from '../services/api.js';
import { 
  CreditCard, Plus, Search, Filter, Edit, Trash2, Users, 
  Calendar, CheckCircle, Crown, Award, Star,
  TrendingUp, Zap, Shield, Sparkles, Target
} from 'lucide-react';

/**
 * Modern Membership Plans Management with subscription features and analytics
 */
const Plans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [backendPlans, setBackendPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPlans();
      const apiPlans = Array.isArray(res?.data) ? res.data : res?.data?.plans || [];
      setBackendPlans(apiPlans);
    } catch (e) {
      setBackendPlans(plans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Base plans: prefer backend, fallback to dummy
  const sourcePlans = backendPlans.length ? backendPlans : plans;

  // Enhanced plans data with additional features
  const enhancedPlans = sourcePlans.map(plan => ({
    ...plan,
    subscribers: Math.floor(Math.random() * 50) + 10,
    popularityRank: Math.floor(Math.random() * 3) + 1,
    features: plan.id === 1 ? 
      ['Basic gym access', 'Locker room', 'Group classes', 'Free WiFi'] :
      plan.id === 2 ? 
      ['All Basic features', 'Personal trainer session', 'Nutrition consultation', 'Premium equipment'] :
      ['All Premium features', 'Unlimited personal training', 'Spa access', 'VIP lounge', '24/7 access'],
    discount: plan.id === 2 ? 15 : plan.id === 3 ? 25 : 0,
    mostPopular: plan.id === 2,
    category: plan.id === 1 ? 'Basic' : plan.id === 2 ? 'Premium' : 'VIP',
    color: plan.id === 1 ? 'blue' : plan.id === 2 ? 'purple' : 'gold',
    description: plan.id === 1 ? 
      'Perfect for beginners starting their fitness journey' :
      plan.id === 2 ? 
      'Our most popular plan with premium features' :
      'Ultimate luxury experience with all amenities'
  }));

  const filteredPlans = enhancedPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanIcon = (category) => {
    switch (category) {
      case 'Basic':
        return Shield;
      case 'Premium':
        return Star;
      case 'VIP':
        return Crown;
      default:
        return CreditCard;
    }
  };

  const getPlanGradient = (color) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-cyan-500';
      case 'purple':
        return 'from-purple-500 to-pink-500';
      case 'gold':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const stats = {
    totalPlans: enhancedPlans.length,
    totalSubscribers: enhancedPlans.reduce((sum, plan) => sum + plan.subscribers, 0)
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowEditModal(true);
  };

  const handleDeletePlan = (plan) => {
    setDeletingPlan(plan);
  };

  const confirmDeletePlan = async () => {
    try {
      if (deletingPlan?.id) {
        await apiService.deletePlan(deletingPlan.id);
        await fetchPlans();
      }
    } catch (e) {
      console.error('Delete plan failed', e);
    } finally {
      setDeletingPlan(null);
    }
  };

  const submitEditPlan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') || editingPlan.name,
      price: Number(formData.get('price')) || editingPlan.price,
      duration: Number(formData.get('duration')) || editingPlan.duration,
      description: formData.get('description') ?? editingPlan.description
    };
    try {
      if (editingPlan?.id) {
        const res = await apiService.updatePlan(editingPlan.id, payload);
        const updated = res?.data?.plan || { ...editingPlan, ...payload };
        setBackendPlans(prev => prev.map(p => (p.id === editingPlan.id ? updated : p)));
      }
      setShowEditModal(false);
      setEditingPlan(null);
    } catch (e) {
      console.error('Update plan failed', e);
    }
  };

  const submitCreatePlan = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPlan = {
      name: form.get('name') || '',
      price: Number(form.get('price')) || 0,
      duration: Number(form.get('duration')) || 1,
      description: form.get('description') || '',
      features: (form.get('features') || '')
        .split(',')
        .map(f => f.trim())
        .filter(Boolean)
    };
    try {
      await apiService.createPlan(newPlan);
      setShowAddModal(false);
      await fetchPlans();
    } catch (err) {
      console.error('Create plan failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Membership Plans
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Manage subscription plans and pricing strategies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPlans}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subscribers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSubscribers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Plans Table View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscribers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{plan.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{plan.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${plan.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{plan.duration} mo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{plan.subscribers}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xl truncate">{plan.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button onClick={() => handleEditPlan(plan)} className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg mr-2">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDeletePlan(plan)} className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No plans found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new plan</p>
        </div>
      )}

      {/* Compare Plans section removed per request */}

      {/* Create Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Plan</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">✕</button>
              </div>
              <form onSubmit={submitCreatePlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input name="name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                    <input name="price" type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (months)</label>
                    <input name="duration" type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea name="description" rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features (comma-separated)</label>
                  <input name="features" placeholder="e.g. Gym access, Locker room" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Plan</h2>
                <button onClick={() => { setShowEditModal(false); setEditingPlan(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  ✕
                </button>
              </div>
              <form onSubmit={submitEditPlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input name="name" defaultValue={editingPlan.name} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                    <input name="price" type="number" defaultValue={editingPlan.price} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (months)</label>
                    <input name="duration" type="number" defaultValue={editingPlan.duration} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea name="description" defaultValue={editingPlan.description} rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingPlan(null); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Update Plan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Plan</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete <strong>{deletingPlan.name}</strong>? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button onClick={() => setDeletingPlan(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                <button onClick={confirmDeletePlan} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
