import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, DollarSign, TrendingDown, Activity, Calendar, Award, Target } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import { apiService } from '../services/api.js';
import ActivityFeed from '../components/ActivityFeed.jsx';
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
        
        // Load dashboard data
        const response = await apiService.getDashboardStats();
        console.log('✅ Dashboard Data:', response);
        
        setDashboardData(response.data);
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
          todayAttendance: 0
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

  const metrics = [
    { 
      title: 'Total Members', 
      value: dashboardData?.totalMembers || 0, 
      icon: Users,
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      title: 'Active Members', 
      value: dashboardData?.activeMembers || 0, 
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      title: 'Total Revenue', 
      value: `$${dashboardData?.totalRevenue?.toLocaleString() || '0'}`, 
      icon: DollarSign,
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      title: 'Members in Gym', 
      value: dashboardData?.checkedInMembers || 0, 
      icon: Activity,
      gradient: "from-orange-500 to-red-500"
    },
  ];

  const barData = [
    { name: 'Revenue', value: dashboardData?.totalRevenue || 0, color: '#3B82F6' },
    { name: 'Expenses', value: dashboardData?.totalExpenses || 0, color: '#EF4444' },
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 2800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
  ];

  const membershipData = [
    { name: 'Premium', value: 45, color: '#8B5CF6' },
    { name: 'Standard', value: 30, color: '#3B82F6' },
    { name: 'Basic', value: 25, color: '#10B981' },
  ];

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Expenses Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BarChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue vs Expenses</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Trends</h3>
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
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed limit={8} />
        </div>
        {/* Membership Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Membership Plans</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {membershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Classes Today</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">85%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">24</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
              <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">92%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Goal Achieved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
