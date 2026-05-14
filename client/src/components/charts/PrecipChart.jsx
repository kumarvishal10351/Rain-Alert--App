import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import { useWeather } from '../../context/WeatherContext';
import { formatDayName } from '../../utils/timeFormatter';
import { ChartSkeleton } from '../common/Skeleton';

/**
 * 5-Day Precipitation Bar Chart
 * Shows total rainfall (mm) per day with color coding
 */
export const PrecipChart = () => {
  const { dailyForecast, weatherLoading } = useWeather();

  const chartData = useMemo(() => {
    if (!dailyForecast?.length) return [];
    return dailyForecast.map(day => ({
      day: formatDayName(day.date),
      rain: day.totalRain,
      pop: day.pop
    }));
  }, [dailyForecast]);

  if (weatherLoading && chartData.length === 0) return <ChartSkeleton />;
  if (chartData.length === 0) return null;

  const getBarColor = (rain) => {
    if (rain <= 1) return '#22c55e';
    if (rain <= 5) return '#eab308';
    if (rain <= 15) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
        5-Day Precipitation
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: 'rgba(128,128,128,0.2)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickFormatter={(v) => `${v}mm`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 14, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
            formatter={(value) => [`${value} mm`, 'Rainfall']}
          />
          <Bar dataKey="rain" name="Rainfall (mm)" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.rain)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
