import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loader component
 * Animated pulse placeholder matching component layouts
 */
export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClasses = 'skeleton animate-pulse';
  
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-2xl',
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant] || variants.rect} ${className}`}
      aria-hidden="true"
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['rect', 'circle', 'text', 'card'])
};

/**
 * Weather Card Skeleton
 */
export const WeatherCardSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-10" variant="circle" />
    </div>
    <Skeleton className="h-16 w-24" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Skeleton className="h-16" variant="card" />
      <Skeleton className="h-16" variant="card" />
      <Skeleton className="h-16" variant="card" />
    </div>
  </div>
);

/**
 * Hourly Forecast Skeleton
 */
export const HourlyForecastSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <Skeleton className="h-6 w-40" />
    <div className="flex gap-3 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex-shrink-0 space-y-2 text-center">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-8 mx-auto" variant="circle" />
          <Skeleton className="h-4 w-10 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Chart Skeleton
 */
export const ChartSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-48 w-full" variant="card" />
  </div>
);

/**
 * Dashboard full skeleton
 */
export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <WeatherCardSkeleton />
    <HourlyForecastSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);
