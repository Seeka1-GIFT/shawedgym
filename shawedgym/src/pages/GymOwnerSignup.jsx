import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Building, Phone, MapPin, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';

const GymOwnerSignup = () => {
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Gym Info
    gym_name: '',
    gym_phone: '',
    gym_address: '',
    subscription_plan: 'basic'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    // Only auto-save if we have minimum required data
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.gym_name) {
      return;
    }

    setAutoSaveStatus('saving');
    
    try {
      // Create a draft version of the data
      const draftData = {
        ...formData,
        status: 'draft' // Mark as draft
      };

      // Save to localStorage as backup
      localStorage.setItem('gymOwnerDraft', JSON.stringify(draftData));
      
      // Simulate API call (you can implement actual draft saving endpoint)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      // Clear saved status after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
      
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Auto-save error:', error);
    }
  }, [formData]);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of no typing

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('gymOwnerDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(prev => ({
          ...prev,
          ...draft
        }));
        setLastSaved(new Date(draft.lastSaved || Date.now()));
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Info Validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Gym Info Validation
    if (!formData.gym_name.trim()) {
      newErrors.gym_name = 'Gym name is required';
    }
    if (!formData.gym_phone.trim()) {
      newErrors.gym_phone = 'Phone number is required';
    }
    if (!formData.gym_address.trim()) {
      newErrors.gym_address = 'Gym address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors below');
      return;
    }

    setLoading(true);
    
    try {
      // Register user and create gym
      const response = await apiService.registerGymOwner({
        // User data
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: 'admin', // Gym owner is admin of their gym
        
        // Gym data
        gym_name: formData.gym_name,
        gym_phone: formData.gym_phone,
        gym_address: formData.gym_address,
        subscription_plan: formData.subscription_plan
      });

      // Clear draft after successful submission
      localStorage.removeItem('gymOwnerDraft');
      
      showSuccess('Gym owner account created successfully!');
      
      // Auto-login after successful registration
      const loginResponse = await apiService.login({
        email: formData.email,
        password: formData.password
      });

      // Store auth data
      localStorage.setItem('authToken', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      localStorage.setItem('gym_id', loginResponse.data.gym_id);
      
      // Clear current gym selection to force reload
      localStorage.removeItem('currentGym');
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'authToken',
        newValue: loginResponse.data.token
      }));

      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create gym owner account';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Save className="w-4 h-4 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return `Saved ${lastSaved ? lastSaved.toLocaleTimeString() : ''}`;
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Left Side - Welcome */}
            <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-blue-600 p-8 text-white flex flex-col justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Start Your Gym Business</h1>
                <p className="text-green-100 mb-6">
                  Create your gym management account and start managing your fitness business today.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    Complete gym management system
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    Member and payment tracking
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    Real-time analytics and reports
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="md:w-1/2 p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create Gym Owner Account
                  </h2>
                  {/* Auto-save indicator */}
                  <div className="flex items-center space-x-2 text-sm">
                    {getAutoSaveIcon()}
                    <span className="text-gray-500 dark:text-gray-400">
                      {getAutoSaveText()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill in your details and gym information to get started
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-500" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                          errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                          errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter your last name"
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                            errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gym Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-green-500" />
                    Gym Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gym Name *
                      </label>
                      <input
                        type="text"
                        name="gym_name"
                        value={formData.gym_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                          errors.gym_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter your gym name"
                      />
                      {errors.gym_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.gym_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="gym_phone"
                          value={formData.gym_phone}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                            errors.gym_phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter gym phone number"
                        />
                      </div>
                      {errors.gym_phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.gym_phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gym Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                          name="gym_address"
                          value={formData.gym_address}
                          onChange={handleChange}
                          rows="3"
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                            errors.gym_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter gym address"
                        />
                      </div>
                      {errors.gym_address && (
                        <p className="text-red-500 text-xs mt-1">{errors.gym_address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subscription Plan
                      </label>
                      <select
                        name="subscription_plan"
                        value={formData.subscription_plan}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="basic">Basic Plan - $35/month</option>
                        <option value="premium">Premium Plan - $59/month</option>
                        <option value="enterprise">Enterprise Plan - $99/month</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Building className="w-5 h-5 mr-2" />
                      Create Gym Owner Account
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymOwnerSignup;