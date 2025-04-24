// Date formatters
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Number formatters
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

// Text formatters
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatStatusText = (status: string): string => {
  return status.replace(/_/g, ' ').split(' ').map(capitalizeFirstLetter).join(' ');
};

// Helper to generate badge color based on status
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    // General statuses
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    
    // Content moderation
    reviewed: 'bg-blue-100 text-blue-800',
    action_taken: 'bg-purple-100 text-purple-800',
    investigating: 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  
  return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};