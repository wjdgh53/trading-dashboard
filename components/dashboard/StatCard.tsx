'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'text-blue-400',
  bgColor = 'bg-blue-400/10',
  isLoading = false,
  trend = 'neutral'
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-gray-900 border-gray-800 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-12 w-12 bg-gray-700 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '';
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            {trend !== 'neutral' && (
              <span className={`text-xs ${color}`}>{getTrendIcon()}</span>
            )}
          </div>
          <p className={`text-2xl font-bold ${color} mb-1 group-hover:scale-105 transition-transform`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

export default StatCard;