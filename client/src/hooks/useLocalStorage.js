import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage with React state sync
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @returns {[*, Function]} State value and setter
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('localStorage setItem error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
