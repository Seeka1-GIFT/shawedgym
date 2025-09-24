import React from 'react';

/**
 * A modern, enhanced statistic card with gradients, animations, and icons
 */
const StatCard = ({ title, value, children, icon: Icon, gradient = "from-blue-500 to-purple-600" }) => {
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative p-6 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {title}
            </h4>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {value}
            </p>
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {children}
          </div>
        )}
        
        {/* Animated border */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
      </div>
    </div>
  );
};

export default StatCard;