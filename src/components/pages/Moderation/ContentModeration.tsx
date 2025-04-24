import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { moderationService } from '../../../services/moderation.service';
import { 
  MessageSquare, 
  AlertTriangle, 
  Flag, 
  Star, 
  CheckCircle,
  XCircle,
  Search,
  Eye
} from 'lucide-react';
import Tabs from '../../ui/Tabs';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import Badge from '../../ui/Badge';
import { formatDate } from '../../../utils/formatters';
import MessageReportList from './MessageReportList';
import FlaggedMessageList from './FlaggedMessageList';
import OwnerReportList from './OwnerReportList';
import ReviewList from './ReviewList';

const ContentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('message-reports');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    messageReports: 0,
    flaggedMessages: 0,
    ownerReports: 0,
    flaggedReviews: 0,
  });
  
  const { showError } = useNotification();
  
  useEffect(() => {
    fetchModerationStats();
  }, []);
  
  const fetchModerationStats = async () => {
    setLoading(true);
    try {
      const moderationStats = await moderationService.getContentModerationStats();
      
      setStats({
        messageReports: moderationStats.message_reports.pending,
        flaggedMessages: moderationStats.flagged_messages.pending,
        ownerReports: moderationStats.owner_reports.pending,
        flaggedReviews: moderationStats.reviews.flagged,
      });
    } catch (error) {
      showError('Failed to load moderation statistics');
      console.error('Moderation stats error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    {
      id: 'message-reports',
      label: 'Message Reports',
      count: stats.messageReports,
      icon: <MessageSquare size={20} />,
    },
    {
      id: 'flagged-messages',
      label: 'Flagged Messages',
      count: stats.flaggedMessages,
      icon: <Flag size={20} />,
    },
    {
      id: 'owner-reports',
      label: 'Owner Reports',
      count: stats.ownerReports,
      icon: <AlertTriangle size={20} />,
    },
    {
      id: 'flagged-reviews',
      label: 'Flagged Reviews',
      count: stats.flaggedReviews,
      icon: <Star size={20} />,
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
      </div>
      
      <Card className="overflow-visible">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        
        <div className="pt-6">
          {activeTab === 'message-reports' && (
            <MessageReportList />
          )}
          
          {activeTab === 'flagged-messages' && (
            <FlaggedMessageList />
          )}
          
          {activeTab === 'owner-reports' && (
            <OwnerReportList />
          )}
          
          {activeTab === 'flagged-reviews' && (
            <ReviewList />
          )}
        </div>
      </Card>
    </div>
  );
};

export default ContentModeration;