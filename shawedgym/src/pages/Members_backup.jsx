import React, { useState, useEffect } from 'react';
import { members as allMembers, plans } from '../data/dummy.js';
import { apiService } from '../services/api.js';
import { 
  Users, Plus, Search, Filter, Download, Mail, Phone, 
  Calendar, CreditCard, AlertTriangle, CheckCircle, 
  Clock, Edit, Trash2, Eye, UserPlus, Star, MapPin,
  Activity, TrendingUp, Award
} from 'lucide-react';
import QuickActions from '../components/QuickActions.jsx';
import RelatedData from '../components/RelatedData.jsx';
import ContextualInsights from '../components/ContextualInsights.jsx';

/**
 * Modern Members Management System with advanced features and beautiful UI
 */
const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load members from API
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMembers({ search: searchTerm });
        setMembers(response.data.members || []);
        setError(null);
      } catch (error) {
        console.error('Failed to load members:', error);
        setError('Failed to load members. Using demo data.');
        // Fallback to dummy data
        setMembers(allMembers);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [searchTerm]);

  // Enhanced member data with photos and additional info
  const enhancedMembers = members.map(member => ({
    ...member,
    // Create full name from first_name and last_name for compatibility
    name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
    photo: `https://images.unsplash.com/photo-${
      member.id % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1494790108755-2616b612b47c'
    }?w=150&h=150&fit=crop&crop=face`,
    lastVisit: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalVisits: Math.floor(Math.random() * 100) + 20,
    membershipType: member.membership_type || 'Standard',
    address: member.address || 'Mogadishu, Somalia',
    emergencyContact: member.emergency_contact || '+252-61-999-8888',
    goals: ['Weight Loss', 'Muscle Gain', 'Fitness'],
    trainer: 'Ahmed Hassan',
    // Add missing fields for compatibility
    planId: Math.floor(Math.random() * 3) + 1,
    joinDate: member.created_at || new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }));

  const filteredMembers = enhancedMembers.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    const phone = m.phone || '';
    const searchLower = (searchTerm || '').toLowerCase();
    
    const matchesSearch = fullName.includes(searchLower) ||
                         email.includes(searchLower) ||
                         phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || (m.status && m.status.toLowerCase() === filterStatus.toLowerCase());
    const matchesPlan = filterPlan === 'all' || (m.planId && m.planId.toString() === filterPlan);
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getPlanName = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.name : '';
  };

  // Helper to calculate days until expiry; returns negative if expired.
  const daysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const exp = new Date(expiryDate);
    const diff = (exp - today) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const daysLeft = daysUntilExpiry(expiryDate);
    if (daysLeft <= 0) {
      return { color: 'text-red-600 dark:text-red-400', text: 'Expired', icon: AlertTriangle };
    } else if (daysLeft <= 7) {
      return { color: 'text-orange-600 dark:text-orange-400', text: `${daysLeft} days left`, icon: Clock };
    } else if (daysLeft <= 30) {
      return { color: 'text-yellow-600 dark:text-yellow-400', text: `${daysLeft} days left`, icon: Clock };
    } else {
      return { color: 'text-green-600 dark:text-green-400', text: `${daysLeft} days left`, icon: CheckCircle };
    }
  };

  const stats = {
    total: enhancedMembers.length,
    active: enhancedMembers.filter(m => m.status === 'active').length,
    expiringSoon: enhancedMembers.filter(m => {
      const days = daysUntilExpiry(m.expiryDate);
      return days > 0 && days <= 30;
    }).length,
    newThisMonth: enhancedMembers.filter(m => {
      const joinDate = new Date(m.joinDate);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Members Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Manage gym members, track memberships, and monitor activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.expiringSoon}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.newThisMonth}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions currentPage="members" />

      {/* Related Data */}
      <RelatedData currentPage="members" />

      {/* Smart Insights */}
      <ContextualInsights currentPage="members" />

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Plans</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Members Display */}
      {viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const expiryStatus = getExpiryStatus(member.expiryDate);
            const ExpiryIcon = expiryStatus.icon;
            
            return (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  {/* Member Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {member.id.toString().padStart(4, '0')}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{member.membershipType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{getPlanName(member.planId)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{member.joinDate}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <ExpiryIcon className={`w-4 h-4 ${expiryStatus.color}`} />
                      <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                      <span className={`font-medium ${expiryStatus.color}`}>{expiryStatus.text}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Last Visit:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{member.lastVisit}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Total Visits:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{member.totalVisits}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{member.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{member.address}</span>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Goals:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.goals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member) => {
                  const expiryStatus = getExpiryStatus(member.expiryDate);
                  const ExpiryIcon = expiryStatus.icon;
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {member.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{getPlanName(member.planId)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.membershipType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <ExpiryIcon className={`w-4 h-4 ${expiryStatus.color}`} />
                          <span className={`text-sm font-medium ${expiryStatus.color}`}>{expiryStatus.text}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.expiryDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{member.phone}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No members found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Members;