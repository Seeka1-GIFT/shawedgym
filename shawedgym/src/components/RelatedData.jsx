import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, ArrowRight, TrendingUp, Users, DollarSign, 
  Calendar, Activity, Clock, CheckCircle, AlertTriangle,
  Package, Target, Award, FileText
} from 'lucide-react';

/**
 * Related Data Component - Shows relevant information from other pages
 */
const RelatedData = ({ currentPage, data = {} }) => {
  const navigate = useNavigate();

  const getRelatedWidgets = () => {
    switch (currentPage) {
      case 'members':
        return [
          {
            title: 'Recent Payments',
            value: '$2,450',
            subtitle: 'Last 7 days',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            action: () => navigate('/payments'),
            trend: '+12%'
          },
          {
            title: 'Attendance Rate',
            value: '87%',
            subtitle: 'This month',
            icon: CheckCircle,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            action: () => navigate('/attendance'),
            trend: '+5%'
          },
          {
            title: 'Active Classes',
            value: '24',
            subtitle: 'Currently enrolled',
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            action: () => navigate('/classes'),
            trend: '+3'
          }
        ];

      case 'equipment':
        return [
          {
            title: 'Total Asset Value',
            value: '$125,000',
            subtitle: 'Current worth',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            action: () => navigate('/assets'),
            trend: '-2%'
          },
          {
            title: 'Usage Rate',
            value: '82%',
            subtitle: 'Daily average',
            icon: Activity,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            action: () => navigate('/reports'),
            trend: '+8%'
          },
          {
            title: 'Maintenance Due',
            value: '3',
            subtitle: 'This week',
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            action: () => navigate('/equipment'),
            trend: 'urgent'
          }
        ];

      case 'classes':
        return [
          {
            title: 'Available Trainers',
            value: '8',
            subtitle: 'Ready to assign',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            action: () => navigate('/trainers'),
            trend: 'active'
          },
          {
            title: 'Equipment Ready',
            value: '95%',
            subtitle: 'Available now',
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            action: () => navigate('/equipment'),
            trend: '+2%'
          },
          {
            title: 'Member Interest',
            value: '156',
            subtitle: 'Waiting list',
            icon: Target,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            action: () => navigate('/members'),
            trend: '+24'
          }
        ];

      case 'payments':
        return [
          {
            title: 'Monthly Expenses',
            value: '$8,200',
            subtitle: 'This month',
            icon: TrendingUp,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            action: () => navigate('/expenses'),
            trend: '+5%'
          },
          {
            title: 'Active Members',
            value: '142',
            subtitle: 'Paying customers',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            action: () => navigate('/members'),
            trend: '+8'
          },
          {
            title: 'Reports Ready',
            value: '12',
            subtitle: 'Financial reports',
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            action: () => navigate('/reports'),
            trend: 'new'
          }
        ];

      case 'attendance':
        return [
          {
            title: 'Live Check-ins',
            value: '23',
            subtitle: 'Currently in gym',
            icon: Activity,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            action: () => navigate('/checkin'),
            trend: 'live'
          },
          {
            title: 'Today\'s Classes',
            value: '8',
            subtitle: 'Scheduled sessions',
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            action: () => navigate('/classes'),
            trend: '6 active'
          },
          {
            title: 'Member Profiles',
            value: '148',
            subtitle: 'Total members',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            action: () => navigate('/members'),
            trend: '+5'
          }
        ];

      default:
        return [];
    }
  };

  const widgets = getRelatedWidgets();

  if (widgets.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Related Information</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Live data from other modules</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {widgets.map((widget, index) => {
          const Icon = widget.icon;
          return (
            <button
              key={index}
              onClick={widget.action}
              className="group text-left p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 ${widget.bgColor} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${widget.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {widget.value}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    widget.trend.includes('+') ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    widget.trend.includes('-') ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {widget.trend}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {widget.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {widget.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedData;
