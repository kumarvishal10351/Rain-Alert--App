/**
 * ============================================================
 * RAIN RISK CALCULATOR — Core Algorithm (Frontend Mirror)
 * ============================================================
 * 
 * This module mirrors the backend's rain risk calculation
 * for real-time UI updates without server round-trips.
 * 
 * ALGORITHM:
 * The RainRiskScore is a weighted composite (0-100) predicting
 * rainfall likelihood and severity for the next 24 hours.
 * 
 * FACTORS & WEIGHTS:
 * ┌──────────────────────────────┬────────┬──────────────────────────┐
 * │ Factor                       │ Weight │ Rationale                │
 * ├──────────────────────────────┼────────┼──────────────────────────┤
 * │ Probability of Precip (pop)  │  40%   │ Direct rain indicator    │
 * │ Rainfall Amount (rain.3h)    │  30%   │ Severity measure         │
 * │ Humidity                     │  15%   │ Atmospheric moisture     │
 * │ Cloud Cover                  │  15%   │ Sky conditions           │
 * └──────────────────────────────┴────────┴──────────────────────────┘
 * 
 * SCORE → ALERT LEVEL MAPPING:
 *   0-24:  SAFE    (green)  — No rain expected
 *   25-49: WATCH   (yellow) — Light rain possible
 *   50-74: WARNING (orange) — Moderate rain likely
 *   75-100: DANGER (red)    — Heavy rain expected
 */

// Alert level definitions with colors, icons, and advice
export const ALERT_LEVELS = {
  SAFE: {
    label: 'Safe',
    emoji: '✅',
    color: 'green',
    bgClass: 'badge-safe',
    gradientClass: 'gradient-safe',
    message: 'No rain expected',
    advice: 'Enjoy the clear weather! ☀️'
  },
  WATCH: {
    label: 'Watch',
    emoji: '⚠️',
    color: 'yellow',
    bgClass: 'badge-watch',
    gradientClass: 'gradient-watch',
    message: 'Light rain possible, carry an umbrella',
    advice: 'Keep an umbrella handy just in case 🌂'
  },
  WARNING: {
    label: 'Warning',
    emoji: '🟠',
    color: 'orange',
    bgClass: 'badge-warning',
    gradientClass: 'gradient-warning',
    message: 'Moderate rain likely, avoid outdoor activities',
    advice: 'Consider postponing outdoor plans 🌧️'
  },
  DANGER: {
    label: 'Danger',
    emoji: '🔴',
    color: 'red',
    bgClass: 'badge-danger',
    gradientClass: 'gradient-danger',
    message: 'Heavy rain expected, stay indoors',
    advice: 'Stay safe and avoid unnecessary travel! ⛈️'
  }
};

/**
 * Calculate Rain Risk Score from forecast data
 * @param {Object} forecastData - OpenWeatherMap 5-day forecast response
 * @returns {Object} Risk assessment object
 */
export const calculateRainRisk = (forecastData) => {
  if (!forecastData?.list?.length) {
    return {
      score: 0,
      level: 'SAFE',
      ...ALERT_LEVELS.SAFE,
      peakWindow: null,
      hourlyRisks: []
    };
  }

  // Next 24 hours = 8 intervals × 3 hours
  const next24h = forecastData.list.slice(0, 8);

  let totalScore = 0;
  let maxRainHour = null;
  let maxRainValue = 0;
  const hourlyRisks = [];

  for (const interval of next24h) {
    // Factor 1: Probability of Precipitation (0-1 → 0-100)
    const popScore = (interval.pop || 0) * 100;

    // Factor 2: Rain amount (mm/3h). Cap at 50mm for normalization
    const rainAmount = interval.rain?.['3h'] || 0;
    const rainScore = Math.min((rainAmount / 50) * 100, 100);

    // Factor 3: Humidity (already 0-100)
    const humidityScore = interval.main?.humidity || 0;

    // Factor 4: Cloud cover (already 0-100)
    const cloudScore = interval.clouds?.all || 0;

    // Weighted composite
    const intervalScore =
      popScore * 0.40 +
      rainScore * 0.30 +
      humidityScore * 0.15 +
      cloudScore * 0.15;

    totalScore += intervalScore;

    // Track the peak rain window
    const currentRainValue = rainAmount > 0 ? rainAmount * 100 : popScore;
    if (currentRainValue > maxRainValue) {
      maxRainValue = currentRainValue;
      maxRainHour = interval;
    }

    hourlyRisks.push({
      dt: interval.dt,
      time: interval.dt_txt,
      score: Math.round(intervalScore),
      pop: interval.pop || 0,
      rain: rainAmount,
      temp: interval.main?.temp,
      feelsLike: interval.main?.feels_like,
      humidity: interval.main?.humidity,
      clouds: interval.clouds?.all || 0,
      windSpeed: interval.wind?.speed || 0,
      windDeg: interval.wind?.deg || 0,
      weather: interval.weather?.[0] || {}
    });
  }

  // Average across all intervals, clamped to 0-100
  const avgScore = Math.round(totalScore / next24h.length);
  const finalScore = Math.min(Math.max(avgScore, 0), 100);

  // Map score to alert level
  let level;
  if (finalScore <= 24) level = 'SAFE';
  else if (finalScore <= 49) level = 'WATCH';
  else if (finalScore <= 74) level = 'WARNING';
  else level = 'DANGER';

  // Determine peak rain window
  let peakWindow = null;
  if (maxRainHour && finalScore > 24) {
    const peakStart = new Date(maxRainHour.dt * 1000);
    const peakEnd = new Date(peakStart.getTime() + 3 * 60 * 60 * 1000);
    const fmt = (d) => d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    peakWindow = `Rain expected between ${fmt(peakStart)} – ${fmt(peakEnd)}`;
  }

  return {
    score: finalScore,
    level,
    ...ALERT_LEVELS[level],
    peakWindow,
    hourlyRisks
  };
};

/**
 * Get daily forecast summary from hourly data
 * Groups 3-hour intervals into daily summaries
 * @param {Object} forecastData - OpenWeatherMap forecast response
 * @returns {Array} Daily forecast summaries
 */
export const getDailyForecast = (forecastData) => {
  if (!forecastData?.list?.length) return [];

  const dailyMap = {};

  for (const interval of forecastData.list) {
    const date = interval.dt_txt.split(' ')[0];

    if (!dailyMap[date]) {
      dailyMap[date] = {
        date,
        dt: interval.dt,
        temps: [],
        pops: [],
        rains: [],
        humidities: [],
        weather: interval.weather[0],
        wind: interval.wind
      };
    }

    dailyMap[date].temps.push(interval.main.temp);
    dailyMap[date].pops.push(interval.pop || 0);
    dailyMap[date].rains.push(interval.rain?.['3h'] || 0);
    dailyMap[date].humidities.push(interval.main.humidity);

    // Use the most severe weather condition for the day
    const currentSeverity = interval.weather[0]?.id || 800;
    const existingSeverity = dailyMap[date].weather?.id || 800;
    if (currentSeverity < existingSeverity) {
      dailyMap[date].weather = interval.weather[0];
    }
  }

  return Object.values(dailyMap).map(day => ({
    date: day.date,
    dt: day.dt,
    tempMax: Math.round(Math.max(...day.temps)),
    tempMin: Math.round(Math.min(...day.temps)),
    pop: Math.round(Math.max(...day.pops) * 100),
    totalRain: parseFloat(day.rains.reduce((a, b) => a + b, 0).toFixed(1)),
    avgHumidity: Math.round(day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length),
    weather: day.weather,
    wind: day.wind
  })).slice(0, 5);
};
