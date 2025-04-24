import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import MainLayout from './components/layout/MainLayout';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard/Dashboard';
import UserList from './components/pages/Users/UserList';
import UserDetail from './components/pages/Users/UserDetail';
import ContentModeration from './components/pages/Moderation/ContentModeration';
import Settings from './components/pages/Settings/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/:userId" element={<UserDetail />} />
              <Route path="moderation" element={<ContentModeration />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;