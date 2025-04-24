import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  AlertTriangle, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Building,
  Calendar,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <Home size={20} />,
    },
    {
      title: 'Users',
      path: '/users',
      icon: <Users size={20} />,
    },
    {
      title: 'Properties',
      path: '/properties',
      icon: <Building size={20} />,
    },
    {
      title: 'Bookings',
      path: '/bookings',
      icon: <Calendar size={20} />,
    },
    {
      title: 'Content Moderation',
      path: '/moderation',
      icon: <ShieldAlert size={20} />,
      badge: 5, // This could be dynamic in a real implementation
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />,
    },
  ];
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <aside 
      className={`
        bg-[#2C3E50] text-white flex flex-col h-screen 
        ${collapsed ? 'w-16' : 'w-64'} 
        transition-all duration-300 ease-in-out
        fixed left-0 top-0 z-10
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#3D5A73]">
        {!collapsed && (
          <Link to="/dashboard" className="text-xl font-bold">
            IOIO Admin
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="text-xl font-bold mx-auto">
            IO
          </Link>
        )}
        <button 
          onClick={onToggle} 
          className={`text-gray-300 hover:text-white ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-grow mt-5 px-2">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-md transition-colors
                  ${isActive(item.path) 
                    ? 'bg-[#1E2A36] text-white' 
                    : 'text-gray-300 hover:bg-[#3D5A73] hover:text-white'}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="ml-3">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User */}
      <div className={`border-t border-[#3D5A73] mt-auto px-4 py-4 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-[#2C3E50] font-semibold">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-300">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-gray-300 flex items-center justify-center text-[#2C3E50] font-semibold">
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;