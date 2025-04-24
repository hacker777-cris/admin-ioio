import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  User,
  CheckCircle,
  XCircle,
  Eye,
  UserCog,
  Download
} from 'lucide-react';
import { usersService } from '../../../services/users.service';
import { User as UserType, UserFilters } from '../../../types';
import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '../../ui/Table';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import Badge from '../../ui/Badge';
import { useNotification } from '../../../contexts/NotificationContext';
import { formatDate } from '../../../utils/formatters';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  
  const fetchUsers = async (page: number, filters: UserFilters) => {
    setLoading(true);
    try {
      const response = await usersService.getUsers(filters, page);
      setUsers(response.results);
      setTotalUsers(response.count);
    } catch (error) {
      showError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers(currentPage, filters);
  }, [currentPage, filters]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout to avoid too many API calls
    const timeout = setTimeout(() => {
      setFilters({ ...filters, search: query });
      setCurrentPage(1);
    }, 500);
    
    setSearchTimeout(timeout);
  };
  
  const handleFilterChange = (name: string, value: string) => {
    if (value === 'all') {
      const newFilters = { ...filters };
      delete newFilters[name as keyof UserFilters];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [name]: value === 'true' });
    }
    setCurrentPage(1);
  };
  
  const handleViewUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };
  
  const handleToggleUserStatus = async (user: UserType) => {
    try {
      if (user.is_active) {
        await usersService.deactivateUser(user.id);
        showSuccess('User deactivated successfully');
      } else {
        await usersService.activateUser(user.id);
        showSuccess('User activated successfully');
      }
      
      // Update the local state
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, is_active: !u.is_active }
          : u
      ));
    } catch (error) {
      showError(`Failed to ${user.is_active ? 'deactivate' : 'activate'} user`);
      console.error('Status toggle error:', error);
    }
  };
  
  const handleExportUsers = () => {
    // This would be implemented based on your export requirements
    showSuccess('User data export started');
  };
  
  // Render skeletons while loading
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mt-1 animate-pulse"></div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </TableCell>
      </TableRow>
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Button
          variant="outline"
          icon={<Download size={16} />}
          onClick={handleExportUsers}
        >
          Export Users
        </Button>
      </div>
      
      <Card>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>
            <Button
              variant="outline"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <Select
                label="Status"
                value={filters.is_active === undefined ? 'all' : filters.is_active.toString()}
                onChange={(e) => handleFilterChange('is_active', e.target.value)}
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ]}
              />
              <Select
                label="Role"
                value={filters.is_staff === undefined ? 'all' : filters.is_staff.toString()}
                onChange={(e) => handleFilterChange('is_staff', e.target.value)}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'true', label: 'Admin' },
                  { value: 'false', label: 'Regular User' },
                ]}
              />
            </div>
          )}
          
          {/* Users Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>User</TableCell>
                <TableCell header>Email</TableCell>
                <TableCell header>Role</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Joined</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletons()
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <User size={48} className="text-gray-300 mb-2" />
                      <p className="text-gray-500">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#2C3E50] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_staff ? 'info' : 'default'}>
                        {user.is_staff ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'success' : 'danger'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.date_joined)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => handleViewUser(user.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant={user.is_active ? 'danger' : 'success'}
                          size="sm"
                          icon={user.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <TablePagination
            totalItems={totalUsers}
            itemsPerPage={10}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserList;