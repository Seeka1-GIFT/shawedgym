import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Bell, Shield, Database,
  Palette, Globe, Clock, Mail, Phone, Key, Lock,
  Save, RefreshCw, Download, Upload, Trash2, Edit,
  Monitor, Smartphone, Sun, Moon, Volume2, VolumeX,
  Eye, EyeOff, CheckCircle, AlertTriangle, Info
} from 'lucide-react';
import NotificationManager from '../components/NotificationManager.jsx';

/**
 * Modern Settings Page with comprehensive system configuration, user preferences, and security options
 */
const Settings = ({ theme, setTheme }) => {
  // Notification Settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // System Settings
  const [enableCache, setEnableCache] = useState(true);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // User Preferences
  const [language, setLanguage] = useState('english');
  const [timezone, setTimezone] = useState('Africa/Mogadishu');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currency, setCurrency] = useState('USD');

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordExpiry, setPasswordExpiry] = useState('90');
  const [loginAttempts, setLoginAttempts] = useState('5');

  // Gym Settings
  const [gymName, setGymName] = useState('ShawedGym');
  const [gymAddress, setGymAddress] = useState('Mogadishu, Somalia');
  const [gymPhone, setGymPhone] = useState('+252-61-123-4567');
  const [gymEmail, setGymEmail] = useState('info@shawedgym.com');
  const [operatingHours, setOperatingHours] = useState('6:00 AM - 10:00 PM');

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'notifications', 'security', 'gym', 'system'

  const handleSaveSettings = () => {
    // Mock save functionality
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset logic would go here
      alert('Settings reset to default values');
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            System Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Configure system preferences, security, and gym operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings Categories</h3>
            <nav className="space-y-2">
              {[
                { id: 'general', label: 'General', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'gym', label: 'Gym Settings', icon: SettingsIcon },
                { id: 'system', label: 'System', icon: Database }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
                </div>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Palette className="w-5 h-5" />
                      <span>Appearance</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Theme Mode</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setTheme('light')}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Sun className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Moon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Language & Region */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Globe className="w-5 h-5" />
                      <span>Language & Region</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="english">English</option>
                          <option value="somali">Somali</option>
                          <option value="arabic">Arabic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Africa/Mogadishu">Africa/Mogadishu</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                        <select
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="SOS">SOS (Sh.So.)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
                </div>

                <div className="space-y-6">
                  {/* Push Notifications Manager */}
                  <NotificationManager />
                  
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Alert Preferences</h3>
                    <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-600">
                      <ToggleSwitch
                        checked={emailAlerts}
                        onChange={setEmailAlerts}
                        label="Email Notifications"
                        description="Receive alerts via email for important events"
                      />
                      <ToggleSwitch
                        checked={smsAlerts}
                        onChange={setSmsAlerts}
                        label="SMS Notifications"
                        description="Get text messages for urgent notifications"
                      />
                      <ToggleSwitch
                        checked={pushNotifications}
                        onChange={setPushNotifications}
                        label="Push Notifications"
                        description="Browser push notifications for real-time updates"
                      />
                      <ToggleSwitch
                        checked={soundEnabled}
                        onChange={setSoundEnabled}
                        label="Sound Alerts"
                        description="Play sound for incoming notifications"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800 dark:text-blue-400">Notification Types</h4>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <p>• Member check-ins and check-outs</p>
                      <p>• Payment confirmations and failures</p>
                      <p>• Equipment maintenance alerts</p>
                      <p>• Class capacity warnings</p>
                      <p>• System updates and announcements</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Authentication</h3>
                    <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-600">
                      <ToggleSwitch
                        checked={twoFactorAuth}
                        onChange={setTwoFactorAuth}
                        label="Two-Factor Authentication"
                        description="Add an extra layer of security to your account"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Session Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          value={sessionTimeout}
                          onChange={(e) => setSessionTimeout(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Expiry (days)</label>
                        <input
                          type="number"
                          value={passwordExpiry}
                          onChange={(e) => setPasswordExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Login Attempts</label>
                        <input
                          type="number"
                          value={loginAttempts}
                          onChange={(e) => setLoginAttempts(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gym Settings */}
            {activeTab === 'gym' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <SettingsIcon className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Gym Configuration</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gym Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gym Name</label>
                        <input
                          type="text"
                          value={gymName}
                          onChange={(e) => setGymName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                        <input
                          type="text"
                          value={gymAddress}
                          onChange={(e) => setGymAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={gymPhone}
                          onChange={(e) => setGymPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={gymEmail}
                          onChange={(e) => setGymEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operating Hours</label>
                        <input
                          type="text"
                          value={operatingHours}
                          onChange={(e) => setOperatingHours(e.target.value)}
                          placeholder="e.g., 6:00 AM - 10:00 PM"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Database className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">System Configuration</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance</h3>
                    <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-600">
                      <ToggleSwitch
                        checked={enableCache}
                        onChange={setEnableCache}
                        label="Enable Caching"
                        description="Improve performance by caching frequently accessed data"
                      />
                      <ToggleSwitch
                        checked={infiniteScroll}
                        onChange={setInfiniteScroll}
                        label="Infinite Scroll"
                        description="Load content automatically as you scroll"
                      />
                      <ToggleSwitch
                        checked={realTimeUpdates}
                        onChange={setRealTimeUpdates}
                        label="Real-Time Updates"
                        description="Get live updates without refreshing the page"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                    <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-600">
                      <ToggleSwitch
                        checked={autoBackup}
                        onChange={setAutoBackup}
                        label="Automatic Backup"
                        description="Automatically backup data daily at 2:00 AM"
                      />
                      <ToggleSwitch
                        checked={maintenanceMode}
                        onChange={setMaintenanceMode}
                        label="Maintenance Mode"
                        description="Enable maintenance mode for system updates"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-400">System Actions</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Backup Now</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Restore</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        <span>Clear Cache</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleResetSettings}
                  className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset to Default</span>
                </button>
                
                <div className="flex items-center space-x-3">
                  <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;