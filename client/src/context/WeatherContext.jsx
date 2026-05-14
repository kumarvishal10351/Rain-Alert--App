import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { weatherApi } from '../api/weatherApi';
import { calculateRainRisk, getDailyForecast } from '../utils/rainRiskCalculator';
import { AUTO_REFRESH_INTERVAL, DEFAULT_LOCATION } from '../utils/constants';
import { useAuth } from './AuthContext';
import PropTypes from 'prop-types';

const WeatherContext = createContext(null);

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
};

export const WeatherProvider = ({ children }) => {
  const { user } = useAuth();

  // Selected location
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  // Weather data
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [rainRisk, setRainRisk] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);

  // UI state
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);

  // Alerts
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const refreshTimerRef = useRef(null);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved locations
  const loadLocations = useCallback(async () => {
    try {
      const res = await weatherApi.getLocations();
      const locs = res.data.data || [];
      setLocations(locs);

      // Auto-select primary location
      if (locs.length > 0 && !selectedLocation) {
        const primary = locs.find(l => l.isPrimary) || locs[0];
        setSelectedLocation({
          name: primary.name,
          lat: primary.lat,
          lon: primary.lon,
          country: primary.country,
          _id: primary._id
        });
      }
      return locs;
    } catch (err) {
      console.error('Failed to load locations:', err);
      return [];
    }
  }, [selectedLocation]);

  // Fetch weather data for selected location
  const fetchWeatherData = useCallback(async (location) => {
    if (!location?.lat || !location?.lon) return;

    setWeatherLoading(true);
    setWeatherError(null);

    try {
      // Parallel API calls for performance
      const [weatherRes, riskRes] = await Promise.all([
        weatherApi.getCurrentWeather(location.lat, location.lon),
        weatherApi.getRainRisk(location.lat, location.lon)
      ]);

      const weather = weatherRes.data.data;
      const { risk, forecast } = riskRes.data.data;

      setCurrentWeather(weather);
      setForecastData(forecast);
      setRainRisk(risk);
      setDailyForecast(getDailyForecast(forecast));
      setLastUpdated(new Date());
      setIsStale(weatherRes.data.cached || false);
      setWeatherError(null);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setWeatherError(err.response?.data?.message || 'Failed to fetch weather data');
      // Don't clear existing data — show stale data with badge
      if (currentWeather) {
        setIsStale(true);
      }
    } finally {
      setWeatherLoading(false);
    }
  }, [currentWeather]);

  // Load alerts
  const loadAlerts = useCallback(async () => {
    try {
      const res = await weatherApi.getAlerts();
      setAlerts(res.data.data.alerts || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (user) {
      loadLocations();
      loadAlerts();
    }
  }, [user, loadLocations, loadAlerts]);

  // Fetch weather when location changes
  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation);
    }
  }, [selectedLocation, fetchWeatherData]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (selectedLocation) {
      refreshTimerRef.current = setInterval(() => {
        fetchWeatherData(selectedLocation);
      }, AUTO_REFRESH_INTERVAL);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [selectedLocation, fetchWeatherData]);

  // Refresh function
  const refreshWeather = useCallback(() => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation);
      loadAlerts();
    }
  }, [selectedLocation, fetchWeatherData, loadAlerts]);

  // Add location
  const addLocation = useCallback(async (locationData) => {
    const res = await weatherApi.addLocation(locationData);
    await loadLocations();
    return res.data.data;
  }, [loadLocations]);

  // Remove location
  const removeLocation = useCallback(async (id) => {
    await weatherApi.deleteLocation(id);
    await loadLocations();
    // If deleted location was selected, switch to first remaining
    if (selectedLocation?._id === id) {
      const remaining = locations.filter(l => l._id !== id);
      if (remaining.length > 0) {
        const next = remaining.find(l => l.isPrimary) || remaining[0];
        setSelectedLocation({
          name: next.name,
          lat: next.lat,
          lon: next.lon,
          country: next.country,
          _id: next._id
        });
      } else {
        setSelectedLocation(null);
      }
    }
  }, [loadLocations, selectedLocation, locations]);

  // Create alert
  const createAlert = useCallback(async (alertData) => {
    try {
      await weatherApi.createAlert(alertData);
      await loadAlerts();
    } catch (err) {
      console.error('Failed to create alert:', err);
    }
  }, [loadAlerts]);

  // Mark alert read
  const markAlertRead = useCallback(async (id) => {
    try {
      await weatherApi.markAlertRead(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, read: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  }, []);

  // Mark all alerts read
  const markAllAlertsRead = useCallback(async () => {
    try {
      await weatherApi.markAllAlertsRead();
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all alerts read:', err);
    }
  }, []);

  return (
    <WeatherContext.Provider value={{
      // Location
      selectedLocation,
      setSelectedLocation,
      locations,
      loadLocations,
      addLocation,
      removeLocation,

      // Weather data
      currentWeather,
      forecastData,
      rainRisk,
      dailyForecast,

      // UI state
      weatherLoading,
      weatherError,
      lastUpdated,
      isStale,
      isOnline,

      // Alerts
      alerts,
      unreadCount,
      createAlert,
      markAlertRead,
      markAllAlertsRead,
      loadAlerts,

      // Actions
      refreshWeather
    }}>
      {children}
    </WeatherContext.Provider>
  );
};

WeatherProvider.propTypes = {
  children: PropTypes.node.isRequired
};
