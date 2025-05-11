import React, { useState, useEffect } from "react";
import axios from "axios";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWeather, setShowWeather] = useState(false);

  // Apply transitions when weather data loads
  useEffect(() => {
    if (weather) {
      setTimeout(() => {
        setShowWeather(true);
      }, 300);
    } else {
      setShowWeather(false);
    }
  }, [weather]);

  const getWeatherData = async () => {
    setLoading(true);
    setError("");
    setWeather(null);
    setShowWeather(false);

    try {
      // 1. Get coordinates from city
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
      const location = geoRes.data.results?.[0];

      if (!location) {
        setError("City not found.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = location;
      const today = new Date().toISOString().split("T")[0];

      // 2. Get weather data with additional parameters
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude,
          longitude,
          start_date: today,
          end_date: today,
          daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "windspeed_10m_max"],
          current: ["temperature_2m", "relative_humidity_2m"],
          timezone: "auto",
        },
      });

      const daily = weatherRes.data.daily;
      const current = weatherRes.data.current;

      // Simulate AQI data (since the free API doesn't include it)
      // In a real app, you would get this from an air quality API
      const aqiValue = Math.floor(Math.random() * 150) + 20;
      const aqiCategory = getAqiCategory(aqiValue);

      // Slight delay before setting data for smoother transition
      setTimeout(() => {
        setWeather({
          city: name,
          country,
          date: today,
          max: daily.temperature_2m_max[0],
          min: daily.temperature_2m_min[0],
          rain: daily.precipitation_sum[0],
          wind: daily.windspeed_10m_max[0],
          // New data points
          current: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          aqi: aqiValue,
          aqiCategory: aqiCategory,
        });
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
      setLoading(false);
    }
  };

  // Helper function to determine weather icon
  const getWeatherIcon = () => {
    if (!weather) return "☀️"; // Default sunny
    
    if (weather.rain > 5) return "🌧️"; // Heavy rain
    if (weather.rain > 0) return "🌦️"; // Light rain
    if (weather.current > 30) return "🔥"; // Very hot
    if (weather.current > 20) return "☀️"; // Sunny
    if (weather.current < 10) return "❄️"; // Cold
    return "⛅"; // Default partly cloudy
  };

  // Helper function to categorize AQI values
  const getAqiCategory = (aqi) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500" };
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-500" };
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500" };
    return { label: "Hazardous", color: "bg-red-900" };
  };

  // SVG Loading Animation
  const LoadingAnimation = () => (
    <div className="flex justify-center py-12">
      <svg width="120" height="120" viewBox="0 0 100 100" className="text-blue-400">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeOpacity="0.3" />
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          stroke="currentColor" 
          strokeWidth="8" 
          fill="none" 
          strokeDasharray="251" 
          strokeDashoffset="62.75" 
          transform="rotate(-90 50 50)"
          className="animate-spin origin-center"
          style={{ animationDuration: '1.5s' }}
        />
        <path 
          d="M50 15 L50 25 M85 50 L75 50 M50 85 L50 75 M15 50 L25 50" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round"
          className="animate-pulse" 
        />
        <g className="animate-bounce" style={{ animationDuration: '2s' }}>
          <path d="M56 40 L64 32" stroke="currentColor" strokeWidth="2" />
          <path d="M56 32 L64 40" stroke="currentColor" strokeWidth="2" />
          <path d="M36 32 L44 40" stroke="currentColor" strokeWidth="2" />
          <path d="M36 40 L44 32" stroke="currentColor" strokeWidth="2" />
        </g>
        <circle cx="50" cy="50" r="5" fill="currentColor" />
      </svg>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden border border-blue-700">
      {/* Glass effect header */}
      <div className="p-6 backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-6 text-center text-white flex justify-center items-center gap-2">
          <span className="text-4xl">🌦️</span> Weather App
        </h1>

        <div className="flex gap-2 mb-6 relative">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city (e.g. Nagpur)"
            className="flex-1 p-3 pl-4 rounded-l-xl outline-none border-0 text-gray-800 bg-white shadow-inner transition-all duration-300 focus:ring-2 focus:ring-blue-400"
            onKeyPress={(e) => e.key === 'Enter' && city && getWeatherData()}
          />
          <button
            onClick={getWeatherData}
            disabled={loading || !city}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-medium px-6 py-3 rounded-r-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Search
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-800 p-4 rounded-xl mt-4 border border-red-600 shadow-lg animate-fadeIn">
            <p className="font-medium text-white flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </p>
          </div>
        )}

        {loading && <LoadingAnimation />}

        {weather && (
          <div className={`mt-6 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${showWeather ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            {/* Header with city info and current temperature */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-5 border-b border-blue-600">
              <div className="flex justify-between items-center">
                <div className="transform transition-all duration-700 delay-100">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    {weather.city}, {weather.country}
                  </h2>
                  <p className="text-blue-100">
                    {new Date(weather.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  
                  {/* Current temperature - highlighted */}
                  <div className="mt-3 bg-blue-600 bg-opacity-50 inline-block px-4 py-2 rounded-lg border border-blue-500">
                    <div className="flex items-center">
                      <span className="text-4xl mr-2">{getWeatherIcon()}</span>
                      <div>
                        <p className="text-xs text-blue-200">CURRENT</p>
                        <p className="text-3xl font-bold text-white">{weather.current}°C</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AQI Level Bar */}
            <div className="bg-blue-800 px-5 py-3 border-b border-blue-700">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-200">AIR QUALITY INDEX</span>
                <span className="text-xs text-blue-200">{weather.aqi} - {weather.aqiCategory.label}</span>
              </div>
              <div className="w-full bg-blue-900 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${weather.aqiCategory.color}`} 
                  style={{ width: `${Math.min(100, (weather.aqi / 3))}%` }}
                ></div>
              </div>
            </div>

            {/* Temperature info */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 rounded-xl shadow-lg transform transition-all duration-700 delay-200 hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">❄️</span>
                    <div>
                      <p className="text-blue-200 text-xs">MIN TEMP</p>
                      <p className="text-2xl font-semibold text-white animate-numberChange">{weather.min}°C</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 rounded-xl shadow-lg transform transition-all duration-700 delay-300 hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">🔥</span>
                    <div>
                      <p className="text-blue-200 text-xs">MAX TEMP</p>
                      <p className="text-2xl font-semibold text-white animate-numberChange">{weather.max}°C</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional weather data */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 rounded-xl shadow-lg transform transition-all duration-700 delay-400 hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3 animate-bounce" style={{ animationDuration: '3s' }}>💧</span>
                    <div>
                      <p className="text-blue-200 text-xs">RAINFALL</p>
                      <p className="text-2xl font-semibold text-white animate-numberChange">{weather.rain} mm</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 rounded-xl shadow-lg transform transition-all duration-700 delay-500 hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">
                      <svg className="w-8 h-8 text-blue-200 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animationDuration: '8s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </span>
                    <div>
                      <p className="text-blue-200 text-xs">WIND SPEED</p>
                      <p className="text-2xl font-semibold text-white animate-numberChange">{weather.wind} km/h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 rounded-xl shadow-lg transform transition-all duration-700 delay-600 hover:scale-105 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">💦</span>
                    <div>
                      <p className="text-blue-200 text-xs">HUMIDITY</p>
                      <p className="text-2xl font-semibold text-white animate-numberChange">{weather.humidity}%</p>
                    </div>
                  </div>
                  
                  {/* Humidity gauge */}
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1e40af" strokeWidth="10" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="#60a5fa" 
                        strokeWidth="10" 
                        strokeLinecap="round" 
                        strokeDasharray="282.7" 
                        strokeDashoffset={282.7 - (282.7 * weather.humidity / 100)}
                        transform="rotate(-90 50 50)"
                      />
                      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                        {weather.humidity}%
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!weather && !error && !loading && (
          <div className="bg-gradient-to-br from-blue-700 to-blue-800 p-8 rounded-xl mt-4 text-center shadow-lg">
            <div className="animate-pulse mb-4">
              <svg className="w-16 h-16 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <p className="text-blue-100">
              Enter a city name and click Search to get current weather information
            </p>
          </div>
        )}
      </div>
      
      {/* Footer with subtle branding */}
      <div className="px-6 py-3 bg-blue-900 bg-opacity-50 border-t border-blue-700">
        <p className="text-blue-300 text-xs text-center">Premium Weather Experience</p>
      </div>
    </div>
  );
};

// Add these animation classes to your global CSS or style tag
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes numberChange {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-numberChange {
    animation: numberChange 0.8s ease-out forwards;
  }
  
  .animate-spin-slow {
    animation: spin 8s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default WeatherApp;