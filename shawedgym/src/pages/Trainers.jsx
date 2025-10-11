import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
import { 
  UserCheck, Plus, Search, Filter, Star, Calendar,
  Phone, Mail, MapPin, Clock, Users, Trophy,
  Edit, Trash2, Eye, MessageCircle, Award,
  TrendingUp, Target, Zap, Heart, Activity,
  BookOpen, CheckCircle, AlertCircle, AlertTriangle, DollarSign, X
} from 'lucide-react';

/**
 * Modern Trainer Management System with profiles, performance tracking, and scheduling
 */
const Trainers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTrainer, setDeletingTrainer] = useState(null);

  const [backendTrainers, setBackendTrainers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getTrainers();
        const apiTrainers = Array.isArray(res?.data) ? res.data : res?.data?.trainers || [];
        setBackendTrainers(apiTrainers);
      } catch (e) {
        setBackendTrainers([]);
      }
    };
    load();
  }, []);

  const baseTrainers = backendTrainers.map(t => ({
    id: t.id,
    name: (t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim()) || 'Unknown Trainer',
    email: t.email || 'unknown@example.com',
    phone: t.phone || '',
    specialty: t.specialty || t.specialization || 'Strength',
    status: (t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : 'Active'),
    experience: typeof t.experience === 'number' ? t.experience : Number(t.experience) || 0,
    monthlySalary: t.monthly_salary !== undefined && t.monthly_salary !== null ? Number(t.monthly_salary) : 0,
    bio: t.bio || '',
    // Defaults to avoid undefined during render
    specializations: t.specializations || [],
    availability: t.availability || 'Mon-Fri 9AM-5PM',
    clientRetentionRate: typeof t.clientRetentionRate === 'number' ? t.clientRetentionRate : 85,
    totalClients: typeof t.totalClients === 'number' ? t.totalClients : 0,
    activeClasses: typeof t.activeClasses === 'number' ? t.activeClasses : 0,
    rating: t.rating || '4.0',
    nextAvailable: t.nextAvailable || new Date().toISOString().split('T')[0]
  }));

  // Enhanced trainers data with performance metrics and additional info
  const enhancedTrainers = baseTrainers.map(trainer => {
    const idBasedOffset = (trainer.id % 7) + 1; // 1..7 deterministic
    return {
      ...trainer,
      photo: `https://images.unsplash.com/photo-${
        trainer.id % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1494790108755-2616b612b47c'
      }?w=300&h=300&fit=crop&crop=face`,
      status: trainer.status || 'Active',
      experience: trainer.experience, // from DB-normalized base
      rating: (parseFloat(trainer.rating) || 4.0).toFixed(1),
      totalClients: typeof trainer.totalClients === 'number' ? trainer.totalClients : 0,
      activeClasses: typeof trainer.activeClasses === 'number' ? trainer.activeClasses : 0,
      certifications: ['ACSM Certified', 'NASM Personal Trainer', 'CPR Certified'],
      joinDate: new Date(Date.now() - idBasedOffset * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hourlyRate: trainer.hourlyRate, // from DB-normalized base
      availability: ['Mon-Fri 6AM-2PM', 'Tue-Thu 3PM-9PM', 'Weekends 8AM-6PM'][trainer.id % 3],
      languages: ['English', 'Somali', 'Arabic'],
      bio: trainer.bio && trainer.bio.trim().length > 0 ? trainer.bio : `Passionate fitness trainer with ${trainer.experience} years of experience helping clients achieve their fitness goals.`,
      achievements: ['Trainer of the Month', 'Client Transformation Award'],
      socialMedia: {
        instagram: `@${trainer.name.toLowerCase().replace(/\s+/g, '_')}_fit`,
        twitter: `@${trainer.name.toLowerCase().replace(/\s+/g, '')}`
      },
      nextAvailable: new Date(Date.now() + idBasedOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyEarnings: Math.round((trainer.hourlyRate || 0) * 80), // approx 20h/week
      clientRetentionRate: typeof trainer.clientRetentionRate === 'number' ? trainer.clientRetentionRate : 85,
      specializations: (trainer.specialty || '').includes('Strength') ? 
        ['Strength Training', 'Powerlifting', 'Muscle Building'] :
        (trainer.specialty || '').includes('Cardio') ?
        ['HIIT', 'Endurance Training', 'Weight Loss'] :
        ['Flexibility', 'Mindfulness', 'Injury Recovery']
    };
  });

  const filteredTrainers = enhancedTrainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || trainer.specialty.includes(filterSpecialty);
    const matchesStatus = filterStatus === 'all' || trainer.status === filterStatus;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const getSpecialtyIcon = (specialty) => {
    if (specialty.includes('Strength')) return Activity;
    if (specialty.includes('Cardio')) return Heart;
    if (specialty.includes('Yoga')) return Target;
    return UserCheck;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Part-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getExperienceLevel = (years) => {
    if (years >= 8) return { level: 'Expert', color: 'text-purple-600' };
    if (years >= 5) return { level: 'Advanced', color: 'text-blue-600' };
    if (years >= 3) return { level: 'Intermediate', color: 'text-green-600' };
    return { level: 'Junior', color: 'text-orange-600' };
  };

  // Handle edit trainer
  const handleEditTrainer = (trainer) => {
    // Defensive: ensure object has required fields to avoid undefined access during modal render
    const safe = {
      id: trainer.id,
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      specialty: trainer.specialty || 'Strength',
      status: trainer.status || 'Active',
      experience: typeof trainer.experience === 'number' ? trainer.experience : 0,
      hourlyRate: trainer.hourlyRate || 50,
      bio: trainer.bio || ''
    };
    setEditingTrainer(safe);
    setShowEditModal(true);
  };

  // Handle delete trainer
  const handleDeleteTrainer = (trainer) => {
    setDeletingTrainer(trainer);
    setShowDeleteModal(true);
  };

  // Confirm delete trainer
  const confirmDeleteTrainer = async () => {
    try {
      if (deletingTrainer?.id) {
        await apiService.deleteTrainer(deletingTrainer.id);
        try {
          const res = await apiService.getTrainers();
          const apiTrainers = Array.isArray(res?.data) ? res.data : res?.data?.trainers || [];
          setBackendTrainers(apiTrainers);
        } catch {}
      }
    } catch (e) {
      console.error('Delete trainer failed', e);
    } finally {
      setShowDeleteModal(false);
      setDeletingTrainer(null);
    }
  };

  const stats = {
    totalTrainers: enhancedTrainers.length,
    activeTrainers: enhancedTrainers.filter(t => t.status === 'Active').length,
    averageRating: enhancedTrainers.length > 0 
      ? (enhancedTrainers.reduce((sum, t) => sum + parseFloat(t.rating || 0), 0) / enhancedTrainers.length).toFixed(1)
      : 0,
    totalClients: enhancedTrainers.reduce((sum, t) => sum + t.totalClients, 0),
    monthlyRevenue: enhancedTrainers.reduce((sum, t) => sum + t.monthlyEarnings, 0)
  };

  const specialties = [...new Set(enhancedTrainers.map(t => t.specialty))];

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload = {
        first_name: data.get('first_name'),
        last_name: data.get('last_name'),
        email: data.get('email'),
        phone: data.get('phone'),
        specialization: data.get('specialization') || 'Strength',
        experience: Number(data.get('experience')) || 3,
        hourly_rate: Number(data.get('hourly_rate')) || 50
      };
      await apiService.createTrainer(payload);
      try {
        const res = await apiService.getTrainers();
        const apiTrainers = Array.isArray(res?.data) ? res.data : res?.data?.trainers || [];
        setBackendTrainers(apiTrainers);
      } catch {}
      setShowAddModal(false);
    } catch (err) {
      console.error('Create trainer failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Trainer Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Manage trainer profiles, track performance, and schedule sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trainers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrainers}</p>
            </div>
            <UserCheck className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTrainers}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </div>
        
        {/* Avg. Rating card removed per request */}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p>
            </div>
            <Users className="w-6 h-6 text-purple-500" />
          </div>
        </div>
        
        {/* Avg. Experience card removed per request */}
        
        {/* Monthly Revenue card removed per request */}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trainer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trainers Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => {
            const SpecialtyIcon = getSpecialtyIcon(trainer.specialty);
            const experienceLevel = getExperienceLevel(trainer.experience);
            
            return (
              <div key={trainer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Trainer Header */}
                <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={trainer.photo}
                        alt={trainer.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 p-1 bg-white rounded-full shadow-lg">
                        <SpecialtyIcon className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{trainer.name}</h3>
                      <p className="text-blue-100 text-sm mb-2">{trainer.specialty}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trainer.status)}`}>
                          {trainer.status}
                        </span>
                        <span className={`text-xs font-medium ${experienceLevel.color}`}>
                          {experienceLevel.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-white bg-opacity-20 rounded-full px-2 py-1">
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <span className="text-white text-sm font-medium">{trainer.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Bio */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{trainer.bio}</p>

                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{trainer.totalClients}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Clients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{trainer.activeClasses}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Classes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{trainer.experience}y</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">{trainer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">{trainer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">{trainer.availability}</span>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Client Retention</span>
                      <span className="font-bold text-green-600">{trainer.clientRetentionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${trainer.clientRetentionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pricing & Availability */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Salary</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${Number(trainer.monthlySalary).toFixed(2)}/month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next Available</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{trainer.nextAvailable}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button type="button" className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button type="button"
                      onClick={() => handleEditTrainer(trainer)}
                      className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button type="button"
                      onClick={() => handleDeleteTrainer(trainer)}
                      className="p-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Horizontal List View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-3 text-left">Trainer</div>
                <div className="col-span-2 text-left">Specialty</div>
                <div className="col-span-2 text-center">Experience</div>
                <div className="col-span-2 text-center">Monthly Salary</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              {/* Table Body */}
              <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTrainers.map((trainer) => {
                  const SpecialtyIcon = getSpecialtyIcon(trainer.specialty);
                  const experienceLevel = getExperienceLevel(trainer.experience);
                  
                  return (
                    <div key={trainer.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow px-4 py-3">
                      {/* Left: avatar + name */}
                      <div className="flex items-center space-x-3 min-w-[220px]">
                        <img
                          src={trainer.photo}
                          alt={trainer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white leading-tight">{trainer.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{trainer.email}</div>
                        </div>
                      </div>

                      {/* Middle: columns */}
                      <div className="hidden md:grid grid-cols-5 items-center flex-1 text-sm">
                        <div className="px-4 py-2 whitespace-nowrap text-left">
                          <div className="text-gray-500 dark:text-gray-400">Specialty</div>
                          <div className="inline-flex items-center space-x-1 font-medium text-gray-900 dark:text-white">
                            <SpecialtyIcon className="w-4 h-4 text-blue-500" />
                            <span>{trainer.specialty}</span>
                          </div>
                        </div>
                        <div className="px-4 py-2 text-center whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-400">Experience</div>
                          <div className="font-medium text-gray-900 dark:text-white text-center">{trainer.experience}y</div>
                        </div>
                        <div className="px-4 py-2 text-center whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-400">Monthly Salary</div>
                          <div className="font-bold text-green-600 text-center">${Number(trainer.monthlySalary).toFixed(2)}</div>
                        </div>
                        <div className="px-4 py-2 text-center whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-400">Status</div>
                          <div className="inline-flex items-center justify-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(trainer.status)}`}>
                              {trainer.status}
                            </span>
                          </div>
                        </div>
                        <div className="px-4 py-2 text-center whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-400">Clients</div>
                          <div className="font-medium text-gray-900 dark:text-white text-center">{trainer.totalClients}</div>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center justify-center space-x-2 ml-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditTrainer(trainer)}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTrainer(trainer)}
                          className="p-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Trainer</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">✕</button>
              </div>
              <form onSubmit={handleAddTrainer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                    <input name="first_name" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                    <input name="last_name" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input name="phone" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                    <input name="specialization" defaultValue="Strength" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Experience (years)</label>
                    <input name="experience" type="number" defaultValue={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Monthly Salary ($)</label>
                    <input 
                      name="monthly_salary" 
                      type="number" 
                      min="0" 
                      step="0.01"
                      defaultValue={2000} 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                      placeholder="Enter monthly salary"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Empty State */}
      {filteredTrainers.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trainers found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Trainer</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                      <input
                      name="name"
                      type="text"
                      defaultValue={editingTrainer.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (years)</label>
                    <input
                      name="experience"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={editingTrainer.experience}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingTrainer.email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={editingTrainer.phone}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialty</label>
                    <select
                      name="specialty"
                      defaultValue={editingTrainer.specialty}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Yoga">Yoga</option>
                      <option value="CrossFit">CrossFit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={editingTrainer.status}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Salary ($)</label>
                    <input
                      name="monthlySalary"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={editingTrainer.monthlySalary || editingTrainer.hourlyRate * 160}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter monthly salary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    rows="3"
                    defaultValue={editingTrainer.bio}
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
                        const fullName = (data.get('name') || editingTrainer.name || '').toString().trim();
                        const firstFromForm = fullName.split(' ')[0] || '';
                        const lastFromForm = fullName.split(' ').slice(1).join(' ');
                        const [firstFallback, ...restFallback] = (editingTrainer.name || '').split(' ');
                        const payload = {
                          first_name: firstFromForm || firstFallback || '',
                          last_name: (lastFromForm || restFallback.join(' ')).trim(),
                          email: data.get('email') || editingTrainer.email,
                          phone: data.get('phone') || editingTrainer.phone,
                          specialization: data.get('specialty') || editingTrainer.specialty,
                          experience: Number(data.get('experience')) || editingTrainer.experience || 0,
                          monthly_salary: Number(data.get('monthlySalary')) || 0,
                          status: (data.get('status') || editingTrainer.status || 'Active').toString().toLowerCase(),
                          bio: data.get('bio') || editingTrainer.bio || ''
                        };
                        await apiService.updateTrainer(editingTrainer.id, payload);
                        try {
                          const res = await apiService.getTrainers();
                          let apiTrainers = Array.isArray(res?.data) ? res.data : res?.data?.trainers || [];
                          // Persist edited bio in UI even if backend doesn't store it
                          apiTrainers = apiTrainers.map(t => t.id === editingTrainer.id ? { ...t, bio: payload.bio } : t);
                          setBackendTrainers(apiTrainers);
                        } catch {}
                        setShowEditModal(false);
                        setEditingTrainer(null);
                      } catch (err) {
                        console.error('Update trainer failed', err);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Update Trainer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Delete Trainer
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete <strong>{deletingTrainer.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTrainer}
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

export default Trainers;
