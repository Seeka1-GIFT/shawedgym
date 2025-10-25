import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, CreditCard, Package, Calendar, 
  UserCheck, ClipboardList, DollarSign, TrendingDown, 
  FileText, Settings, Menu, X, Sun, Moon, Dumbbell, 
  Activity, Target, LogOut, Shield 
} from 'lucide-react';
// NotificationSystem removed per request
import GymSelector from './GymSelector.jsx';
import { authHelpers } from '../services/api.js';

// Enhanced navigation items with icons
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: Home, roles: ['admin', 'cashier'] },
  { label: 'Check-In/Out', path: '/checkin', icon: Activity, roles: ['admin'] },
  { label: 'Members', path: '/members', icon: Users, roles: ['admin', 'cashier'] },
  { label: 'Plans', path: '/plans', icon: CreditCard, roles: ['admin'] },
  { label: 'Subscriptions', path: '/subscriptions', icon: Target, roles: ['admin'] },
  { label: 'Assets', path: '/assets', icon: Package, roles: ['admin', 'cashier'] },
  { label: 'Classes', path: '/classes', icon: Calendar, roles: ['admin'] },
  { label: 'Trainers', path: '/trainers', icon: UserCheck, roles: ['admin'] },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList, roles: ['admin', 'cashier'] },
  { label: 'Payments', path: '/payments', icon: DollarSign, roles: ['admin', 'cashier'] },
  { label: 'Expenses', path: '/expenses', icon: TrendingDown, roles: ['admin'] },
  { label: 'Reports', path: '/reports', icon: FileText, roles: ['admin'] },
  { label: 'User Management', path: '/users', icon: Shield, roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
];

/**
 * Modern, glassmorphism-style sidebar navigation with enhanced visuals
 */
const Navbar = ({ theme, setTheme }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = authHelpers.getUser();

  const toggleMenu = () => {
    setOpen(!open);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    authHelpers.removeAuthToken();
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'authToken',
      newValue: null,
      oldValue: localStorage.getItem('authToken')
    }));
    navigate('/login');
  };

  return (
    <div className="relative z-20">
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300"
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-25"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static left-0 top-0 h-full w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl transform transition-all duration-300 ease-in-out z-30 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ShawedGym
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fitness Management</p>
                </div>
              </div>
              
              {/* Notification System removed */}
            </div>
            
            {/* Gym Selector */}
            <div className="mt-4">
              <GymSelector />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role)).map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end
                className={({ isActive }) =>
                  `group flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:transform hover:scale-[1.02]'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Theme Toggle & User Section */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
            {/* User Profile Preview */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mb-2"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="font-medium">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Navbar;
