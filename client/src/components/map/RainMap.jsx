import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useWeather } from '../../context/WeatherContext';
import { formatTemp } from '../../utils/tempConverter';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Map Recenter component — moves map when location changes
 */
const MapRecenter = ({ lat, lon }) => {
  const map = useMap();
  useMemo(() => {
    if (lat && lon) {
      map.setView([lat, lon], map.getZoom(), { animate: true });
    }
  }, [lat, lon, map]);
  return null;
};

/**
 * Rain Map — Interactive Leaflet map with precipitation overlay
 * Shows markers for all saved locations with weather popups
 */
export const RainMap = () => {
  const { selectedLocation, locations, currentWeather } = useWeather();
  const { user } = useAuth();
  const unit = user?.preferences?.temperatureUnit || 'C';
  const [overlay, setOverlay] = useState('precipitation');

  const center = useMemo(() => {
    if (selectedLocation?.lat && selectedLocation?.lon) {
      return [selectedLocation.lat, selectedLocation.lon];
    }
    return [51.505, -0.09]; // Default: London
  }, [selectedLocation]);

  const OWM_API_KEY = ''; // OWM tile layers work with free API key (set via backend proxy or direct)

  const overlayOptions = {
    precipitation: {
      label: 'Rain',
      url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    },
    clouds: {
      label: 'Clouds',
      url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    },
    temp: {
      label: 'Temperature',
      url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    }
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Map controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Rain Map
        </h3>
        <div className="flex gap-1">
          {Object.entries(overlayOptions).map(([key, opt]) => (
            <button
              key={key}
              onClick={() => setOverlay(key)}
              className={`
                px-3 py-1 rounded-lg text-xs font-medium transition-colors
                ${overlay === key
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="h-[300px] lg:h-[350px]">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapRecenter lat={center[0]} lon={center[1]} />

          {/* Base tile layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Weather overlay (only if API key is available) */}
          {OWM_API_KEY && (
            <TileLayer
              url={overlayOptions[overlay]?.url}
              opacity={0.6}
            />
          )}

          {/* Selected location marker */}
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
              <Popup>
                <div className="text-sm font-sans">
                  <strong>{selectedLocation.name}</strong>
                  {currentWeather && (
                    <div className="mt-1">
                      <p>{formatTemp(currentWeather.main?.temp, unit)}</p>
                      <p className="capitalize text-xs text-gray-500">
                        {currentWeather.weather?.[0]?.description}
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Other saved location markers */}
          {locations
            .filter(loc => !(selectedLocation && loc.lat === selectedLocation.lat && loc.lon === selectedLocation.lon))
            .map(loc => (
              <Marker key={loc._id} position={[loc.lat, loc.lon]} opacity={0.6}>
                <Popup>
                  <div className="text-sm font-sans">
                    <strong>{loc.name}</strong>
                    <p className="text-xs text-gray-500">{loc.country}</p>
                  </div>
                </Popup>
              </Marker>
            ))
          }
        </MapContainer>
      </div>
    </div>
  );
};
