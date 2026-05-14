import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { formatTemp } from '../../utils/tempConverter';
import { formatTime } from '../../utils/timeFormatter';
import { OWM_ICON_URL, getWindDirection } from '../../utils/constants';
import { WeatherCardSkeleton } from '../common/Skeleton';

/**
 * Current Weather Display Card
 * Shows: temp, feels like, description, humidity, wind, pressure, visibility, sunrise/sunset
 */
export const CurrentWeather = () => {
  const { currentWeather, weatherLoading, selectedLocation, rainRisk } = useWeather();
  const { user } = useAuth();
  const unit = user?.preferences?.temperatureUnit || 'C';

  const weatherData = useMemo(() => {
    if (!currentWeather) return null;
    return {
      temp: currentWeather.main?.temp,
      feelsLike: currentWeather.main?.feels_like,
      description: currentWeather.weather?.[0]?.description || 'N/A',
      icon: currentWeather.weather?.[0]?.icon || '01d',
      humidity: currentWeather.main?.humidity,
      pressure: currentWeather.main?.pressure,
      windSpeed: currentWeather.wind?.speed,
      windDeg: currentWeather.wind?.deg,
      visibility: currentWeather.visibility,
      sunrise: currentWeather.sys?.sunrise,
      sunset: currentWeather.sys?.sunset
    };
  }, [currentWeather]);

  if (weatherLoading && !weatherData) return <WeatherCardSkeleton />;
  if (!weatherData) return null;

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Location & Description */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white" id="location-name">
            {selectedLocation?.name || 'Unknown Location'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-0.5">
            {weatherData.description}
          </p>
        </div>
        <img
          src={OWM_ICON_URL(weatherData.icon)}
          alt={weatherData.description}
          className="w-16 h-16 -mt-2 -mr-2"
        />
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight" id="current-temp">
          {formatTemp(weatherData.temp, unit)}
        </span>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Feels like</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            {formatTemp(weatherData.feelsLike, unit)}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          icon="💧"
          label="Humidity"
          value={`${weatherData.humidity}%`}
        />
        <StatCard
          icon="💨"
          label="Wind"
          value={`${weatherData.windSpeed?.toFixed(1)} m/s`}
          subtitle={getWindDirection(weatherData.windDeg || 0)}
        />
        <StatCard
          icon="🌡️"
          label="Pressure"
          value={`${weatherData.pressure} hPa`}
        />
        <StatCard
          icon="👁️"
          label="Visibility"
          value={`${((weatherData.visibility || 0) / 1000).toFixed(1)} km`}
        />
        <StatCard
          icon="🌅"
          label="Sunrise"
          value={weatherData.sunrise ? formatTime(weatherData.sunrise) : '--'}
        />
        <StatCard
          icon="🌇"
          label="Sunset"
          value={weatherData.sunset ? formatTime(weatherData.sunset) : '--'}
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtitle }) => (
  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/10">
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-sm">{icon}</span>
      <span className="text-xs text-gray-500 dark:text-gray-500">{label}</span>
    </div>
    <p className="font-semibold text-gray-800 dark:text-white text-sm">{value}</p>
    {subtitle && (
      <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
    )}
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  subtitle: PropTypes.string
};
