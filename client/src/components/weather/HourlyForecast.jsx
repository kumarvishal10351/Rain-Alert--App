import React, { useMemo } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { formatTemp } from '../../utils/tempConverter';
import { formatHour } from '../../utils/timeFormatter';
import { OWM_ICON_URL } from '../../utils/constants';
import { HourlyForecastSkeleton } from '../common/Skeleton';

/**
 * Hourly Forecast — Scrollable horizontal timeline
 * Shows next 24 hours (8 × 3-hour intervals)
 */
export const HourlyForecast = () => {
  const { forecastData, weatherLoading } = useWeather();
  const { user } = useAuth();
  const unit = user?.preferences?.temperatureUnit || 'C';

  const hourlyData = useMemo(() => {
    if (!forecastData?.list) return [];
    return forecastData.list.slice(0, 8).map(item => ({
      dt: item.dt,
      time: formatHour(item.dt),
      temp: item.main.temp,
      icon: item.weather[0]?.icon || '01d',
      description: item.weather[0]?.description || '',
      pop: Math.round((item.pop || 0) * 100),
      rain: item.rain?.['3h'] || 0
    }));
  }, [forecastData]);

  if (weatherLoading && hourlyData.length === 0) return <HourlyForecastSkeleton />;
  if (hourlyData.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
        24-Hour Forecast
      </h3>

      <div className="scroll-horizontal">
        {hourlyData.map((hour, i) => (
          <div
            key={hour.dt}
            className={`
              flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl min-w-[80px]
              transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/5
              ${i === 0 ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : ''}
            `}
          >
            <span className={`text-xs font-medium ${i === 0 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {hour.time}
            </span>
            <img
              src={OWM_ICON_URL(hour.icon)}
              alt={hour.description}
              className="w-8 h-8"
              loading="lazy"
            />
            <span className="text-sm font-bold text-gray-800 dark:text-white">
              {formatTemp(hour.temp, unit)}
            </span>
            {hour.pop > 0 && (
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">
                💧 {hour.pop}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
