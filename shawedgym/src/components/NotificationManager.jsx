import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Settings, Check, X, 
  Smartphone, Globe, Shield, Zap,
  AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import pushNotificationService from '../services/pushNotifications.js';

/**
 * Notification Manager Component - Manages push notification settings and permissions
 */
const NotificationManager = () => {
  const [notificationStatus, setNotificationStatus] = useState({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isEnabled: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Notification preferences
  const [preferences, setPreferences] = useState({
    checkins: true,
    payments: true,
    bookings: true,
    equipment: true,
    emergencies: true,
    newMembers: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  useEffect(() => {
    initializeNotifications();
    loadPreferences();
  }, []);

  const initializeNotifications = async () => {
    try {
      const initialized = await pushNotificationService.init();
      if (initialized) {
        updateStatus();
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const updateStatus = () => {
    const status = pushNotificationService.getStatus();
    setNotificationStatus({
      ...status,
      isEnabled: status.isSubscribed && status.permission === 'granted'
    });
  };

  const loadPreferences = () => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };

  const savePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      // Request permission
      const permitted = await pushNotificationService.requestPermission();
      
      if (permitted) {
        // Subscribe to notifications
        await pushNotificationService.subscribe();
        updateStatus();
        
        // Send welcome notification
        await pushNotificationService.sendLocalNotification(
          '🎉 Notifications Enabled!',
          {
            body: 'You\'ll now receive important updates from ShawedGym',
            tag: 'welcome'
          }
        );
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    
    try {
      await pushNotificationService.unsubscribe();
      updateStatus();
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotifications = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      const testActivities = [
        { type: 'checkin', user: 'Ahmed Hassan', priority: 'high' },
        { type: 'payment', user: 'Fatima Ali', amount: 75, priority: 'medium' },
        { type: 'new_member', user: 'Omar Farah', priority: 'high' }
      ];

      const results = [];
      
      for (let i = 0; i < testActivities.length; i++) {
        const activity = testActivities[i];
        
        setTimeout(async () => {
          const sent = await pushNotificationService.sendActivityNotification(activity);
          results.push({
            activity: activity.type,
            user: activity.user,
            sent,
            timestamp: new Date()
          });
          
          setTestResults([...results]);
        }, i * 1500); // 1.5 second intervals
      }
      
    } catch (error) {
      console.error('Test notifications failed:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 5000);
    }
  };

  const PreferenceToggle = ({ label, checked, onChange, icon: Icon, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked 
            ? 'bg-blue-600' 
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (!notificationStatus.isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-yellow-800 dark:text-yellow-200">
            Push notifications are not supported in this browser
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              notificationStatus.isEnabled 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {notificationStatus.isEnabled ? (
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {notificationStatus.isEnabled 
                  ? 'Receiving real-time updates' 
                  : 'Stay updated with important gym activities'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {notificationStatus.isEnabled ? (
              <button
                onClick={handleDisableNotifications}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Disabling...' : 'Disable'}
              </button>
            ) : (
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Enabling...' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
              notificationStatus.permission === 'granted' 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Shield className={`w-4 h-4 ${
                notificationStatus.permission === 'granted' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">Permission</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {notificationStatus.permission}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
              notificationStatus.isSubscribed 
                ? 'bg-blue-100 dark:bg-blue-900/20' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Smartphone className={`w-4 h-4 ${
                notificationStatus.isSubscribed 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">Subscription</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {notificationStatus.isSubscribed ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
              notificationStatus.isSupported 
                ? 'bg-purple-100 dark:bg-purple-900/20' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Globe className={`w-4 h-4 ${
                notificationStatus.isSupported 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">Browser</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {notificationStatus.isSupported ? 'Supported' : 'Not Supported'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notification Preferences
          </h4>
          
          <div className="space-y-3">
            <PreferenceToggle
              label="Member Check-ins"
              description="Get notified when members check in/out"
              checked={preferences.checkins}
              onChange={(checked) => savePreferences({...preferences, checkins: checked})}
              icon={CheckCircle}
            />
            
            <PreferenceToggle
              label="Payment Notifications"
              description="Receive alerts for new payments"
              checked={preferences.payments}
              onChange={(checked) => savePreferences({...preferences, payments: checked})}
              icon={CheckCircle}
            />
            
            <PreferenceToggle
              label="Class Bookings"
              description="Stay updated on class bookings"
              checked={preferences.bookings}
              onChange={(checked) => savePreferences({...preferences, bookings: checked})}
              icon={CheckCircle}
            />
            
            <PreferenceToggle
              label="Equipment Alerts"
              description="Get maintenance and equipment notifications"
              checked={preferences.equipment}
              onChange={(checked) => savePreferences({...preferences, equipment: checked})}
              icon={CheckCircle}
            />
            
            <PreferenceToggle
              label="New Members"
              description="Welcome notifications for new registrations"
              checked={preferences.newMembers}
              onChange={(checked) => savePreferences({...preferences, newMembers: checked})}
              icon={CheckCircle}
            />
            
            <PreferenceToggle
              label="Emergency Alerts"
              description="Critical notifications (always enabled)"
              checked={preferences.emergencies}
              onChange={() => {}} // Always enabled
              icon={AlertTriangle}
            />
          </div>

          {/* Test Notifications */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-900 dark:text-white">Test Notifications</h5>
              <button
                onClick={handleTestNotifications}
                disabled={isLoading || !notificationStatus.isEnabled}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isLoading ? 'Testing...' : 'Test'}</span>
              </button>
            </div>
            
            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {result.activity} - {result.user}
                    </span>
                    {result.sent ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
