import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeather } from '../../context/WeatherContext';

/**
 * Notification Bell — Shows in navbar with unread badge
 * Dropdown preview of recent alerts
 */
export const NotificationBell = () => {
  const { alerts, unreadCount, markAlertRead, markAllAlertsRead } = useWeather();
  const [isOpen, setIsOpen] = useState(false);

  const recentAlerts = alerts.slice(0, 5);

  const levelColors = {
    SAFE: 'text-green-500',
    WATCH: 'text-yellow-500',
    WARNING: 'text-orange-500',
    DANGER: 'text-red-500'
  };

  const levelEmoji = {
    SAFE: '✅',
    WATCH: '⚠️',
    WARNING: '🟠',
    DANGER: '🔴'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 glass-card z-50 animate-slide-down overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => { markAllAlertsRead(); }}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Alert list */}
            <div className="max-h-72 overflow-y-auto">
              {recentAlerts.length === 0 ? (
                <div className="p-6 text-center text-gray-400 dark:text-gray-600 text-sm">
                  <p className="text-2xl mb-2">🔔</p>
                  <p>No notifications yet</p>
                </div>
              ) : (
                recentAlerts.map(alert => (
                  <button
                    key={alert._id}
                    onClick={() => {
                      if (!alert.read) markAlertRead(alert._id);
                    }}
                    className={`
                      w-full flex items-start gap-3 px-4 py-3 text-left
                      hover:bg-gray-50 dark:hover:bg-white/5 transition-colors
                      ${!alert.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                    `}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {levelEmoji[alert.level]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${levelColors[alert.level]}`}>
                          {alert.level}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(alert.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                        {alert.location?.name} — {alert.message}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <Link
              to="/alerts"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-xs font-medium text-primary-500 hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-200 dark:border-white/10 transition-colors"
            >
              View All Alerts →
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
