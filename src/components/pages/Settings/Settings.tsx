import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { Save, Lock, Eye, EyeOff } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, changePassword } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const toggleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  
  const validateForm = () => {
    const formErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!currentPassword) {
      formErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      formErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      formErrors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (newPassword !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      showSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showError('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-[#2C3E50] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              
              <div className="mt-6 w-full space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-[#2C3E50]">
                  Account Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md bg-gray-100 font-medium text-[#2C3E50]">
                  Change Password
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-[#2C3E50]">
                  Notification Preferences
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-[#2C3E50]">
                  API Access
                </button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card title="Change Password">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button 
                    type="button" 
                    onClick={toggleShowCurrentPassword} 
                    className="text-gray-400 hover:text-gray-500 p-1" 
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                error={errors.currentPassword}
              />
              
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button 
                    type="button" 
                    onClick={toggleShowNewPassword} 
                    className="text-gray-400 hover:text-gray-500 p-1" 
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                helperText="Password must be at least 8 characters long"
                error={errors.newPassword}
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                error={errors.confirmPassword}
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Save size={16} />}
                  isLoading={loading}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
          
          <Card title="Two-Factor Authentication" className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Protect your account with two-factor authentication.</p>
                <p className="text-xs text-gray-500 mt-1">
                  You'll be asked for an additional authentication code when signing in.
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </Card>
          
          <Card title="Session Management" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Session</p>
                  <p className="text-xs text-gray-500 mt-1">Chrome on Windows • Last active now</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Other Session</p>
                  <p className="text-xs text-gray-500 mt-1">Safari on macOS • Last active 2 days ago</p>
                </div>
                <Button variant="outline" size="sm">Revoke</Button>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Button variant="danger" size="sm">Sign Out All Other Sessions</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;