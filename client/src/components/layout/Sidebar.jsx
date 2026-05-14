import React, { useState, useCallback } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { weatherApi } from '../../api/weatherApi';
import { useToast } from '../common/Toast';
import { MAX_LOCATIONS } from '../../utils/constants';
import PropTypes from 'prop-types';

/**
 * Sidebar - Location management + navigation
 * Collapsible on mobile
 */
export const Sidebar = ({ isOpen, onClose }) => {
  const {
    selectedLocation, setSelectedLocation,
    locations, addLocation, removeLocation, loadLocations
  } = useWeather();
  const { getCurrentPosition, loading: geoLoading } = useGeolocation();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search cities
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setSearchLoading(true);
    try {
      const res = await weatherApi.searchCity(searchQuery.trim());
      setSearchResults(res.data.data || []);
      if (res.data.data.length === 0) {
        toast.info('No cities found. Try a different name.');
      }
    } catch {
      toast.error('Failed to search cities');
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, toast]);

  // Select a search result
  const handleSelectCity = useCallback(async (city) => {
    try {
      await addLocation({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
        isPrimary: locations.length === 0
      });
      setSelectedLocation({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        country: city.country
      });
      setSearchResults([]);
      setSearchQuery('');
      toast.success(`${city.name} added to your locations`);
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add location');
    }
  }, [addLocation, setSelectedLocation, locations, toast, onClose]);

  // Auto-detect location
  const handleAutoDetect = useCallback(async () => {
    try {
      const coords = await getCurrentPosition();
      const res = await weatherApi.reverseGeocode(coords.lat, coords.lon);
      const loc = res.data.data;

      await addLocation({
        name: loc.name,
        country: loc.country,
        state: loc.state,
        lat: loc.lat,
        lon: loc.lon,
        isPrimary: locations.length === 0
      });
      setSelectedLocation({
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
        country: loc.country
      });
      toast.success(`Detected: ${loc.name}`);
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Failed to detect location');
    }
  }, [getCurrentPosition, addLocation, setSelectedLocation, locations, toast, onClose]);

  // Select saved location
  const handleSelectSaved = useCallback((loc) => {
    setSelectedLocation({
      name: loc.name,
      lat: loc.lat,
      lon: loc.lon,
      country: loc.country,
      _id: loc._id
    });
    onClose?.();
  }, [setSelectedLocation, onClose]);

  // Delete location
  const handleDelete = useCallback(async (e, id, name) => {
    e.stopPropagation();
    try {
      await removeLocation(id);
      toast.info(`${name} removed`);
    } catch {
      toast.error('Failed to remove location');
    }
  }, [removeLocation, toast]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-80 z-50 
          bg-white dark:bg-[#0f0e1e] border-r border-gray-200 dark:border-white/10
          transform transition-transform duration-300 ease-out
          lg:static lg:transform-none lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col overflow-hidden
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Locations</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city..."
              className="input-field pr-10 text-sm"
              id="city-search-input"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-primary-500 transition-colors"
              aria-label="Search"
            >
              {searchLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </form>

          {/* Auto-detect button */}
          <button
            onClick={handleAutoDetect}
            disabled={geoLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 
                       hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors
                       disabled:opacity-50"
            id="auto-detect-btn"
          >
            {geoLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {geoLoading ? 'Detecting...' : 'Use My Location'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="p-2 border-b border-gray-200 dark:border-white/10 max-h-60 overflow-y-auto">
            <p className="px-2 py-1 text-xs text-gray-500 dark:text-gray-500 font-medium uppercase tracking-wider">
              Search Results
            </p>
            {searchResults.map((city, i) => (
              <button
                key={`${city.lat}-${city.lon}-${i}`}
                onClick={() => handleSelectCity(city)}
                disabled={locations.length >= MAX_LOCATIONS}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm
                           hover:bg-gray-100 dark:hover:bg-white/5 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{city.name}</p>
                  <p className="text-xs text-gray-500">
                    {[city.state, city.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </button>
            ))}
            {locations.length >= MAX_LOCATIONS && (
              <p className="px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                Max {MAX_LOCATIONS} locations. Remove one to add more.
              </p>
            )}
          </div>
        )}

        {/* Saved locations */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="px-2 py-1 text-xs text-gray-500 dark:text-gray-500 font-medium uppercase tracking-wider">
            Saved Locations ({locations.length}/{MAX_LOCATIONS})
          </p>

          {locations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 dark:text-gray-600 text-sm">
              <p className="text-2xl mb-2">🌍</p>
              <p>No saved locations yet</p>
              <p className="text-xs mt-1">Search for a city or use auto-detect</p>
            </div>
          ) : (
            <div className="space-y-1 mt-1">
              {locations.map((loc) => {
                const isActive = selectedLocation?.lat === loc.lat && selectedLocation?.lon === loc.lon;
                return (
                  <button
                    key={loc._id}
                    onClick={() => handleSelectSaved(loc)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-all duration-200
                      ${isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                        : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    <span className={`text-lg ${isActive ? 'animate-bounce-gentle' : ''}`}>
                      {loc.isPrimary ? '⭐' : '📍'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>
                        {loc.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {[loc.state, loc.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, loc._id, loc.name)}
                      className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={`Remove ${loc.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
