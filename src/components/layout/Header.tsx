import React from 'react';
import { Bell, HelpCircle, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  const notificationCount = 3; // This would be dynamic in a real implementation
  
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const toggleNotifications = () => setShowNotifications(!showNotifications);
  
  const handleLogout = async () => {
    await logout();
    // Redirect happens automatically due to auth context
  };
  
  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-10
      flex items-center justify-between px-6
      ${sidebarCollapsed ? 'left-16' : 'left-64'}
      transition-all duration-300 ease-in-out
    `}>
      {/* Left side - Page title / breadcrumbs would go here in a real implementation */}
      <div className="text-lg font-medium text-gray-800">
        IOIO Real Estate Admin
      </div>
      
      {/* Right side - User menu and notifications */}
      <div className="flex items-center space-x-4">
        {/* Help */}
        <button className="text-gray-500 hover:text-gray-700 p-1">
          <HelpCircle size={20} />
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            className="text-gray-500 hover:text-gray-700 p-1 relative"
            onClick={toggleNotifications}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform -translate-y-1 translate-x-1">
                {notificationCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <button className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </button>
                <button className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">New message report</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">System update completed</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </button>
              </div>
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <button className="text-xs font-medium text-[#2C3E50] hover:text-[#1E2A36]">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User menu */}
        <div className="relative">
          <button 
            className="flex items-center text-sm focus:outline-none"
            onClick={toggleUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-[#2C3E50] flex items-center justify-center text-white">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <span className="ml-2 hidden sm:inline-block">{user?.first_name || user?.username}</span>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User size={16} className="mr-2" />
                Profile
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;