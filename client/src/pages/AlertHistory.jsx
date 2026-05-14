import React from 'react';
import { Link } from 'react-router-dom';
import { useWeather } from '../context/WeatherContext';
import { getRelativeTime } from '../utils/timeFormatter';

/**
 * Alert History Page
 * Shows last 20 alerts with read/unread status
 */
const AlertHistory = () => {
  const { alerts, markAlertRead, markAllAlertsRead, unreadCount } = useWeather();

  const levelConfig = {
    SAFE: { emoji: '✅', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    WATCH: { emoji: '⚠️', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
    WARNING: { emoji: '🟠', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
    DANGER: { emoji: '🔴', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a] p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alert History</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {alerts.length} alerts • {unreadCount} unread
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAlertsRead}
              className="btn-secondary text-sm py-2"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Alert list */}
        {alerts.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="text-5xl mb-4">🔔</div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Alerts Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Your rain alerts will appear here when weather conditions change.
            </p>
            <Link to="/" className="btn-primary mt-6 inline-block">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {alerts.map((alert) => {
              const config = levelConfig[alert.level] || levelConfig.SAFE;
              return (
                <div
                  key={alert._id}
                  onClick={() => { if (!alert.read) markAlertRead(alert._id); }}
                  className={`
                    glass-card p-4 border cursor-pointer transition-all duration-200
                    ${!alert.read ? config.border + ' ' + config.bg : 'opacity-75'}
                    hover:scale-[1.01]
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {config.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${config.color}`}>
                          {alert.level}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Score: {alert.riskScore}/100
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {getRelativeTime(alert.createdAt)}
                        </span>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">
                        📍 {alert.location?.name} — {alert.message}
                      </p>
                      {alert.peakWindow && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          🕐 {alert.peakWindow}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertHistory;
