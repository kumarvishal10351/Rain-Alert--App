import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { usePushNotification } from '../hooks/usePushNotification';
import { authApi } from '../api/authApi';
import api from '../api/axiosConfig';

/**
 * Settings Page
 * Manage preferences: temp unit, notifications, email alerts, dark mode, password
 */
const Settings = () => {
  const { user, updatePreferences } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { permission, requestPermission } = usePushNotification();
  const toast = useToast();

  const prefs = user?.preferences || {};

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  // Toggle setting
  const handleToggle = async (key, value) => {
    try {
      await updatePreferences({ [key]: value });
      if (key === 'darkMode') toggleDarkMode();
      toast.success('Preference updated');
    } catch {
      toast.error('Failed to update preference');
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Enable push notifications
  const handleEnablePush = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      await handleToggle('pushNotifications', true);
      toast.success('Push notifications enabled');
    } else {
      toast.warning('Notification permission denied');
    }
  };

  // Send test email
  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      const res = await api.post('/alerts/test-email');
      if (res.data.success) {
        toast.success(`Test email sent to ${user?.email}`);
      } else {
        toast.error(res.data.message || 'Failed to send test email');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email service not configured on server');
    } finally {
      setTestEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a] p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        </div>

        {/* Temperature Unit */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Display</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Temperature Unit</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Choose Celsius or Fahrenheit</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1">
              <button
                onClick={() => handleToggle('temperatureUnit', 'C')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  prefs.temperatureUnit !== 'F'
                    ? 'bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => handleToggle('temperatureUnit', 'F')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  prefs.temperatureUnit === 'F'
                    ? 'bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Switch between light and dark theme</p>
            </div>
            <button
              onClick={() => handleToggle('darkMode', !darkMode)}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}
              `}
              role="switch"
              aria-checked={darkMode}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                  transition-transform duration-200
                  ${darkMode ? 'translate-x-6' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Notifications</h2>

          {/* Browser Push */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Push Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {permission === 'granted' ? 'Enabled — browser desktop alerts' : 'Get browser popup alerts'}
              </p>
            </div>
            {permission === 'granted' ? (
              <button
                onClick={() => handleToggle('pushNotifications', !prefs.pushNotifications)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-200
                  ${prefs.pushNotifications !== false ? 'bg-primary-500' : 'bg-gray-300'}
                `}
                role="switch"
                aria-checked={prefs.pushNotifications !== false}
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                    transition-transform duration-200
                    ${prefs.pushNotifications !== false ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            ) : (
              <button
                onClick={handleEnablePush}
                className="btn-primary text-sm py-2"
              >
                Enable
              </button>
            )}
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                📧 Email Notifications
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Receive rain alerts at {user?.email || 'your email'}
              </p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications', prefs.emailNotifications === false ? true : false)}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${prefs.emailNotifications !== false ? 'bg-primary-500' : 'bg-gray-300'}
              `}
              role="switch"
              aria-checked={prefs.emailNotifications !== false}
              id="email-notifications-toggle"
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                  transition-transform duration-200
                  ${prefs.emailNotifications !== false ? 'translate-x-6' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          {/* Test Email Button */}
          {prefs.emailNotifications !== false && (
            <div className="pl-1">
              <button
                onClick={handleTestEmail}
                disabled={testEmailLoading}
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors disabled:opacity-50"
                id="test-email-btn"
              >
                {testEmailLoading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending test email...
                  </>
                ) : (
                  <>📨 Send test email to {user?.email}</>
                )}
              </button>
            </div>
          )}

          {/* Alert threshold */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Alert Threshold</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Minimum level to receive notifications</p>
            </div>
            <select
              value={prefs.alertThreshold || 'WATCH'}
              onChange={(e) => handleToggle('alertThreshold', e.target.value)}
              className="input-field w-auto text-sm"
            >
              <option value="SAFE">Safe (All)</option>
              <option value="WATCH">Watch</option>
              <option value="WARNING">Warning</option>
              <option value="DANGER">Danger only</option>
            </select>
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Account</h2>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Email: <span className="text-gray-700 dark:text-gray-300 font-medium">{user?.email}</span></p>
            <p>Name: <span className="text-gray-700 dark:text-gray-300 font-medium">{user?.name}</span></p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2 border-t border-gray-200 dark:border-white/10">
            <p className="font-medium text-gray-700 dark:text-gray-300">Change Password</p>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-field text-sm"
              placeholder="Current password"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-field text-sm"
              placeholder="New password (min 6 chars)"
              required
              minLength={6}
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-field text-sm"
              placeholder="Confirm new password"
              required
            />
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary text-sm py-2"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
