import { useContext } from 'react';
import { WeatherContext } from '../context/WeatherContext';

/**
 * Convenience hook to access weather context
 * (Re-exports useWeather from context for the hooks/ directory)
 */
export { useWeather } from '../context/WeatherContext';
