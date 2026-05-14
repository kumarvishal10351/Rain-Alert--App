# 🌧️ Rain Alert — Weather Intelligence Platform

A real-time weather intelligence platform that predicts rainfall using a custom risk-scoring algorithm, issues color-coded alerts, and provides beautiful dashboards with interactive maps and charts.

![Rain Alert](https://img.shields.io/badge/Status-Production%20Ready-green) ![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)

---

## ✨ Features

### 🔐 Authentication System
- JWT-based registration & login
- Protected routes with persistent sessions
- Password management

### 📍 Location Management
- Search cities by name (OpenWeatherMap Geocoding)
- Auto-detect location via browser Geolocation API
- Save up to 5 favorite locations per user
- One-click location switching from sidebar

### 🌤️ Real-Time Weather Dashboard
- Current conditions: temperature, humidity, wind, pressure, visibility
- "Feels like" temperature & weather descriptions
- Sunrise & sunset times with weather icons
- Auto-refresh every 10 minutes

### 🌧️ Rain Prediction Engine
Custom `RainRiskCalculator` algorithm scoring 0-100 using:
| Factor | Weight | Description |
|--------|--------|-------------|
| Probability of Precipitation (pop) | 40% | Direct rain indicator |
| Rainfall Amount (rain.3h) | 30% | Severity measure |
| Humidity | 15% | Atmospheric moisture |
| Cloud Cover | 15% | Sky conditions |

**Alert Levels:**
- ✅ **SAFE** (0-24): No rain expected
- ⚠️ **WATCH** (25-49): Light rain possible
- 🟠 **WARNING** (50-74): Moderate rain likely
- 🔴 **DANGER** (75-100): Heavy rain expected

### 📊 Charts & Analytics
- 24-hour temperature + rain probability dual-axis chart
- 5-day precipitation bar chart
- Humidity radial gauge
- Wind speed & direction chart

### 🗺️ Interactive Rain Map
- Leaflet.js with OpenStreetMap tiles
- Precipitation/clouds/temperature overlays
- All saved locations shown as markers

### 🔔 Alert System
- Color-coded alert banner on dashboard
- Browser push notifications
- Alert history log (last 20 per user)
- Unread badge count on notification bell

### ⚙️ Settings
- °C / °F temperature toggle
- Dark/light mode
- Push notification controls
- Alert threshold configuration
- Password management

### 📱 Responsive Design
- Mobile-first layout
- Collapsible sidebar on mobile
- Touch-friendly controls

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **OpenWeatherMap API Key** (free)

### Step 1: Get a Free OpenWeatherMap API Key

1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. Go to "API Keys" in your account dashboard
4. Copy your API key (it activates within 2 hours)

### Step 2: Clone & Configure

```bash
# Navigate to the project
cd "Rain alert web application"

# Setup backend
cd server
cp .env.example .env
# Edit .env and add your OPENWEATHER_API_KEY
npm install

# Setup frontend
cd ../client
cp .env.example .env
npm install
```

### Step 3: Configure Environment Variables

**server/.env:**
```env
OPENWEATHER_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb://localhost:27017/rain-alert
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
```

**client/.env:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 4: Run the Application

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start backend
cd server
npm run dev

# Terminal 3: Start frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🐳 Docker Deployment

```bash
# Set your API key
export OPENWEATHER_API_KEY=your_key_here

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

Access at **http://localhost:5173**

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/preferences` | Update preferences |
| PUT | `/api/auth/password` | Change password |
| POST | `/api/auth/push-subscription` | Save push subscription |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current?lat=&lon=` | Current weather |
| GET | `/api/weather/forecast?lat=&lon=` | 5-day forecast |
| GET | `/api/weather/risk?lat=&lon=` | Rain risk assessment |
| GET | `/api/weather/search?city=` | Search cities |
| GET | `/api/weather/reverse?lat=&lon=` | Reverse geocode |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | Get saved locations |
| POST | `/api/locations` | Add location |
| PUT | `/api/locations/:id/primary` | Set primary location |
| DELETE | `/api/locations/:id` | Remove location |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get alert history |
| POST | `/api/alerts` | Create alert |
| PUT | `/api/alerts/:id/read` | Mark alert as read |
| PUT | `/api/alerts/read-all` | Mark all as read |

---

## 🧮 Algorithm Explanation

The **Rain Risk Calculator** uses a weighted scoring system to predict rainfall probability:

```
RainRiskScore = Σ (for each 3-hour interval in next 24h):
  pop_score × 0.40 +          // Probability of Precipitation (0-100)
  rain_amount_score × 0.30 +  // Rainfall mm, normalized to 0-100
  humidity_score × 0.15 +     // Relative humidity (0-100)
  cloud_score × 0.15          // Cloud cover (0-100)

Final Score = Average of all interval scores (clamped 0-100)
```

The algorithm also identifies the **peak rain window** — the 3-hour block with the highest rain probability — and reports it as part of the alert.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Weather API | OpenWeatherMap (free tier) |
| Maps | Leaflet.js + OpenStreetMap |
| Charts | Recharts |
| Auth | JWT (JSON Web Tokens) |
| Notifications | Web Push API |
| Deployment | Docker + Docker Compose |

---

## 📁 Project Structure

```
rain-alert-app/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios instance + API calls
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Sidebar
│   │   │   ├── weather/       # CurrentWeather, Hourly, Weekly
│   │   │   ├── alerts/        # AlertBanner, NotificationBell
│   │   │   ├── charts/        # TempRain, Precip, Humidity, Wind
│   │   │   ├── map/           # RainMap (Leaflet)
│   │   │   └── common/        # Skeleton, Toast, ErrorBoundary
│   │   ├── context/           # Auth, Weather, Theme providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Rain calculator, formatters
│   │   └── pages/             # Dashboard, Login, Register, Settings
│   └── Dockerfile
├── server/                    # Express backend
│   ├── controllers/           # Auth, Weather, Location, Alert
│   ├── middleware/             # Auth, Rate limit, Cache
│   ├── models/                # User, Location, Alert (Mongoose)
│   ├── routes/                # API route definitions
│   ├── services/              # Weather API, Notifications
│   ├── utils/                 # Cache manager
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 📄 License

MIT License — feel free to use and modify.
