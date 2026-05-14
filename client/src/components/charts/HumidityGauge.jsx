import React, { useMemo } from 'react';
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { useWeather } from '../../context/WeatherContext';

/**
 * Humidity Gauge — Radial chart showing current humidity
 */
export const HumidityGauge = () => {
  const { currentWeather, weatherLoading } = useWeather();

  const humidity = currentWeather?.main?.humidity || 0;

  const data = useMemo(() => [{
    name: 'Humidity',
    value: humidity,
    fill: humidity <= 40 ? '#22c55e' : humidity <= 70 ? '#eab308' : '#3b82f6'
  }], [humidity]);

  if (weatherLoading && !currentWeather) {
    return (
      <div className="glass-card p-6">
        <div className="skeleton h-6 w-32 mb-4" />
        <div className="skeleton h-40 w-40 mx-auto rounded-full" />
      </div>
    );
  }

  const getHumidityLabel = (h) => {
    if (h <= 30) return 'Low';
    if (h <= 60) return 'Comfortable';
    if (h <= 80) return 'Humid';
    return 'Very Humid';
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">
        Humidity
      </h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="90%"
            data={data}
            startAngle={210}
            endAngle={-30}
            barSize={14}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={10}
              background={{ fill: 'rgba(128,128,128,0.1)' }}
              clockWise
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
            {humidity}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {getHumidityLabel(humidity)}
          </span>
        </div>
      </div>
    </div>
  );
};
