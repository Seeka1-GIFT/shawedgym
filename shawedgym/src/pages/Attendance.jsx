import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
import { 
  ClipboardList, Search, Filter, Calendar, Users, 
  TrendingUp, Clock, CheckCircle, XCircle, 
  BarChart3, PieChart, Activity, Target,
  UserCheck, AlertTriangle, Award, Eye,
  Download, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import QuickActions from '../components/QuickActions.jsx';
import RelatedData from '../components/RelatedData.jsx';

/**
 * Modern Attendance Management System with analytics, tracking, and visual insights
 */
const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', 'analytics'
  const [backendAttendance, setBackendAttendance] = useState([]);
  const [backendMembers, setBackendMembers] = useState([]);
  const [backendClasses, setBackendClasses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [attRes, memRes, clsRes] = await Promise.all([
          apiService.getAttendance({ limit: 500 }),
          apiService.getMembers({ limit: 1000 }),
          apiService.getClasses(),
        ]);
        setBackendAttendance(attRes?.data?.attendance || attRes?.data || []);
        setBackendMembers(memRes?.data?.members || memRes?.data || []);
        setBackendClasses(clsRes?.data?.classes || clsRes?.data || []);
      } catch (e) {
        setBackendAttendance([]);
        setBackendMembers([]);
        setBackendClasses([]);
      }
    };
    load();
  }, []);

  // Enhanced attendance data with additional metrics
  const baseAttendance = backendAttendance.map(r => ({
    id: r.id,
    memberId: r.member_id,
    classId: r.class_id || 1,
    date: (r.check_in_time ? new Date(r.check_in_time).toISOString() : new Date().toISOString()).split('T')[0],
    status: 'present'
  }));

  const enhancedAttendanceData = baseAttendance.map(record => ({
    ...record,
    memberPhoto: `https://images.unsplash.com/photo-${
      record.memberId % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1494790108755-2616b612b47c'
    }?w=150&h=150&fit=crop&crop=face`,
    checkInTime: `${Math.floor(Math.random() * 3) + 6}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`,
    duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
    membershipType: record.memberId % 3 === 0 ? 'Premium' : record.memberId % 3 === 1 ? 'Standard' : 'Basic'
  }));

  const getMemberName = (memberId) => {
    const m = backendMembers.find((mem) => mem.id === memberId);
    if (!m) return 'Unknown Member';
    const first = m.first_name || m.firstName || '';
    const last = m.last_name || m.lastName || '';
    return (m.name || `${first} ${last}`.trim() || 'Unknown Member');
  };

  const getClassTitle = (classId) => {
    const c = backendClasses.find((cl) => cl.id === classId);
    return c ? (c.title || c.name) : 'Unknown Class';
  };

  const getMemberPhoto = (memberId) => {
    return `https://images.unsplash.com/photo-${
      memberId % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1494790108755-2616b612b47c'
    }?w=150&h=150&fit=crop&crop=face`;
  };

  const filteredAttendance = enhancedAttendanceData.filter(record => {
    const memberName = getMemberName(record.memberId);
    const className = getClassTitle(record.classId);
    
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesClass = filterClass === 'all' || record.classId.toString() === filterClass;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Calculate statistics
  const totalRecords = enhancedAttendanceData.length || 0;
  const totalPresent = enhancedAttendanceData.filter(r => r.status === 'present').length || 0;
  const totalDuration = enhancedAttendanceData.reduce((sum, r) => sum + (Number(r.duration) || 0), 0);
  const stats = {
    totalRecords,
    presentToday: enhancedAttendanceData.filter(r => r.date === selectedDate && r.status === 'present').length || 0,
    absentToday: enhancedAttendanceData.filter(r => r.date === selectedDate && r.status === 'absent').length || 0,
    attendanceRate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
    averageDuration: totalRecords > 0 ? Math.round(totalDuration / totalRecords) : 0,
    uniqueMembers: new Set(enhancedAttendanceData.map(r => r.memberId)).size
  };

  // Chart data
  const weeklyData = [
    { day: 'Mon', present: 45, absent: 5 },
    { day: 'Tue', present: 52, absent: 8 },
    { day: 'Wed', present: 48, absent: 7 },
    { day: 'Thu', present: 55, absent: 5 },
    { day: 'Fri', present: 62, absent: 8 },
    { day: 'Sat', present: 70, absent: 10 },
    { day: 'Sun', present: 35, absent: 5 }
  ];

  const classAttendanceData = backendClasses.map(cls => ({
    name: cls.title,
    attendance: enhancedAttendanceData.filter(r => r.classId === cls.id && r.status === 'present').length,
    capacity: parseInt(cls.capacity)
  }));

  const handleCheckIn = async (memberId) => {
    try {
      await apiService.createAttendance({ memberId });
      const res = await apiService.getAttendance({ limit: 500 });
      setBackendAttendance(res?.data?.attendance || res?.data || []);
    } catch (e) {
      console.error('Check-in failed', e);
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await apiService.updateAttendance(attendanceId, { checkOutTime: new Date().toISOString() });
      const res = await apiService.getAttendance({ limit: 500 });
      setBackendAttendance(res?.data?.attendance || res?.data || []);
    } catch (e) {
      console.error('Check-out failed', e);
    }
  };

  const membershipTypeData = [
    { name: 'Premium', value: enhancedAttendanceData.filter(r => r.membershipType === 'Premium' && r.status === 'present').length, color: '#8B5CF6' },
    { name: 'Standard', value: enhancedAttendanceData.filter(r => r.membershipType === 'Standard' && r.status === 'present').length, color: '#3B82F6' },
    { name: 'Basic', value: enhancedAttendanceData.filter(r => r.membershipType === 'Basic' && r.status === 'present').length, color: '#10B981' }
  ];
  // Avoid overlapping labels by removing zero-value slices
  const membershipPieData = membershipTypeData.filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Attendance Tracking
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Monitor member attendance, track patterns, and analyze engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecords}</p>
            </div>
            <ClipboardList className="w-6 h-6 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.presentToday}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.absentToday}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.attendanceRate}%</p>
            </div>
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageDuration}m</p>
            </div>
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueMembers}</p>
            </div>
            <Users className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Simplified UI - removed extra widgets per request */}

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
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  viewMode === 'detailed' 
                    ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Detailed
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

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Attendance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Attendance</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
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
                  <Bar dataKey="present" fill="#10B981" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#EF4444" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Membership Type Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance by Plan</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={membershipPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    paddingAngle={2}
                    minAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {membershipPieData.map((entry, index) => (
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
                    placeholder="Search attendance records..."
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
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Classes</option>
                    {backendClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={getMemberPhoto(record.memberId)}
                            alt={getMemberName(record.memberId)}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getMemberName(record.memberId)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {record.membershipType} Member
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getClassTitle(record.classId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{record.date}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{record.checkInTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{record.duration} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {record.status === 'present' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleCheckIn(record.memberId)} className="text-green-600 hover:text-green-900 dark:text-green-400">Check In</button>
                          <button onClick={() => handleCheckOut(record.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Check Out</button>
                        </div>
                      </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Class Attendance Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Class Attendance Analysis</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAttendanceData}>
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
                  <Bar dataKey="attendance" fill="#3B82F6" name="Attendance" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="#E5E7EB" name="Capacity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Top Attendees</h3>
              </div>
              <div className="space-y-4">
                {backendMembers.slice(0, 5).map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <img
                        src={getMemberPhoto(member.id)}
                        alt={getMemberName(member.id)}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{getMemberName(member.id)}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {Math.floor(Math.random() * 20) + 15} visits
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Peak Hours</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Most attendance between 6-8 PM (85% capacity)
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-400">Best Days</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Saturdays and Fridays show highest attendance
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800 dark:text-purple-400">Member Engagement</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Premium members attend 40% more frequently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAttendance.length === 0 && viewMode === 'detailed' && (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No attendance records found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;
