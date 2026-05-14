import React, { useMemo, useEffect, useRef } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { ALERT_LEVELS } from '../../utils/rainRiskCalculator';
import { usePushNotification } from '../../hooks/usePushNotification';
import { ALERT_LEVEL_ORDER } from '../../utils/constants';

/**
 * Alert Banner — Shows at the top of dashboard when risk >= WATCH
 * Color-coded with level badge, message, peak window, and advice
 */
export const AlertBanner = () => {
  const { rainRisk, selectedLocation, createAlert } = useWeather();
  const { user } = useAuth();
  const { permission, requestPermission, showLocalNotification } = usePushNotification();
  const prevLevelRef = useRef(null);

  const alertConfig = useMemo(() => {
    if (!rainRisk) return null;
    return ALERT_LEVELS[rainRisk.level] || ALERT_LEVELS.SAFE;
  }, [rainRisk]);

  // Send notification when alert level changes
  useEffect(() => {
    if (!rainRisk || !selectedLocation) return;

    const currentLevel = rainRisk.level;
    const prevLevel = prevLevelRef.current;

    // Only notify on level change, and only if above user's threshold
    if (prevLevel && prevLevel !== currentLevel) {
      const threshold = user?.preferences?.alertThreshold || 'WATCH';
      const currentOrder = ALERT_LEVEL_ORDER[currentLevel] || 0;
      const thresholdOrder = ALERT_LEVEL_ORDER[threshold] || 1;

      if (currentOrder >= thresholdOrder && user?.preferences?.pushNotifications !== false) {
        // Send local notification
        if (permission === 'granted') {
          showLocalNotification(
            `${ALERT_LEVELS[currentLevel]?.emoji} Rain ${currentLevel} — ${selectedLocation.name}`,
            `${rainRisk.message}${rainRisk.peakWindow ? '\n' + rainRisk.peakWindow : ''}`
          );
        } else if (permission === 'default') {
          requestPermission();
        }

        // Log alert to database
        createAlert({
          location: {
            name: selectedLocation.name,
            lat: selectedLocation.lat,
            lon: selectedLocation.lon
          },
          level: currentLevel,
          riskScore: rainRisk.score,
          message: rainRisk.message,
          peakWindow: rainRisk.peakWindow
        });
      }
    }

    prevLevelRef.current = currentLevel;
  }, [rainRisk, selectedLocation, user, permission, requestPermission, showLocalNotification, createAlert]);

  if (!rainRisk || rainRisk.level === 'SAFE') return null;

  const bgColors = {
    WATCH: 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/30',
    WARNING: 'from-orange-500/10 to-orange-600/10 border-orange-500/30',
    DANGER: 'from-red-500/10 to-red-600/10 border-red-500/30'
  };

  const textColors = {
    WATCH: 'text-yellow-700 dark:text-yellow-300',
    WARNING: 'text-orange-700 dark:text-orange-300',
    DANGER: 'text-red-700 dark:text-red-300'
  };

  return (
    <div
      className={`
        rounded-2xl border p-4 bg-gradient-to-r ${bgColors[rainRisk.level]} 
        animate-slide-down
      `}
      role="alert"
      id="rain-alert-banner"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">
          {alertConfig?.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${alertConfig?.bgClass}`}>
              {rainRisk.level}
            </span>
            <span className={`text-sm font-semibold ${textColors[rainRisk.level]}`}>
              Risk Score: {rainRisk.score}/100
            </span>
          </div>
          <p className={`mt-1 text-sm font-medium ${textColors[rainRisk.level]}`}>
            {rainRisk.message}
          </p>
          {rainRisk.peakWindow && (
            <p className={`mt-1 text-xs ${textColors[rainRisk.level]} opacity-80`}>
              🕐 {rainRisk.peakWindow}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {alertConfig?.advice}
          </p>
        </div>
      </div>
    </div>
  );
};
