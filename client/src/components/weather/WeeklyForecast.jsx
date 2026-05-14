import React from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { formatTemp } from '../../utils/tempConverter';
import { formatDayName } from '../../utils/timeFormatter';
import { OWM_ICON_URL } from '../../utils/constants';

/**
 * Weekly Forecast — 5-day daily forecast cards
 * Shows high/low temps, rain chance, weather icon
 */
export const WeeklyForecast = () => {
  const { dailyForecast, weatherLoading } = useWeather();
  const { user } = useAuth();
  const unit = user?.preferences?.temperatureUnit || 'C';

  if (weatherLoading && dailyForecast.length === 0) {
    return (
      <div className="glass-card p-6 space-y-3">
        <div className="skeleton h-6 w-40" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (dailyForecast.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
        5-Day Forecast
      </h3>

      <div className="space-y-2">
        {dailyForecast.map((day, i) => (
          <div
            key={day.date}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            {/* Day name */}
            <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {formatDayName(day.date)}
            </span>

            {/* Weather icon */}
            <img
              src={OWM_ICON_URL(day.weather?.icon || '01d')}
              alt={day.weather?.description || ''}
              className="w-8 h-8"
              loading="lazy"
            />

            {/* Rain chance */}
            <span className="w-12 text-xs text-blue-500 dark:text-blue-400 font-medium text-center">
              {day.pop > 0 ? `💧${day.pop}%` : ''}
            </span>

            {/* Temperature range bar */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-right">
                {formatTemp(day.tempMin, unit)}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-orange-400"
                  style={{
                    width: `${Math.max(20, ((day.tempMax - day.tempMin) / 40) * 100)}%`,
                    marginLeft: `${Math.max(0, ((day.tempMin + 10) / 50) * 100)}%`
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-white w-10">
                {formatTemp(day.tempMax, unit)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
