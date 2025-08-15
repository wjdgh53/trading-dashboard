'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-600 border-t-blue-500',
            sizeClasses[size]
          )}
        />
        {text && (
          <p className="text-sm text-gray-400 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-700/50',
        className
      )}
    />
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('bg-gray-800/50 border border-gray-700 rounded-xl p-6', className)}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-16 h-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center space-x-4 pb-2 border-b border-gray-700">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4 py-2">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                'h-6',
                colIndex === 0 ? 'w-16' : 'flex-1'
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface ChartSkeletonProps {
  height?: string;
  className?: string;
}

export function ChartSkeleton({ height = 'h-96', className }: ChartSkeletonProps) {
  return (
    <div className={cn('bg-gray-800/30 rounded-lg animate-pulse flex items-center justify-center', height, className)}>
      <div className="text-gray-500 flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-600 rounded animate-pulse" />
        Loading chart data...
      </div>
    </div>
  );
}

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-96 h-4" />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-32 h-8" />
        </div>
        <ChartSkeleton />
      </div>

      {/* Table Skeleton */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-24 h-8" />
        </div>
        <TableSkeleton rows={10} columns={4} />
      </div>
    </div>
  );
}

export default LoadingSpinner;