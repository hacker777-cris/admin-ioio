import React, { useState, useEffect } from 'react';
import { moderationService } from '../../../services/moderation.service';
import { useNotification } from '../../../contexts/NotificationContext';
import { Review } from '../../../types';
import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '../../ui/Table';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';
import { formatDate } from '../../../utils/formatters';
import { Eye, Trash2, Flag, Star } from 'lucide-react';

const ReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [removalReason, setRemovalReason] = useState('');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(true);
  
  const { showSuccess, showError } = useNotification();
  
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await moderationService.getReviews(currentPage, showFlaggedOnly);
      setReviews(response.results);
      setTotalReviews(response.count);
    } catch (error) {
      showError('Failed to load reviews');
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
  }, [currentPage, showFlaggedOnly]);
  
  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setRemovalReason('');
  };
  
  const handleRemoveReview = async () => {
    if (!selectedReview) return;
    
    setActionInProgress(true);
    try {
      await moderationService.removeReview(selectedReview.id, removalReason);
      showSuccess('Review removed successfully');
      
      // Update the local state by removing the review
      setReviews(reviews.filter(review => review.id !== selectedReview.id));
      
      handleCloseModal();
    } catch (error) {
      showError('Failed to remove review');
      console.error('Error:', error);
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Render stars for rating
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <Star 
            key={index} 
            size={16} 
            className={index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
          />
        ))}
      </div>
    );
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
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </TableCell>
      </TableRow>
    ));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Reviews</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Show flagged only</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={() => setShowFlaggedOnly(!showFlaggedOnly)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2C3E50]"></div>
          </label>
        </div>
      </div>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>Reviewer</TableCell>
            <TableCell header>Property</TableCell>
            <TableCell header>Rating</TableCell>
            <TableCell header>Content</TableCell>
            <TableCell header>Flags</TableCell>
            <TableCell header>Date</TableCell>
            <TableCell header>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            renderSkeletons()
          ) : reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <p className="text-gray-500">No reviews found</p>
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.reviewer.username}</TableCell>
                <TableCell>{review.property_name}</TableCell>
                <TableCell>{renderRatingStars(review.rating)}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {review.content.length > 50
                    ? review.content.substring(0, 50) + '...'
                    : review.content}
                </TableCell>
                <TableCell>
                  {review.is_flagged && (
                    <span className="flex items-center text-red-600">
                      <Flag size={14} className="mr-1" /> {review.flags_count}
                    </span>
                  )}
                </TableCell>
                <TableCell>{formatDate(review.created_at)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye size={16} />}
                    onClick={() => handleViewReview(review)}
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
        totalItems={totalReviews}
        itemsPerPage={10}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      {selectedReview && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Review Details"
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 size={16} />}
                onClick={handleRemoveReview}
                isLoading={actionInProgress}
              >
                Remove Review
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reviewer</h3>
                <p className="mt-1">{selectedReview.reviewer.username}</p>
                <p className="text-sm text-gray-500">{selectedReview.reviewer.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Property</h3>
                <p className="mt-1">{selectedReview.property_name}</p>
                <p className="text-sm text-gray-500">ID: {selectedReview.property_id}</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                <div className="flex">
                  {renderRatingStars(selectedReview.rating)}
                  <span className="ml-1 text-sm font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-500">Review Content</h3>
                {selectedReview.is_flagged && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <Flag size={12} className="mr-1" /> {selectedReview.flags_count} flags
                  </span>
                )}
              </div>
              <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="whitespace-pre-line">{selectedReview.content}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Removal Reason (Required)</h3>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2C3E50] focus:ring focus:ring-[#2C3E50] focus:ring-opacity-50"
                rows={3}
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="Provide a reason for removing this review..."
                required
              ></textarea>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReviewList;