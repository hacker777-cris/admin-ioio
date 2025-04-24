import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Building, 
  Calendar, 
  ShieldAlert, 
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { formatNumber } from '../../../utils/formatters';
import { dashboardService } from '../../../services/dashboard.service';
import { 
  UserStats, 
  PropertyStats, 
  BookingStats, 
  ContentModerationStats 
} from '../../../types';
import StatCard from './StatCard';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useNotification } from '../../../contexts/NotificationContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [moderationStats, setModerationStats] = useState<ContentModerationStats | null>(null);
  
  const { showError } = useNotification();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [users, properties, bookings, moderation] = await Promise.all([
          dashboardService.getUserStats(),
          dashboardService.getPropertyStats(),
          dashboardService.getBookingStats(),
          dashboardService.getContentModerationStats(),
        ]);
        
        setUserStats(users);
        setPropertyStats(properties);
        setBookingStats(bookings);
        setModerationStats(moderation);
      } catch (error) {
        showError('Failed to load dashboard data');
        console.error('Dashboard data error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [showError]);
  
  const generateBookingStatusData = () => {
    if (!bookingStats) return [];
    
    return [
      { name: 'Pending', value: bookingStats.pending, color: '#F59E0B' },
      { name: 'Confirmed', value: bookingStats.confirmed, color: '#10B981' },
      { name: 'Completed', value: bookingStats.completed, color: '#2563EB' },
      { name: 'Cancelled', value: bookingStats.cancelled, color: '#EF4444' },
    ];
  };
  
  const generatePropertyData = () => {
    if (!propertyStats) return [];
    
    return [
      { name: 'Active', value: propertyStats.active },
      { name: 'Pending', value: propertyStats.pending },
      { name: 'Featured', value: propertyStats.featured },
    ];
  };
  
  // Skeleton loader for stats cards
  const renderSkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-3/4">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index}>{renderSkeletonCard()}</div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse h-80"></div>
          <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse h-80"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            icon={<Clock size={16} />}
          >
            Last 30 days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            icon={<AlertTriangle size={16} />}
          >
            Alerts
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats && (
          <StatCard
            title="Total Users"
            value={userStats.total}
            icon={<Users size={24} className="text-blue-600" />}
            trend={{
              value: Math.round((userStats.new_this_month / userStats.total) * 100),
              label: "from last month",
              isPositive: true,
            }}
          />
        )}
        
        {propertyStats && (
          <StatCard
            title="Properties"
            value={propertyStats.total}
            icon={<Building size={24} className="text-green-600" />}
            trend={{
              value: Math.round((propertyStats.new_this_week / propertyStats.total) * 100),
              label: "from last week",
              isPositive: true,
            }}
          />
        )}
        
        {bookingStats && (
          <StatCard
            title="Bookings"
            value={bookingStats.total}
            icon={<Calendar size={24} className="text-purple-600" />}
            trend={{
              value: Math.round((bookingStats.new_this_month / bookingStats.total) * 100),
              label: "from last month",
              isPositive: true,
            }}
          />
        )}
        
        {moderationStats && (
          <StatCard
            title="Pending Moderation"
            value={
              moderationStats.message_reports.pending +
              moderationStats.flagged_messages.pending +
              moderationStats.owner_reports.pending +
              moderationStats.reviews.flagged
            }
            icon={<ShieldAlert size={24} className="text-red-600" />}
          />
        )}
      </div>
      
      {/* Charts and Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Chart */}
        <Card title="Booking Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={generateBookingStatusData()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {generateBookingStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}`, 'Bookings']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Property Statistics */}
        <Card title="Property Statistics">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generatePropertyData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Properties']}
              />
              <Legend />
              <Bar dataKey="value" fill="#2C3E50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* Moderation Queue Overview */}
      {moderationStats && (
        <Card 
          title="Content Moderation Queue" 
          headerActions={
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => window.location.href = '/moderation'}
            >
              View All
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Message Reports</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  moderationStats.message_reports.pending > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {moderationStats.message_reports.pending} Pending
                </span>
              </div>
              <p className="text-2xl font-semibold">{moderationStats.message_reports.total}</p>
              <p className="text-sm text-gray-500">
                {moderationStats.message_reports.resolved} resolved
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Flagged Messages</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  moderationStats.flagged_messages.pending > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {moderationStats.flagged_messages.pending} Pending
                </span>
              </div>
              <p className="text-2xl font-semibold">{moderationStats.flagged_messages.total}</p>
              <p className="text-sm text-gray-500">
                {moderationStats.flagged_messages.resolved} resolved
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Owner Reports</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  moderationStats.owner_reports.pending > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {moderationStats.owner_reports.pending} Pending
                </span>
              </div>
              <p className="text-2xl font-semibold">{moderationStats.owner_reports.total}</p>
              <p className="text-sm text-gray-500">
                {moderationStats.owner_reports.resolved} resolved
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Flagged Reviews</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  moderationStats.reviews.flagged > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {moderationStats.reviews.flagged} Flagged
                </span>
              </div>
              <p className="text-2xl font-semibold">{moderationStats.reviews.total}</p>
              <p className="text-sm text-gray-500">
                {moderationStats.reviews.removed} removed
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;