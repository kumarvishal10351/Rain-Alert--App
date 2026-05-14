import React, { useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import { useWeather } from '../../context/WeatherContext';
import { formatHour } from '../../utils/timeFormatter';
import { getWindDirection } from '../../utils/constants';
import { ChartSkeleton } from '../common/Skeleton';

/**
 * Wind Speed & Direction Chart
 * Shows wind speed (m/s) as bars and direction labels for next 12 hours
 */
export const WindChart = () => {
  const { forecastData, weatherLoading } = useWeather();

  const chartData = useMemo(() => {
    if (!forecastData?.list) return [];
    return forecastData.list.slice(0, 4).map(item => ({
      time: formatHour(item.dt),
      speed: parseFloat((item.wind?.speed || 0).toFixed(1)),
      gust: parseFloat((item.wind?.gust || 0).toFixed(1)),
      direction: getWindDirection(item.wind?.deg || 0)
    }));
  }, [forecastData]);

  if (weatherLoading && chartData.length === 0) return <ChartSkeleton />;
  if (chartData.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
        Wind Speed
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: 'rgba(128,128,128,0.2)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 14, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
            formatter={(value, name) => [`${value} m/s`, name === 'speed' ? 'Wind Speed' : 'Gusts']}
            labelFormatter={(label, payload) => {
              const entry = payload?.[0]?.payload;
              return `${label} — Direction: ${entry?.direction || 'N/A'}`;
            }}
          />
          <Bar dataKey="speed" name="Wind Speed" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
          <Line dataKey="gust" name="Gusts" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
