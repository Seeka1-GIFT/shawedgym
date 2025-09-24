import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, Users, TrendingUp, Search, QrCode, Camera, CheckCircle, LogOut, LogIn } from 'lucide-react';
import { apiService } from '../services/api.js';

/**
 * Member Check-in/out System - Real-time member tracking and attendance
 */
const CheckIn = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyInGym, setCurrentlyInGym] = useState([]);
  const [todayStats, setTodayStats] = useState({
    totalCheckIns: 0,
    currentlyInside: 0,
    peakHour: '6:00 PM',
    averageStayTime: '1.5 hours'
  });

  // Members from backend
  const [members, setMembers] = useState([]);

  // Load from backend
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await apiService.getMembers({ limit: 200 });
        const apiMembers = res?.data?.members || [];
        const formatted = apiMembers.map((m) => ({
          id: m.id,
          name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
          membershipId: `MEM${String(m.id).padStart(3, '0')}`,
          photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.first_name || 'M')}${encodeURIComponent(m.last_name || 'U')}`,
          membershipType: m.membership_type || 'Standard',
          status: (m.status || 'Active').toLowerCase(),
          phone: m.phone || ''
        }));
        setMembers(formatted);
      } catch (e) {
        console.error('Load members failed', e);
      }
    };

    const loadAttendance = async () => {
      try {
        const res = await apiService.getAttendance({ limit: 500 });
        const records = res?.data?.attendance || [];
        const inside = records
          .filter((a) => !a.check_out_time)
          .map((a) => ({
            attendanceId: a.id,
            memberId: a.member_id,
            name: `${a.first_name || ''} ${a.last_name || ''}`.trim() || `MEM${String(a.member_id).padStart(3, '0')}`,
            checkInTime: a.check_in_time,
            membershipType: 'Member',
            photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.first_name || 'M')}${encodeURIComponent(a.last_name || 'U')}`
          }));

        // Stats for today
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const totalToday = records.filter((r) => new Date(r.check_in_time) >= start).length;

        setCurrentlyInGym(inside);
        setTodayStats((prev) => ({
          ...prev,
          totalCheckIns: totalToday,
          currentlyInside: inside.length
        }));
      } catch (e) {
        console.error('Load attendance failed', e);
      }
    };

    loadMembers();
    loadAttendance();
  }, []);

  const handleCheckIn = async (member) => {
    try {
      const res = await apiService.createAttendance({ memberId: member.id });
      const att = res?.data?.attendance;
      const newEntry = {
        attendanceId: att?.id,
        memberId: member.id,
        name: member.name,
        checkInTime: att?.check_in_time || new Date().toISOString(),
        membershipType: member.membershipType,
        photo: member.photo
      };
      setCurrentlyInGym((prev) => [...prev, newEntry]);
      setTodayStats((prev) => ({
        ...prev,
        totalCheckIns: prev.totalCheckIns + 1,
        currentlyInside: prev.currentlyInside + 1
      }));
    } catch (e) {
      console.error('Check-in failed', e);
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      const entry = currentlyInGym.find((e) => e.memberId === memberId);
      if (entry?.attendanceId) {
        await apiService.updateAttendance(entry.attendanceId, { checkOutTime: new Date().toISOString() });
      }
      setCurrentlyInGym((prev) => prev.filter((e) => e.memberId !== memberId));
      setTodayStats((prev) => ({ ...prev, currentlyInside: Math.max(0, prev.currentlyInside - 1) }));
    } catch (e) {
      console.error('Check-out failed', e);
    }
  };

  const getTimeInGym = (checkInTime) => {
    const now = new Date();
    const checkIn = new Date(checkInTime);
    const diffMs = now - checkIn;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone || '').includes(searchTerm)
  );

  const isCheckedIn = (memberId) => {
    return currentlyInGym.some(entry => entry.memberId === memberId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Member Check-In/Out
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Real-time member attendance tracking system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Check-ins</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayStats.totalCheckIns}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Currently Inside</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayStats.currentlyInside}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.peakHour}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Stay Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.averageStayTime}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Search and Check-in */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Member Check-In</h2>
            <div className="flex space-x-2">
              <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                <QrCode className="w-4 h-4" />
              </button>
              <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Member List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-4">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.membershipId} • {member.membershipType}</p>
                  </div>
                </div>
                
                {isCheckedIn(member.id) ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Checked In</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn(member)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Check In</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Currently in Gym */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Currently in Gym</h2>
          
          {currentlyInGym.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No members currently checked in</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentlyInGym.map((entry) => (
                <div key={entry.memberId} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-4">
                    <img
                      src={entry.photo}
                      alt={entry.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{entry.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.membershipType} • {getTimeInGym(entry.checkInTime)} in gym
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCheckOut(entry.memberId)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check Out</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
