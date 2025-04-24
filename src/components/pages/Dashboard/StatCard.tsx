import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../ui/Card';

interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  className = '',
  trend,
}) => {
  const formattedValue = new Intl.NumberFormat().format(value);
  
  return (
    <Card className={`${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-gray-900">{formattedValue}</h3>
          
          {trend && (
            <div className="mt-1 flex items-center text-sm">
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                <span className="inline-flex items-center">
                  {trend.isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                  {trend.value}%
                </span>
              </span>
              <span className="ml-1 text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-100">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;