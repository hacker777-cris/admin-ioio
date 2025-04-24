import React, { useState, useEffect } from 'react';
import { moderationService } from '../../../services/moderation.service';
import { useNotification } from '../../../contexts/NotificationContext';
import { FlaggedMessage } from '../../../types';
import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '../../ui/Table';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';
import { formatDate } from '../../../utils/formatters';
import { CheckCircle, XCircle, AlertTriangle, Eye, Flag } from 'lucide-react';

const FlaggedMessageList: React.FC = () => {
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<FlaggedMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  
  const { showSuccess, showError } = useNotification();
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await moderationService.getFlaggedMessages(currentPage);
      setMessages(response.results);
      setTotalMessages(response.count);
    } catch (error) {
      showError('Failed to load flagged messages');
      console.error('Error loading flagged messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMessages();
  }, [currentPage]);
  
  const handleViewMessage = (message: FlaggedMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
    setActionNotes('');
  };
  
  const handleMarkReviewed = async () => {
    if (!selectedMessage) return;
    
    setActionInProgress(true);
    try {
      await moderationService.markFlaggedMessageReviewed(selectedMessage.id);
      showSuccess('Message marked as reviewed');
      
      // Update the local state
      setMessages(messages.map(message => 
        message.id === selectedMessage.id 
          ? { ...message, status: 'reviewed' } 
          : message
      ));
      
      handleCloseModal();
    } catch (error) {
      showError('Failed to mark message as reviewed');
      console.error('Error:', error);
    } finally {
      setActionInProgress(false);
    }
  };
  
  const handleTakeAction = async (action: string) => {
    if (!selectedMessage) return;
    
    setActionInProgress(true);
    try {
      await moderationService.takeActionOnFlaggedMessage(
        selectedMessage.id, 
        action, 
        actionNotes
      );
      
      showSuccess(`Action taken: ${action}`);
      
      // Update the local state
      setMessages(messages.map(message => 
        message.id === selectedMessage.id 
          ? { ...message, status: 'action_taken' } 
          : message
      ));
      
      handleCloseModal();
    } catch (error) {
      showError('Failed to take action');
      console.error('Error:', error);
    } finally {
      setActionInProgress(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="info">Reviewed</Badge>;
      case 'action_taken':
        return <Badge variant="success">Action Taken</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };
  
  // Render skeletons while loading
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
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
    <div>
      <h2 className="text-lg font-medium text-gray-800 mb-4">Flagged Messages</h2>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>User</TableCell>
            <TableCell header>Message Excerpt</TableCell>
            <TableCell header>Flags</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Date</TableCell>
            <TableCell header>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            renderSkeletons()
          ) : messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <p className="text-gray-500">No flagged messages found</p>
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>{message.user.username}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {message.message_content.length > 60
                    ? message.message_content.substring(0, 60) + '...'
                    : message.message_content}
                </TableCell>
                <TableCell>
                  <span className="flex items-center text-red-600">
                    <Flag size={14} className="mr-1" /> {message.flags}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(message.status)}</TableCell>
                <TableCell>{formatDate(message.created_at)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye size={16} />}
                    onClick={() => handleViewMessage(message)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        totalItems={totalMessages}
        itemsPerPage={10}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      {selectedMessage && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Flagged Message Details"
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <div className="space-x-2">
                {selectedMessage.status === 'pending' && (
                  <>
                    <Button
                      variant="secondary"
                      icon={<CheckCircle size={16} />}
                      onClick={handleMarkReviewed}
                      isLoading={actionInProgress}
                    >
                      Mark as Safe
                    </Button>
                    <Button
                      variant="danger"
                      icon={<XCircle size={16} />}
                      onClick={() => handleTakeAction('remove_message')}
                      isLoading={actionInProgress}
                    >
                      Remove Message
                    </Button>
                    <Button
                      variant="primary"
                      icon={<AlertTriangle size={16} />}
                      onClick={() => handleTakeAction('warn_user')}
                      isLoading={actionInProgress}
                    >
                      Warn User
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">User</h3>
              <p className="mt-1">{selectedMessage.user.username}</p>
              <p className="text-sm text-gray-500">{selectedMessage.user.email}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Message Content</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <Flag size={12} className="mr-1" /> {selectedMessage.flags} flags
                </span>
              </div>
              <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-start mb-2">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-[#2C3E50] flex items-center justify-center text-white text-sm font-medium">
                      {selectedMessage.user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex-grow">
                    <p className="text-gray-800">{selectedMessage.message_content}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-right">Message ID: {selectedMessage.message_id}</p>
              </div>
            </div>
            
            {selectedMessage.status === 'pending' && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Action Notes (Optional)</h3>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2C3E50] focus:ring focus:ring-[#2C3E50] focus:ring-opacity-50"
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Add notes about the action taken..."
                ></textarea>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FlaggedMessageList;