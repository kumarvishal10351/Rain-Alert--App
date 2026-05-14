import { useState, useCallback } from 'react';

/**
 * Custom hook for browser Geolocation API
 * Returns current position and loading/error states
 */
export const useGeolocation = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          setPosition(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          let message = 'Failed to get location';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = 'Location permission denied. Please enable it in your browser settings.';
              break;
            case err.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case err.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          setError(message);
          setLoading(false);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    });
  }, []);

  return { position, loading, error, getCurrentPosition };
};
