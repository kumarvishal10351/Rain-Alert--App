import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CurrentWeather } from '../components/weather/CurrentWeather';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { WeeklyForecast } from '../components/weather/WeeklyForecast';
import { AlertBanner } from '../components/alerts/AlertBanner';
import { TempRainChart } from '../components/charts/TempRainChart';
import { PrecipChart } from '../components/charts/PrecipChart';
import { HumidityGauge } from '../components/charts/HumidityGauge';
import { WindChart } from '../components/charts/WindChart';
import { RainMap } from '../components/map/RainMap';
import { useWeather } from '../context/WeatherContext';
import { DashboardSkeleton } from '../components/common/Skeleton';

/**
 * Dashboard Page — Main view
 * Layout: Sidebar (left) + Main Content (center) + Right Panel (alerts/map)
 */
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedLocation, weatherLoading, weatherError, isOnline, isStale } = useWeather();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a]">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center text-sm py-2 font-medium animate-slide-down">
          ⚡ You are offline — Showing cached data
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* No location selected */}
            {!selectedLocation && !weatherLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md space-y-4 animate-fade-in">
                  <div className="text-6xl mb-4">🌍</div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Select a Location
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Search for a city in the sidebar or use auto-detect to get started with weather data.
                  </p>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="btn-primary"
                  >
                    Open Locations
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Alert Banner */}
                <AlertBanner />

                {/* Error state */}
                {weatherError && (
                  <div className="glass-card p-4 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 animate-slide-down">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          {weatherError}
                        </p>
                        {isStale && (
                          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                            Showing cached data below
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {weatherLoading && !selectedLocation ? (
                  <DashboardSkeleton />
                ) : (
                  <>
                    {/* Top section: Current Weather + Map */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 space-y-6">
                        <CurrentWeather />
                        <HourlyForecast />
                      </div>
                      <div className="space-y-6">
                        <RainMap />
                        <HumidityGauge />
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <TempRainChart />
                      <PrecipChart />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <WindChart />
                      <WeeklyForecast />
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
