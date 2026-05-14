import React, { useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { formatHour } from '../../utils/timeFormatter';
import { ChartSkeleton } from '../common/Skeleton';

/**
 * Temperature & Rain Probability Chart
 * Dual-axis: Temperature line + Rain probability area overlay
 */
export const TempRainChart = () => {
  const { forecastData, weatherLoading } = useWeather();
  const { user } = useAuth();
  const unit = user?.preferences?.temperatureUnit || 'C';

  const chartData = useMemo(() => {
    if (!forecastData?.list) return [];
    return forecastData.list.slice(0, 8).map(item => {
      const tempC = item.main.temp;
      const temp = unit === 'F' ? Math.round((tempC * 9 / 5) + 32) : Math.round(tempC);
      return {
        time: formatHour(item.dt),
        temp,
        rainProb: Math.round((item.pop || 0) * 100),
        humidity: item.main.humidity
      };
    });
  }, [forecastData, unit]);

  if (weatherLoading && chartData.length === 0) return <ChartSkeleton />;
  if (chartData.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
        Temperature & Rain Probability
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: 'rgba(128,128,128,0.2)' }}
          />
          <YAxis
            yAxisId="temp"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickFormatter={(v) => `${v}°`}
          />
          <YAxis
            yAxisId="rain"
            orientation="right"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 14, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Area
            yAxisId="rain"
            type="monotone"
            dataKey="rainProb"
            name="Rain %"
            stroke="#3b82f6"
            fill="url(#rainGradient)"
            strokeWidth={2}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temp"
            name={`Temp °${unit}`}
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{ fill: '#f97316', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
