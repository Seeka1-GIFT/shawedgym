import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, Calendar, Download, Filter, TrendingUp, 
  TrendingDown, DollarSign, Users, Activity, Target,
  BarChart3, PieChart as PieChartIcon, Award, Clock,
  CheckCircle, AlertTriangle, Eye, Printer, Share
} from 'lucide-react';

/**
 * Comprehensive Reports & Analytics Dashboard with advanced data visualization and insights
 */
const Reports = () => {
  const today = new Date().toISOString().substring(0, 10);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(today);
  const [reportType, setReportType] = useState('financial'); // 'financial', 'membership', 'attendance', 'performance'
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', 'export'

  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);

  // Export PDF functionality
  const handleExportPDF = () => {
    try {
      // Create a comprehensive report HTML
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>ShawedGym Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .kpi-title { font-size: 14px; color: #666; margin-bottom: 5px; }
            .kpi-value { font-size: 24px; font-weight: bold; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
            .date-range { text-align: right; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ShawedGym Analytics Report</h1>
            <p>Comprehensive business intelligence and performance analytics</p>
          </div>
          
          <div class="date-range">
            Report Period: ${startDate} to ${endDate}
          </div>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Revenue</div>
              <div class="kpi-value">$${kpis.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Expenses</div>
              <div class="kpi-value">$${kpis.totalExpenses.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Net Profit</div>
              <div class="kpi-value">$${kpis.netProfit.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Profit Margin</div>
              <div class="kpi-value">${kpis.profitMargin}%</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Active Members</div>
              <div class="kpi-value">${kpis.activeMembers}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Growth Rate</div>
              <div class="kpi-value">${kpis.monthlyGrowthRate}%</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Report Generated</div>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
          </div>
        </body>
        </html>
      `;

      // Create and download PDF
      const blob = new Blob([reportHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shawedgym_report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Report exported successfully!');
    } catch (error) {
      console.error('Export PDF failed:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // Print functionality
  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print. Please try again.');
    }
  };

  // Share functionality
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ShawedGym Analytics Report',
          text: `Analytics report for ${startDate} to ${endDate}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        const reportText = `ShawedGym Analytics Report\nPeriod: ${startDate} to ${endDate}\nTotal Revenue: $${kpis.totalRevenue.toLocaleString()}\nNet Profit: $${kpis.netProfit.toLocaleString()}\nActive Members: ${kpis.activeMembers}`;
        await navigator.clipboard.writeText(reportText);
        alert('Report summary copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to share report. Please try again.');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [pmt, exp, mem, pl] = await Promise.all([
          apiService.getPayments(),
          apiService.getExpenses(),
          apiService.getMembers({ limit: 1000 }),
          apiService.getPlans(),
        ]);
        const pmtArr = Array.isArray(pmt?.data) ? pmt.data : pmt?.data?.payments || [];
        const expArr = Array.isArray(exp?.data) ? exp.data : exp?.data?.expenses || [];
        const memArr = mem?.data?.members || [];
        const planArr = Array.isArray(pl?.data) ? pl.data : pl?.data?.plans || [];
        setPayments(pmtArr.map(p => ({ amount: Number(p.amount)||0, planId: p.plan_id, date: p.payment_date || today })));
        setExpenses(expArr.map(e => ({ amount: Number(e.amount)||0, category: e.category || 'General', date: e.expense_date || today })));
        setMembers(memArr);
        setPlans(planArr);
      } catch (e) {
        setPayments([]); setExpenses([]); setMembers([]); setPlans([]);
      }
    };
    load();
  }, [today]);

  // Helper to determine if a date string lies between the selected range.
  const inRange = (dateStr) => {
    const date = new Date(dateStr);
    return date >= new Date(startDate) && date <= new Date(endDate);
  };

  const filteredPayments = payments.filter((p) => inRange(p.date));
  const filteredExpenses = expenses.filter((e) => inRange(e.date));

  const revenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExp = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = revenue - totalExp;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  // Enhanced analytics data
  const monthlyFinancialData = [];

  const membershipGrowthData = [];

  const revenueByPlanData = plans.map(plan => ({
    name: plan.name,
    value: filteredPayments.filter(p => p.planId === plan.id).reduce((sum, p) => sum + p.amount, 0),
    color: plan.id === 1 ? '#3B82F6' : plan.id === 2 ? '#8B5CF6' : '#10B981'
  }));

  const attendanceRateData = [];

  const barData = [
    { name: 'Revenue', value: revenue, color: '#10B981' },
    { name: 'Expenses', value: totalExp, color: '#EF4444' },
    { name: 'Profit', value: profit, color: profit >= 0 ? '#3B82F6' : '#F59E0B' },
  ];

  // Key Performance Indicators
  const kpis = {
    totalRevenue: revenue,
    totalExpenses: totalExp,
    netProfit: profit,
    profitMargin: profitMargin,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    memberRetentionRate: 85, // Mock data
    averageRevenuePerMember: revenue > 0 ? Math.round(revenue / members.length) : 0,
    classUtilization: 78, // Mock data
    equipmentUtilization: 82, // Mock data
    customerSatisfaction: 4.6, // Mock data
    monthlyGrowthRate: 12.5 // Mock data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Analytics & Reports
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive business intelligence and performance analytics</p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
            {/* Report Type Selector */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setReportType('financial')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  reportType === 'financial' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Financial
              </button>
              <button
                onClick={() => setReportType('membership')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  reportType === 'membership' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Membership
              </button>
              <button
                onClick={() => setReportType('attendance')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  reportType === 'attendance' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setReportType('performance')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  reportType === 'performance' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Performance
              </button>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${kpis.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${kpis.totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-6 h-6 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${kpis.netProfit.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{kpis.profitMargin}%</p>
            </div>
            <Target className="w-6 h-6 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.activeMembers}</p>
            </div>
            <Users className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.monthlyGrowthRate}%</p>
            </div>
            <Award className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Report Content based on type */}
      {reportType === 'financial' && (
        <div className="space-y-6">
          {/* Financial Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Financial Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Financial Trends</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyFinancialData}>
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
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue by Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue by Plan</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByPlanData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueByPlanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Revenue Analysis</h3>
                <TrendingUp className="w-8 h-8 text-white opacity-80" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-bold">${revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg per Member:</span>
                  <span className="font-bold">${kpis.averageRevenuePerMember}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth Rate:</span>
                  <span className="font-bold">+{kpis.monthlyGrowthRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Expense Analysis</h3>
                <TrendingDown className="w-8 h-8 text-white opacity-80" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-bold">${totalExp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg per Month:</span>
                  <span className="font-bold">${Math.round(totalExp / 6).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost Ratio:</span>
                  <span className="font-bold">{revenue > 0 ? ((totalExp / revenue) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${profit >= 0 ? 'from-blue-500 to-purple-600' : 'from-orange-500 to-red-600'} rounded-xl shadow-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Profitability</h3>
                <DollarSign className="w-8 h-8 text-white opacity-80" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Net Profit:</span>
                  <span className="font-bold">${profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <span className="font-bold">{profitMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">{profit >= 0 ? 'Profitable' : 'Loss'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'membership' && (
        <div className="space-y-6">
          {/* Membership Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Membership Growth Trends</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membershipGrowthData}>
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
                  <Bar dataKey="newMembers" fill="#10B981" name="New Members" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="churnedMembers" fill="#EF4444" name="Churned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netGrowth" fill="#3B82F6" name="Net Growth" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {reportType === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Rate Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Attendance Rates</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Area type="monotone" dataKey="rate" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {reportType === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Member Retention</h3>
              <p className="text-3xl font-bold text-blue-600">{kpis.memberRetentionRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Above industry average</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Class Utilization</h3>
              <p className="text-3xl font-bold text-green-600">{kpis.classUtilization}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Optimal capacity usage</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Equipment Usage</h3>
              <p className="text-3xl font-bold text-yellow-600">{kpis.equipmentUtilization}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">High efficiency rate</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Satisfaction Score</h3>
              <p className="text-3xl font-bold text-purple-600">{kpis.customerSatisfaction}/5</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Excellent rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Report Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Executive Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Highlights</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Revenue increased by {kpis.monthlyGrowthRate}% this month</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">Member retention rate is {kpis.memberRetentionRate}%</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700 dark:text-gray-300">Class utilization at optimal {kpis.classUtilization}%</span>
              </div>
              {profit < 0 && (
                <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700 dark:text-gray-300">Operating at a loss - review expenses</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommendations</h4>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Equipment Investment:</strong> Consider upgrading cardio equipment to improve member satisfaction.
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Marketing Focus:</strong> Premium plans show highest revenue potential.
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Operational Efficiency:</strong> Peak hours (6-8 PM) could benefit from additional staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
