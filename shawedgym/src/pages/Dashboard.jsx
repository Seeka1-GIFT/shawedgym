import React, { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, Activity } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import { apiService } from '../services/api.js';
// ActivityFeed and membership pie removed to avoid runtime errors
// Removed dummy helpers to ensure DB-only data

/**
 * Modern Dashboard with enhanced visuals, gradients, and multiple chart types
 */
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setConnectionStatus('connecting');
        
        // Test connection first
        const healthCheck = await apiService.getHealth();
        console.log('✅ API Health Check:', healthCheck);
        
        // Load dashboard data (stats only)
        const response = await apiService.getDashboardStats();
        const d = response?.data || {};
        setDashboardData({
          totalMembers: Number(d.totalMembers) || 0,
          activeMembers: Number(d.activeMembers) || 0,
          checkedInMembers: Number(d.checkedInMembers) || 0,
          totalRevenue: Number(d.totalRevenue) || 0,
          monthlyRevenue: Number(d.monthlyRevenue) || 0,
          totalClasses: Number(d.totalClasses) || 0,
          activeEquipment: Number(d.activeEquipment) || 0,
          todayAttendance: Number(d.todayAttendance) || 0,
          totalExpenses: Number(d.totalExpenses) || 0
        });
        setConnectionStatus('connected');
        
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        setConnectionStatus('error');
        
        // Fallback: show zeros when API fails
        setDashboardData({
          totalMembers: 0,
          activeMembers: 0,
          checkedInMembers: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalClasses: 0,
          activeEquipment: 0,
          todayAttendance: 0,
          totalExpenses: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Status: {connectionStatus === 'connecting' ? '🔄 Connecting to API...' : 
                      connectionStatus === 'connected' ? '✅ Connected' : 
                      connectionStatus === 'error' ? '⚠️ Using fallback data' : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const safeNumber = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);

  const metrics = [
    { 
      title: 'Total Members', 
      value: safeNumber(dashboardData?.totalMembers), 
      icon: Users,
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      title: 'Active Members', 
      value: safeNumber(dashboardData?.activeMembers), 
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      title: 'Total Revenue', 
      value: `$${safeNumber(dashboardData?.totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      title: 'Members in Gym', 
      value: safeNumber(dashboardData?.checkedInMembers), 
      icon: Activity,
      gradient: "from-orange-500 to-red-500"
    },
  ];

  // simple inline bars (no recharts)

  // membership pie removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening at ShawedGym today.</p>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map(({ title, value, icon, gradient }) => (
          <StatCard 
            key={title} 
            title={title} 
            value={value} 
            icon={icon}
            gradient={gradient}
          />
        ))}
      </div>

      {/* Simple summaries instead of charts for stability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Revenue vs Expenses</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Revenue</div>
              <div className="h-3 bg-blue-200 rounded">
                <div className="h-3 bg-blue-600 rounded" style={{ width: `${Math.min(100, safeNumber(dashboardData?.totalRevenue) ? 100 : 0)}%` }} />
              </div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">${safeNumber(dashboardData?.totalRevenue).toLocaleString()}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Expenses</div>
              <div className="h-3 bg-red-200 rounded">
                <div className="h-3 bg-red-600 rounded" style={{ width: `${Math.min(100, safeNumber(dashboardData?.totalExpenses) ? 100 : 0)}%` }} />
              </div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">${safeNumber(dashboardData?.totalExpenses).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Today</h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div>Attendance: {safeNumber(dashboardData?.todayAttendance)}</div>
            <div>Classes: {safeNumber(dashboardData?.totalClasses)}</div>
            <div>Active Equipment: {safeNumber(dashboardData?.activeEquipment)}</div>
            <div>Monthly Revenue: ${safeNumber(dashboardData?.monthlyRevenue).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* No extra widgets to avoid runtime errors */}
    </div>
  );
};

export default Dashboard;
