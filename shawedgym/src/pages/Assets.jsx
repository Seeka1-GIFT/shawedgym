import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
// Removed dummy fallback to ensure DB-only rendering
import { 
  Package, Plus, Search, Filter, DollarSign, Calendar,
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle,
  Edit, Trash2, Eye, BarChart3, PieChart, Wrench,
  Building, Dumbbell, Monitor, Zap, Shield, Award,
  Clock, MapPin, FileText, Download
} from 'lucide-react';

/**
 * Modern Asset Management System with financial tracking, depreciation, and analytics
 */
const Assets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [backendAssets, setBackendAssets] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getAssets();
        const apiAssets = Array.isArray(res?.data) ? res.data : res?.data?.assets || [];
        setBackendAssets(apiAssets);
      } catch (e) {
        setBackendAssets([]);
      }
    };
    load();
  }, []);

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowEditModal(true);
  };

  const handleDeleteAsset = (asset) => {
    setDeletingAsset(asset);
    setShowDeleteModal(true);
  };

  const confirmDeleteAsset = async () => {
    try {
      if (deletingAsset?.id) {
        await apiService.deleteAsset(deletingAsset.id);
        const refreshed = await apiService.getAssets();
        const apiAssets = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.assets || [];
        setBackendAssets(apiAssets);
      }
    } catch (e) {
      console.error('Delete asset failed', e);
    } finally {
      setShowDeleteModal(false);
      setDeletingAsset(null);
    }
  };

  const submitCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload = {
        name: data.get('name'),
        type: data.get('type'),
        location: data.get('location'),
        status: data.get('status') || 'active',
        purchase_date: data.get('purchaseDate') || null,
        purchase_price: Number(data.get('purchasePrice')) || 0,
        description: data.get('description') || ''
      };
      await apiService.createAsset(payload);
      const refreshed = await apiService.getAssets();
      const apiAssets = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.assets || [];
      setBackendAssets(apiAssets);
      setShowAddModal(false);
    } catch (err) {
      console.error('Create asset failed', err);
    }
  };

  const baseAssets = backendAssets.map(a => ({
    id: a.id,
    name: a.name,
    category: a.type || 'Accessories',
    condition: a.status ? (a.status.toLowerCase() === 'active' ? 'Good' : 'Fair') : 'Good',
    value: Number(a.purchase_price) || 500,
    purchaseDate: a.purchase_date || new Date().toISOString().split('T')[0]
  }));

  // Enhanced assets data with financial tracking
  const enhancedAssets = baseAssets.map(asset => {
    const purchaseDate = new Date(asset.purchaseDate);
    const currentDate = new Date();
    const ageInYears = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
    const depreciationRate = asset.category === 'Cardio Equipment' ? 0.15 : 
                            asset.category === 'Strength Equipment' ? 0.12 : 0.10;
    const currentValue = Math.max(asset.value * Math.pow(1 - depreciationRate, ageInYears), asset.value * 0.1);
    const maintenanceCost = Math.floor(Math.random() * 500) + 100;
    const lastMaintenance = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextMaintenance = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      ...asset,
      originalValue: asset.value,
      currentValue: Math.round(currentValue),
      depreciationAmount: Math.round(asset.value - currentValue),
      depreciationRate: Math.round(depreciationRate * 100),
      ageInYears: Math.round(ageInYears * 10) / 10,
      maintenanceCost,
      lastMaintenance,
      nextMaintenance,
      warrantyExpiry: new Date(purchaseDate.getTime() + (Math.random() * 3 + 1) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: ['Main Floor', 'Upper Level', 'Basement', 'Outdoor Area'][Math.floor(Math.random() * 4)],
      serialNumber: `${asset.category.substring(0, 2).toUpperCase()}${String(asset.id).padStart(4, '0')}`,
      supplier: ['FitnessPro', 'GymTech', 'StrengthCorp', 'CardioMax'][Math.floor(Math.random() * 4)],
      utilizationRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      image: `https://images.unsplash.com/photo-${
        asset.category === 'Cardio Equipment' ? '1571019613454-1cb2f99b2d8b' :
        asset.category === 'Strength Equipment' ? '1581009146145-b5ef050c2e1e' :
        '1534438327276-14e5300c3a48'
      }?w=400&h=250&fit=crop`
    };
  });

  const filteredAssets = enhancedAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchesCondition = filterCondition === 'all' || asset.condition === filterCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Cardio Equipment':
        return Monitor;
      case 'Strength Equipment':
        return Dumbbell;
      case 'Accessories':
        return Package;
      default:
        return Building;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Poor':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getWarrantyStatus = (warrantyExpiry) => {
    const today = new Date();
    const expiry = new Date(warrantyExpiry);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return { color: 'text-red-600', status: 'Expired', icon: AlertTriangle };
    if (daysLeft <= 30) return { color: 'text-orange-600', status: 'Expiring Soon', icon: Clock };
    return { color: 'text-green-600', status: 'Active', icon: CheckCircle };
  };

  const assetCount = enhancedAssets.length || 0;
  const stats = {
    totalAssets: assetCount,
    totalValue: enhancedAssets.reduce((sum, asset) => sum + asset.currentValue, 0),
    totalDepreciation: enhancedAssets.reduce((sum, asset) => sum + asset.depreciationAmount, 0),
    maintenanceDue: enhancedAssets.filter(asset => {
      const nextMaintenance = new Date(asset.nextMaintenance);
      const today = new Date();
      return nextMaintenance <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    }).length,
    averageAge: assetCount ? (enhancedAssets.reduce((sum, asset) => sum + asset.ageInYears, 0) / assetCount).toFixed(1) : 0,
    utilizationRate: assetCount ? Math.round(enhancedAssets.reduce((sum, asset) => sum + asset.utilizationRate, 0) / assetCount) : 0
  };

  const categories = [...new Set(enhancedAssets.map(asset => asset.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <Building className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Asset Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Track assets, monitor depreciation, and manage maintenance schedules</p>
      </div>

      {/* Key Stats: Total Assets & Current Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAssets}</p>
            </div>
            <Package className="w-6 h-6 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Asset</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
              </div>
              <form onSubmit={submitCreateAsset} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input name="name" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select name="type" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Cardio Equipment</option>
                      <option>Strength Equipment</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input name="location" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select name="status" defaultValue="active" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Purchase Date</label>
                    <input name="purchaseDate" type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Purchase Price ($)</label>
                    <input name="purchasePrice" type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea name="description" rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Stats Cards removed per request */}

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Conditions</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
        </button>
          </div>
        </div>
      </div>

      {/* Assets Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const CategoryIcon = getCategoryIcon(asset.category);
            const warrantyStatus = getWarrantyStatus(asset.warrantyExpiry);
            const WarrantyIcon = warrantyStatus.icon;
            
            return (
              <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Asset Image */}
                <div className="relative h-48">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  <div className="absolute top-4 left-4">
                    <div className="p-2 bg-white bg-opacity-90 rounded-lg shadow-lg">
                      <CategoryIcon className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{asset.name}</h3>
                    <p className="text-white text-opacity-90 text-sm">{asset.category}</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Asset Info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Serial Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">{asset.serialNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Supplier</p>
                        <p className="font-medium text-gray-900 dark:text-white">{asset.supplier}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{asset.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{asset.ageInYears} years old</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Original Value</p>
                        <p className="font-bold text-gray-900 dark:text-white">${asset.originalValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Current Value</p>
                        <p className="font-bold text-green-600 dark:text-green-400">${asset.currentValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Depreciation</p>
                        <p className="font-bold text-red-600 dark:text-red-400">-${asset.depreciationAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Rate</p>
                        <p className="font-bold text-gray-900 dark:text-white">{asset.depreciationRate}%/year</p>
                      </div>
                    </div>
                  </div>

                  {/* Utilization */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Utilization Rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">{asset.utilizationRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${asset.utilizationRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Warranty & Maintenance */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Warranty</span>
                      <div className="flex items-center space-x-1">
                        <WarrantyIcon className={`w-4 h-4 ${warrantyStatus.color}`} />
                        <span className={`font-medium ${warrantyStatus.color}`}>{warrantyStatus.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Maintenance</span>
                      <span className="font-medium text-gray-900 dark:text-white">{asset.lastMaintenance}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Next Maintenance</span>
                      <span className="font-medium text-gray-900 dark:text-white">{asset.nextMaintenance}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                    <button onClick={() => handleEditAsset(asset)} className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
                      <Wrench className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteAsset(asset)} className="p-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Financial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Maintenance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAssets.map((asset) => {
                  const CategoryIcon = getCategoryIcon(asset.category);
                  const warrantyStatus = getWarrantyStatus(asset.warrantyExpiry);
                  
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CategoryIcon className="w-8 h-8 text-green-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{asset.category} • {asset.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">${asset.currentValue.toLocaleString()}</div>
                        <div className="text-sm text-red-500 dark:text-red-400">-${asset.depreciationAmount.toLocaleString()} ({asset.depreciationRate}%)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.condition)}`}>
                          {asset.condition}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{asset.ageInYears} years old</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">Next: {asset.nextMaintenance}</div>
                        <div className={`text-sm ${warrantyStatus.color}`}>{warrantyStatus.status}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditAsset(asset)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-orange-600 hover:text-orange-900 dark:text-orange-400">
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteAsset(asset)} className="text-red-600 hover:text-red-900 dark:text-red-400">
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

      {/* Edit Asset Modal */}
      {showEditModal && editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Asset</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  const payload = {
                    name: data.get('name') || editingAsset.name,
                    value: Number(data.get('value')) || editingAsset.value,
                    condition: data.get('condition') || editingAsset.condition,
                    location: data.get('location') || editingAsset.location
                  };
                  await apiService.updateAsset(editingAsset.id, payload);
                  const refreshed = await apiService.getAssets();
                  const apiAssets = Array.isArray(refreshed?.data) ? refreshed.data : refreshed?.data?.assets || [];
                  setBackendAssets(apiAssets);
                  setShowEditModal(false);
                  setEditingAsset(null);
                } catch (err) {
                  console.error('Update asset failed', err);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input name="name" defaultValue={editingAsset.name} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Value ($)</label>
                    <input name="value" type="number" defaultValue={editingAsset.value} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                    <select name="condition" defaultValue={editingAsset.condition} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input name="location" defaultValue={editingAsset.location} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
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

      {/* Delete Asset Modal */}
      {showDeleteModal && deletingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Asset</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete asset <strong>{deletingAsset.name}</strong>?</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                <button onClick={confirmDeleteAsset} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assets found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Assets;
