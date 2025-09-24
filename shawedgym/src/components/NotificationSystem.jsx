import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle, Clock } from 'lucide-react';

/**
 * Advanced Notification System with real-time alerts
 */
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  // Mock notification data - in real app this would come from API/WebSocket
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Member Check-in',
        message: 'Ahmed Hassan checked in successfully',
        timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        read: false,
        action: 'View Member'
      },
      {
        id: 2,
        type: 'warning',
        title: 'Equipment Maintenance',
        message: 'Treadmill #3 needs maintenance check',
        timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        read: false,
        action: 'Schedule Maintenance'
      },
      {
        id: 3,
        type: 'info',
        title: 'New Member Registration',
        message: 'Fatima Ali completed registration',
        timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        read: true,
        action: 'View Profile'
      },
      {
        id: 4,
        type: 'error',
        title: 'Payment Failed',
        message: 'Monthly payment failed for Mohamed Omar',
        timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
        read: false,
        action: 'Retry Payment'
      },
      {
        id: 5,
        type: 'info',
        title: 'Class Full',
        message: 'Morning Yoga class is now fully booked',
        timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
        read: true,
        action: 'Manage Classes'
      }
    ];

    setNotifications(mockNotifications);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        type: ['success', 'warning', 'info', 'error'][Math.floor(Math.random() * 4)],
        title: 'New Activity',
        message: 'System generated notification',
        timestamp: new Date(),
        read: false,
        action: 'View Details'
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(notification.timestamp)}</span>
                                </div>
                                {notification.action && (
                                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                    {notification.action}
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  title="Mark as read"
                                >
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSystem;
