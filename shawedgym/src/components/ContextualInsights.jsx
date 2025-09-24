import React from 'react';
import { 
  Lightbulb, TrendingUp, AlertTriangle, CheckCircle, 
  Target, Users, DollarSign, Activity, Clock, Award,
  ArrowRight, Zap, Star, Info
} from 'lucide-react';

/**
 * Contextual Insights Component - Smart recommendations and insights based on current page data
 */
const ContextualInsights = ({ currentPage, data = {} }) => {

  const getInsights = () => {
    switch (currentPage) {
      case 'members':
        return [
          {
            type: 'success',
            title: 'High Retention Rate',
            message: 'Your member retention is 15% above industry average. Keep up the excellent service!',
            icon: CheckCircle,
            action: 'View Retention Report',
            actionColor: 'text-green-600'
          },
          {
            type: 'warning',
            title: 'Memberships Expiring Soon',
            message: '12 memberships expire within 30 days. Consider sending renewal reminders.',
            icon: AlertTriangle,
            action: 'Send Reminders',
            actionColor: 'text-orange-600'
          },
          {
            type: 'info',
            title: 'Premium Plan Opportunity',
            message: '8 standard members could benefit from premium features. Suggest upgrades.',
            icon: TrendingUp,
            action: 'View Upgrade Candidates',
            actionColor: 'text-blue-600'
          }
        ];

      case 'equipment':
        return [
          {
            type: 'warning',
            title: 'Maintenance Due',
            message: '3 pieces of equipment need maintenance this week to prevent breakdowns.',
            icon: AlertTriangle,
            action: 'Schedule Maintenance',
            actionColor: 'text-orange-600'
          },
          {
            type: 'success',
            title: 'High Utilization',
            message: 'Cardio equipment shows 95% utilization. Consider expanding this section.',
            icon: TrendingUp,
            action: 'View Usage Analytics',
            actionColor: 'text-green-600'
          },
          {
            type: 'info',
            title: 'Warranty Expiring',
            message: '2 equipment warranties expire next month. Plan for renewals or replacements.',
            icon: Clock,
            action: 'Review Warranties',
            actionColor: 'text-blue-600'
          }
        ];

      case 'classes':
        return [
          {
            type: 'success',
            title: 'Popular Classes',
            message: 'HIIT and Yoga classes are at 98% capacity. Consider adding more sessions.',
            icon: Star,
            action: 'Add More Sessions',
            actionColor: 'text-green-600'
          },
          {
            type: 'info',
            title: 'Trainer Availability',
            message: '2 trainers have open slots this week. Optimize scheduling for better coverage.',
            icon: Users,
            action: 'Optimize Schedule',
            actionColor: 'text-blue-600'
          },
          {
            type: 'warning',
            title: 'Low Attendance Class',
            message: 'Morning Pilates has only 40% attendance. Consider time change or promotion.',
            icon: AlertTriangle,
            action: 'Review Class Performance',
            actionColor: 'text-orange-600'
          }
        ];

      case 'payments':
        return [
          {
            type: 'success',
            title: 'Revenue Growth',
            message: 'Monthly revenue increased by 12%. Premium plans are driving growth.',
            icon: TrendingUp,
            action: 'View Revenue Report',
            actionColor: 'text-green-600'
          },
          {
            type: 'warning',
            title: 'Failed Payments',
            message: '5 payments failed this week. Follow up with affected members.',
            icon: AlertTriangle,
            action: 'Contact Members',
            actionColor: 'text-orange-600'
          },
          {
            type: 'info',
            title: 'Payment Method Trends',
            message: 'Credit card usage increased 25%. Consider optimizing payment flow.',
            icon: Info,
            action: 'Analyze Trends',
            actionColor: 'text-blue-600'
          }
        ];

      case 'attendance':
        return [
          {
            type: 'success',
            title: 'Peak Hour Optimization',
            message: 'Evening hours (6-8 PM) show 95% attendance. Staff levels are optimal.',
            icon: CheckCircle,
            action: 'View Peak Analysis',
            actionColor: 'text-green-600'
          },
          {
            type: 'info',
            title: 'Member Engagement',
            message: 'Premium members attend 40% more frequently than basic members.',
            icon: Activity,
            action: 'Engagement Report',
            actionColor: 'text-blue-600'
          },
          {
            type: 'warning',
            title: 'Low Weekend Attendance',
            message: 'Sunday attendance is 30% below average. Consider special programs.',
            icon: AlertTriangle,
            action: 'Plan Weekend Events',
            actionColor: 'text-orange-600'
          }
        ];

      default:
        return [];
    }
  };

  const insights = getInsights();

  if (insights.length === 0) return null;

  const getInsightBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getInsightIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Insights</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">AI-powered recommendations</span>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightBg(insight.type)} hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm ${getInsightIconColor(insight.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {insight.message}
                  </p>
                  
                  <button className={`flex items-center space-x-2 text-sm font-medium ${insight.actionColor} hover:underline`}>
                    <span>{insight.action}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContextualInsights;
