import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
  headerActions,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {(title || headerActions) && (
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;