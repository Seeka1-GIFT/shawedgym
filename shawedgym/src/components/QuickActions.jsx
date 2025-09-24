import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Activity, Calendar, DollarSign, 
  Package, Target, FileText, CheckCircle, Plus,
  ArrowRight, Zap, Clock, TrendingUp
} from 'lucide-react';

/**
 * Quick Actions Component - Smart navigation and related actions for each page
 */
const QuickActions = ({ currentPage, contextData = {} }) => {
  const navigate = useNavigate();

  // Define quick actions for each page
  const getQuickActions = () => {
    switch (currentPage) {
      case 'dashboard':
        return [
          {
            title: 'Check-In Member',
            description: 'Quick member check-in',
            icon: Activity,
            color: 'from-green-500 to-blue-500',
            action: () => navigate('/checkin'),
            count: contextData.membersInGym || 0
          },
          {
            title: 'Record Payment',
            description: 'Add new payment',
            icon: DollarSign,
            color: 'from-blue-500 to-purple-500',
            action: () => navigate('/payments'),
            count: contextData.pendingPayments || 0
          },
          {
            title: 'Schedule Class',
            description: 'Create new class',
            icon: Calendar,
            color: 'from-purple-500 to-pink-500',
            action: () => navigate('/classes'),
            count: contextData.todayClasses || 0
          },
          {
            title: 'Add Member',
            description: 'Register new member',
            icon: UserPlus,
            color: 'from-orange-500 to-red-500',
            action: () => navigate('/members'),
            count: contextData.newMembersToday || 0
          }
        ];

      case 'members':
        return [
          {
            title: 'Check-In Member',
            description: 'Quick check-in process',
            icon: Activity,
            color: 'from-green-500 to-blue-500',
            action: () => navigate('/checkin')
          },
          {
            title: 'View Attendance',
            description: 'Member attendance history',
            icon: CheckCircle,
            color: 'from-blue-500 to-purple-500',
            action: () => navigate('/attendance')
          },
          {
            title: 'Payment History',
            description: 'View payment records',
            icon: DollarSign,
            color: 'from-purple-500 to-pink-500',
            action: () => navigate('/payments')
          },
          {
            title: 'Assign Workout',
            description: 'Create workout plan',
            icon: Target,
            color: 'from-orange-500 to-red-500',
            action: () => navigate('/workout-plans')
          }
        ];

      case 'equipment':
        return [
          {
            title: 'Financial Details',
            description: 'View asset financials',
            icon: FileText,
            color: 'from-green-500 to-blue-500',
            action: () => navigate('/assets')
          },
          {
            title: 'Schedule Maintenance',
            description: 'Plan maintenance tasks',
            icon: Calendar,
            color: 'from-blue-500 to-purple-500',
            action: () => navigate('/classes')
          },
          {
            title: 'Usage Analytics',
            description: 'Equipment usage reports',
            icon: TrendingUp,
            color: 'from-purple-500 to-pink-500',
            action: () => navigate('/reports')
          }
        ];

      case 'classes':
        return [
          {
            title: 'Assign Trainer',
            description: 'Manage class instructors',
            icon: Users,
            color: 'from-blue-500 to-purple-500',
            action: () => navigate('/trainers')
          },
          {
            title: 'Create Workout Plan',
            description: 'Design workout programs',
            icon: Target,
            color: 'from-purple-500 to-pink-500',
            action: () => navigate('/workout-plans')
          },
          {
            title: 'Track Attendance',
            description: 'Monitor class attendance',
            icon: CheckCircle,
            color: 'from-green-500 to-blue-500',
            action: () => navigate('/attendance')
          },
          {
            title: 'Equipment Booking',
            description: 'Reserve equipment',
            icon: Package,
            color: 'from-orange-500 to-red-500',
            action: () => navigate('/equipment')
          }
        ];

      case 'payments':
        return [
          {
            title: 'View Expenses',
            description: 'Track outgoing costs',
            icon: TrendingUp,
            color: 'from-red-500 to-orange-500',
            action: () => navigate('/expenses')
          },
          {
            title: 'Member Details',
            description: 'View member profiles',
            icon: Users,
            color: 'from-blue-500 to-purple-500',
            action: () => navigate('/members')
          },
          {
            title: 'Financial Reports',
            description: 'Detailed analytics',
            icon: FileText,
            color: 'from-purple-500 to-pink-500',
            action: () => navigate('/reports')
          }
        ];

      case 'attendance':
        return [
          {
            title: 'Member Check-In',
            description: 'Quick check-in system',
            icon: Activity,
            color: 'from-green-500 to-blue-500',
            action: () => navigate('/checkin')
          },
          {
            title: 'Class Management',
            description: 'Manage class schedules',
            icon: Calendar,
            color: 'from-blue-500 to-purple-500',
            action: () => navigate('/classes')
          },
          {
            title: 'Member Profiles',
            description: 'View member details',
            icon: Users,
            color: 'from-purple-500 to-pink-500',
            action: () => navigate('/members')
          }
        ];

      default:
        return [
          {
            title: 'Quick Check-In',
            description: 'Member check-in',
            icon: Activity,
            color: 'from-green-500 to-blue-500',
            action: () => navigate('/checkin')
          },
          {
            title: 'View Dashboard',
            description: 'System overview',
            icon: TrendingUp,
            color: 'from-blue-500 to-purple-500',
            action: () => navigate('/')
          }
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">Related tasks and shortcuts</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="group relative p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-transparent"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 bg-gradient-to-br ${action.color} rounded-lg shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {action.count !== undefined && (
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {action.count}
                    </span>
                  )}
                </div>
                
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {action.description}
                </p>
                
                <div className="flex items-center justify-end">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
