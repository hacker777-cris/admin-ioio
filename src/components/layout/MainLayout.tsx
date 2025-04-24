import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoggedIn, loading } = useAuth();
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check local storage for user preference on sidebar state
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    if (storedState !== null) {
      setSidebarCollapsed(storedState === 'true');
    }
  }, []);

  // Save sidebar state to local storage when changed
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C3E50]"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className={`
        flex-1 flex flex-col
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
        transition-all duration-300 ease-in-out
      `}>
        <Header sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 overflow-auto pt-16 pb-6 px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;