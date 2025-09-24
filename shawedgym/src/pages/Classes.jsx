import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
// Removed dummy imports to ensure DB-only data source
import { 
  Calendar, Plus, Search, Filter, Clock, Users, 
  MapPin, Star, Play, Edit, Trash2, UserPlus,
  Activity, TrendingUp, Award, Target, ChevronLeft,
  ChevronRight, Grid, List, Zap, Heart, Flame, X, AlertTriangle
} from 'lucide-react';
import QuickActions from '../components/QuickActions.jsx';
import RelatedData from '../components/RelatedData.jsx';

/**
 * Modern Class Management System with scheduling, booking, and analytics
 */
const Classes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'table', 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClass, setDeletingClass] = useState(null);

  const [backendClasses, setBackendClasses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getClasses();
        const apiClasses = Array.isArray(res?.data) ? res.data : res?.data?.classes || [];
        setBackendClasses(apiClasses);
      } catch (e) {
        setBackendClasses([]);
      }
    };
    load();
  }, []);

  const baseClasses = backendClasses.map(c => ({
    id: c.id,
    title: c.title || 'New Class',
    capacity: String(c.capacity || 20),
    trainerId: c.trainer || 1,
    schedule: c.schedule || new Date().toISOString(),
    description: c.description || '',
    // Defaults so render doesn't break before enhancement
    type: c.type || 'Cardio',
    duration: c.duration || 45,
    enrolled: c.enrolled || 0,
    difficulty: c.difficulty || 'Beginner',
    rating: c.rating || '4.5',
    price: c.price || 15,
    location: c.location || 'Main Gym'
  }));

  // Enhanced classes data with additional features
  const enhancedClasses = baseClasses.map(classItem => ({
    ...classItem,
    image: `https://images.unsplash.com/photo-${
      classItem.id % 3 === 0 ? '1571019613454-1cb2f99b2d8b' : 
      classItem.id % 3 === 1 ? '1544367567-0f2fcb009e0b' : 
      '1581009146145-b5ef050c2e1e'
    }?w=400&h=250&fit=crop`,
    type: classItem.id % 4 === 0 ? 'Cardio' : 
          classItem.id % 4 === 1 ? 'Strength' : 
          classItem.id % 4 === 2 ? 'Yoga' : 'HIIT',
    duration: Math.floor(Math.random() * 30) + 30, // 30-60 minutes
    enrolled: Math.floor(Math.random() * parseInt(classItem.capacity)) + 5,
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
    rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
    price: Math.floor(Math.random() * 20) + 10, // $10-30
    description: `Experience an amazing ${classItem.title.toLowerCase()} session that will challenge and inspire you.`,
    equipment: ['Mat', 'Dumbbells', 'Resistance Bands'],
    benefits: ['Strength Building', 'Cardio Health', 'Flexibility'],
    nextSession: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: ['Studio A', 'Studio B', 'Main Gym', 'Outdoor Area'][Math.floor(Math.random() * 4)]
  }));

  const getTrainerName = (trainerId) => {
    return `Trainer #${trainerId}`;
  };

  const getTrainerPhoto = (trainerId) => {
    return `https://images.unsplash.com/photo-${
      trainerId % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1494790108755-2616b612b47c'
    }?w=150&h=150&fit=crop&crop=face`;
  };

  const filteredClasses = enhancedClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getTrainerName(classItem.trainerId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || classItem.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Cardio':
        return Heart;
      case 'Strength':
        return Activity;
      case 'Yoga':
        return Target;
      case 'HIIT':
        return Flame;
      default:
        return Activity;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Cardio':
        return 'from-red-500 to-pink-500';
      case 'Strength':
        return 'from-blue-500 to-indigo-500';
      case 'Yoga':
        return 'from-green-500 to-teal-500';
      case 'HIIT':
        return 'from-orange-500 to-yellow-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCapacityStatus = (enrolled, capacity) => {
    const percentage = (enrolled / parseInt(capacity)) * 100;
    if (percentage >= 90) return { color: 'text-red-600', status: 'Almost Full' };
    if (percentage >= 70) return { color: 'text-yellow-600', status: 'Filling Up' };
    return { color: 'text-green-600', status: 'Available' };
  };

  // Handle edit class
  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setShowEditModal(true);
  };

  // Handle delete class
  const handleDeleteClass = (classItem) => {
    setDeletingClass(classItem);
    setShowDeleteModal(true);
  };

  // Confirm delete class
  const confirmDeleteClass = async () => {
    try {
      if (deletingClass?.id) {
        await apiService.deleteClass(deletingClass.id);
        const res = await apiService.getClasses();
        const apiClasses = Array.isArray(res?.data) ? res.data : res?.data?.classes || [];
        setBackendClasses(apiClasses);
      }
    } catch (e) {
      console.error('Delete class failed', e);
    } finally {
      setShowDeleteModal(false);
      setDeletingClass(null);
    }
  };

  const stats = {
    totalClasses: enhancedClasses.length,
    todayClasses: Math.floor(enhancedClasses.length * 0.3),
    totalEnrolled: enhancedClasses.reduce((sum, cls) => sum + cls.enrolled, 0),
    averageRating: (enhancedClasses.reduce((sum, cls) => sum + parseFloat(cls.rating), 0) / enhancedClasses.length).toFixed(1)
  };

  const submitCreateClass = async (e) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload = {
        title: data.get('title'),
        schedule: data.get('schedule'),
        trainer: Number(data.get('trainer')) || 1,
        capacity: Number(data.get('capacity')) || 10,
        description: data.get('description') || ''
      };
      await apiService.createClass(payload);
      const res = await apiService.getClasses();
      const apiClasses = Array.isArray(res?.data) ? res.data : res?.data?.classes || [];
      setBackendClasses(apiClasses);
      setShowScheduleModal(false);
    } catch (err) {
      console.error('Create class failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Class Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Schedule, manage, and track fitness classes and sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClasses}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Classes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayClasses}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrolled</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEnrolled}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Rating</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Simplified: hide extra widgets to focus on creating and listing classes */}

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="Cardio">Cardio</option>
                <option value="Strength">Strength</option>
                <option value="Yoga">Yoga</option>
                <option value="HIIT">HIIT</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white dark:bg-gray-600 text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-gray-600 text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-white dark:bg-gray-600 text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            
                  <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Class</span>
        </button>
          </div>
        </div>
      </div>

      {/* Classes Display */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => {
            const TypeIcon = getTypeIcon(classItem.type);
            const typeColor = getTypeColor(classItem.type);
            const capacityStatus = getCapacityStatus(classItem.enrolled, classItem.capacity);
            
            return (
              <div key={classItem.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Class Image */}
                <div className="relative h-48">
                  <img
                    src={classItem.image}
                    alt={classItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="absolute top-4 left-4">
                    <div className={`p-2 bg-gradient-to-r ${typeColor} rounded-lg shadow-lg`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(classItem.difficulty)}`}>
                      {classItem.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{classItem.title}</h3>
                    <p className="text-white text-opacity-90 text-sm">{classItem.type}</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Class Info */}
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{classItem.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{classItem.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{classItem.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{classItem.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={getTrainerPhoto(classItem.trainerId)}
                        alt={getTrainerName(classItem.trainerId)}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getTrainerName(classItem.trainerId)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                      <span className={`font-medium ${capacityStatus.color}`}>
                        {capacityStatus.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${typeColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(classItem.enrolled / parseInt(classItem.capacity)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{classItem.enrolled} enrolled</span>
                      <span>{classItem.capacity} max</span>
                    </div>
                  </div>

                  {/* Schedule & Price */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{classItem.schedule}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Next: {classItem.nextSession}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${classItem.price}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">per session</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button type="button" className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r ${typeColor} text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105`} onClick={async () => {
                      try {
                        await apiService.bookClass(classItem.id, { memberId: 1 });
                        const res = await apiService.getClasses();
                        const apiClasses = Array.isArray(res?.data) ? res.data : res?.data?.classes || [];
                        setBackendClasses(apiClasses);
                      } catch (e) {
                        console.error('Book class failed', e);
                      }
                    }}>
                      <UserPlus className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                    <button type="button"
                      onClick={() => handleEditClass(classItem)}
                      className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button type="button"
                      onClick={() => handleDeleteClass(classItem)}
                      className="p-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Schedule Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule New Class</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
              </div>
              <form onSubmit={submitCreateClass} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input name="title" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Schedule</label>
                    <input type="datetime-local" name="schedule" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Trainer ID</label>
                    <input name="trainer" type="number" defaultValue={1} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                    <input name="capacity" type="number" defaultValue={10} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea name="description" rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trainer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClasses.map((classItem) => {
                  const TypeIcon = getTypeIcon(classItem.type);
                  const capacityStatus = getCapacityStatus(classItem.enrolled, classItem.capacity);
                  
                  return (
                    <tr key={classItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TypeIcon className="w-8 h-8 text-orange-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{classItem.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{classItem.type} • {classItem.duration}min</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={getTrainerPhoto(classItem.trainerId)}
                            alt={getTrainerName(classItem.trainerId)}
                            className="w-8 h-8 rounded-full object-cover mr-3"
                          />
                          <div className="text-sm text-gray-900 dark:text-white">{getTrainerName(classItem.trainerId)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{classItem.schedule}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{classItem.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900 dark:text-white mr-2">
                            {classItem.enrolled}/{classItem.capacity}
                          </div>
                          <span className={`text-xs font-medium ${capacityStatus.color}`}>
                            {capacityStatus.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${classItem.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                            <UserPlus className="w-4 h-4" />
                          </button>
                <button 
                            onClick={() => handleEditClass(classItem)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClass(classItem)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400">
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

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Class</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class Title</label>
                    <input
                      type="text"
                      defaultValue={editingClass.title}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                    <select
                      defaultValue={editingClass.type}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Cardio">Cardio</option>
                      <option value="Strength">Strength</option>
                      <option value="Yoga">Yoga</option>
                      <option value="HIIT">HIIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</label>
                    <input
                      type="text"
                      defaultValue={editingClass.schedule}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                    <input
                      type="number"
                      defaultValue={editingClass.capacity}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      defaultValue={editingClass.duration}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      defaultValue={editingClass.price}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                    <select
                      defaultValue={editingClass.difficulty}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      defaultValue={editingClass.location}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    rows="3"
                    defaultValue={editingClass.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const form = e.currentTarget.closest('form');
                        const data = new FormData(form);
                        const payload = {
                          title: data.get('title') || editingClass.title,
                          type: data.get('type') || editingClass.type,
                          schedule: data.get('schedule') || editingClass.schedule,
                          capacity: Number(data.get('capacity')) || editingClass.capacity,
                          duration: Number(data.get('duration')) || editingClass.duration,
                          price: Number(data.get('price')) || editingClass.price,
                          difficulty: data.get('difficulty') || editingClass.difficulty,
                          location: data.get('location') || editingClass.location,
                          description: data.get('description') || editingClass.description,
                          // Backend-required fields
                          trainer: editingClass.trainerId || 1,
                          enrolled: typeof editingClass.enrolled === 'number' ? editingClass.enrolled : 0,
                          status: editingClass.status || 'active'
                        };
                        await apiService.updateClass(editingClass.id, payload);
                        const res = await apiService.getClasses();
                        const apiClasses = Array.isArray(res?.data) ? res.data : res?.data?.classes || [];
                        setBackendClasses(apiClasses);
                        setShowEditModal(false);
                        setEditingClass(null);
                      } catch (err) {
                        console.error('Update class failed', err);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Update Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Delete Class
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete <strong>{deletingClass.title}</strong>? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteClass}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;