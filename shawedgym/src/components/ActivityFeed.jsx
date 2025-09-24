import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, DollarSign, Calendar, Package, 
  CheckCircle, Clock, AlertTriangle, TrendingUp,
  UserPlus, CreditCard, Wrench, Target, Eye,
  ArrowRight, Zap, RefreshCw, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import pushNotificationService from '../services/pushNotifications.js';

/**
 * Activity Feed Component - Shows real-time activities from all system modules
 */
const ActivityFeed = ({ limit = 10 }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Mock activity data - in real app this would come from API/WebSocket
  const generateMockActivities = () => {
    const mockActivities = [
      {
        id: 1,
        type: 'checkin',
        title: 'Member Check-in',
        description: 'Ahmed Hassan checked in for workout',
        timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        user: 'Ahmed Hassan',
        action: 'View Member',
        path: '/members',
        priority: 'high'
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Received',
        description: 'Monthly membership payment of $75 processed',
        timestamp: new Date(Date.now() - 8 * 60000), // 8 minutes ago
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        user: 'Fatima Ali',
        action: 'View Payment',
        path: '/payments',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'class_booking',
        title: 'Class Booking',
        description: 'New booking for HIIT class - Tomorrow 6:00 PM',
        timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        user: 'Mohamed Omar',
        action: 'View Class',
        path: '/classes',
        priority: 'medium'
      },
      {
        id: 4,
        type: 'equipment',
        title: 'Equipment Maintenance',
        description: 'Treadmill #3 maintenance scheduled for tomorrow',
        timestamp: new Date(Date.now() - 25 * 60000), // 25 minutes ago
        icon: Wrench,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        user: 'System',
        action: 'View Equipment',
        path: '/equipment',
        priority: 'high'
      },
      {
        id: 5,
        type: 'new_member',
        title: 'New Member Registration',
        description: 'Amina Yusuf completed registration and paid first month',
        timestamp: new Date(Date.now() - 35 * 60000), // 35 minutes ago
        icon: UserPlus,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        user: 'Amina Yusuf',
        action: 'View Profile',
        path: '/members',
        priority: 'high'
      },
      {
        id: 6,
        type: 'workout_plan',
        title: 'Workout Plan Assigned',
        description: 'New strength training plan created and assigned',
        timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
        icon: Target,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        user: 'Trainer Sarah',
        action: 'View Plan',
        path: '/workout-plans',
        priority: 'medium'
      },
      {
        id: 7,
        type: 'expense',
        title: 'New Expense',
        description: 'Equipment purchase - New dumbbells set ($2,500)',
        timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
        icon: TrendingUp,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        user: 'John Doe',
        action: 'View Expense',
        path: '/expenses',
        priority: 'low'
      },
      {
        id: 8,
        type: 'trainer',
        title: 'Trainer Assignment',
        description: 'Sarah Johnson assigned to Morning Yoga class',
        timestamp: new Date(Date.now() - 90 * 60000), // 1.5 hours ago
        icon: Users,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        user: 'Sarah Johnson',
        action: 'View Trainer',
        path: '/trainers',
        priority: 'medium'
      },
      {
        id: 9,
        type: 'checkout',
        title: 'Member Check-out',
        description: 'Hassan Ali completed workout and checked out',
        timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
        icon: Activity,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        user: 'Hassan Ali',
        action: 'View Attendance',
        path: '/attendance',
        priority: 'low'
      },
      {
        id: 10,
        type: 'class_completed',
        title: 'Class Completed',
        description: 'Evening Yoga class finished - 12 attendees',
        timestamp: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        user: 'Trainer Maria',
        action: 'View Class',
        path: '/classes',
        priority: 'low'
      }
    ];

    return mockActivities.slice(0, limit);
  };

  useEffect(() => {
    setActivities(generateMockActivities());

    // Simulate real-time updates only if live mode is enabled
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      const memberNames = ['Hassan Ali', 'Maryan Ahmed', 'Omar Farah', 'Amina Yusuf', 'Fatima Ali'];
      const activityTypes = [
        {
          type: 'checkin',
          title: 'Member Check-in',
          description: `${memberNames[Math.floor(Math.random() * memberNames.length)]} checked in`,
          icon: Activity,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          path: '/checkin'
        },
        {
          type: 'payment',
          title: 'Payment Received',
          description: `Payment of $${(Math.random() * 100 + 50).toFixed(0)} received`,
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          path: '/payments'
        },
        {
          type: 'booking',
          title: 'Class Booking',
          description: `New booking for ${['Yoga', 'HIIT', 'Pilates'][Math.floor(Math.random() * 3)]} class`,
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          path: '/classes'
        }
      ];

      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const newActivity = {
        id: Date.now(),
        ...randomActivity,
        timestamp: new Date(),
        user: 'Live Update',
        action: 'View Details',
        priority: 'medium'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, limit - 1)]);
      
      // Send push notification for high priority activities
      if (newActivity.priority === 'high') {
        pushNotificationService.sendActivityNotification(newActivity);
      }
    }, 25000); // New activity every 25 seconds

    return () => clearInterval(interval);
  }, [limit, isLiveMode]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActivities(generateMockActivities());
      setIsLoading(false);
    }, 1000);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Live Activity Feed</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time updates from all modules</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Live Mode Toggle */}
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isLiveMode 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span>{isLiveMode ? 'LIVE' : 'PAUSED'}</span>
          </button>
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh activities"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className={`p-2 ${activity.bgColor} rounded-lg flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h4>
                    {getPriorityBadge(activity.priority)}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    by {activity.user}
                  </span>
                  <Link 
                    to={activity.path}
                    className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span>{activity.action}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Activities will appear here as they happen</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Low</span>
            </div>
          </div>
          <Link 
            to="/reports"
            className="flex items-center space-x-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View All Activities</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
