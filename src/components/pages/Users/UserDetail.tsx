import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  User, 
  Mail, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  ArrowLeft, 
  Lock,
  RefreshCw
} from 'lucide-react';
import { User as UserType } from '../../../types';
import { usersService } from '../../../services/users.service';
import { formatDate } from '../../../utils/formatters';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Badge from '../../ui/Badge';
import { useNotification } from '../../../contexts/NotificationContext';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});
  
  useEffect(() => {
    fetchUserData();
  }, [userId]);
  
  const fetchUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userData = await usersService.getUserById(parseInt(userId));
      setUser(userData);
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        is_active: userData.is_active,
        is_staff: userData.is_staff,
      });
    } catch (error) {
      showError('Failed to load user data');
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSave = async () => {
    if (!user || !userId) return;
    
    setSaving(true);
    try {
      const updatedUser = await usersService.updateUser(parseInt(userId), formData);
      setUser(updatedUser);
      showSuccess('User updated successfully');
    } catch (error) {
      showError('Failed to update user');
      console.error('Update error:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleActivationToggle = async () => {
    if (!user || !userId) return;
    
    try {
      if (user.is_active) {
        await usersService.deactivateUser(parseInt(userId));
        setUser({ ...user, is_active: false });
        setFormData({ ...formData, is_active: false });
        showSuccess('User deactivated successfully');
      } else {
        await usersService.activateUser(parseInt(userId));
        setUser({ ...user, is_active: true });
        setFormData({ ...formData, is_active: true });
        showSuccess('User activated successfully');
      }
    } catch (error) {
      showError(`Failed to ${user.is_active ? 'deactivate' : 'activate'} user`);
      console.error('Activation toggle error:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C3E50]"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/users')}
        >
          Back to Users
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/users')}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={user.is_active ? 'danger' : 'success'}
            icon={user.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
            onClick={handleActivationToggle}
          >
            {user.is_active ? 'Deactivate User' : 'Activate User'}
          </Button>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>
      
      {/* User Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-[#2C3E50] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-4">
                <Badge variant={user.is_active ? 'success' : 'danger'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {user.is_staff && (
                  <Badge variant="info" className="ml-2">
                    Admin
                  </Badge>
                )}
              </div>
              
              <div className="mt-6 w-full border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center">
                    <User size={16} className="mr-2" /> Username
                  </span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center">
                    <Calendar size={16} className="mr-2" /> Joined
                  </span>
                  <span className="font-medium">{formatDate(user.date_joined)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center">
                    <RefreshCw size={16} className="mr-2" /> Last Login
                  </span>
                  <span className="font-medium">{formatDate(user.last_login)}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full mt-6"
                icon={<Lock size={16} />}
              >
                Reset Password
              </Button>
            </div>
          </Card>
        </div>
        
        {/* User Edit Form */}
        <div className="md:col-span-2">
          <Card title="User Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  placeholder="First Name"
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                />
              </div>
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                placeholder="Email"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="User Status"
                  name="is_active"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                />
                <Select
                  label="User Role"
                  name="is_staff"
                  value={formData.is_staff ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, is_staff: e.target.value === 'true'})}
                  options={[
                    { value: 'false', label: 'Regular User' },
                    { value: 'true', label: 'Administrator' },
                  ]}
                />
              </div>
            </div>
          </Card>
          
          <Card title="Activity" className="mt-6">
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700">User profile was updated</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700">User status changed to Active</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Mail size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Email address was verified</p>
                  <p className="text-xs text-gray-500">2 weeks ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;