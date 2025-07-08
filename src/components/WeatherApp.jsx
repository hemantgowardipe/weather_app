import React, { useState, useEffect } from "react";
import { Search, MapPin, Wind, Droplets, Eye, Thermometer, Sun, Moon, CloudRain, Gauge } from "lucide-react";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWeather, setShowWeather] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
      // Get coordinates from city
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
      const geoData = await geoResponse.json();
      const location = geoData.results?.[0];

      if (!location) {
        setError("City not found. Please try again.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = location;
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Get 7-day weather forecast
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&current=temperature_2m,relative_humidity_2m,windspeed_10m,visibility,pressure_msl,weathercode&hourly=temperature_2m,weathercode&start_date=${today}&end_date=${nextWeek}&timezone=auto`);
      const weatherData = await weatherResponse.json();

      const daily = weatherData.daily;
      const current = weatherData.current;
      const hourly = weatherData.hourly;

      // Get hourly forecast for next 24 hours
      const hourlyForecast = hourly.time.slice(0, 24).map((time, index) => ({
        time: new Date(time).getHours(),
        temp: Math.round(hourly.temperature_2m[index]),
        weatherCode: hourly.weathercode[index]
      }));

      // Generate 7-day forecast
      const forecast = daily.temperature_2m_max.map((maxTemp, index) => ({
        date: new Date(daily.time[index]),
        max: Math.round(maxTemp),
        min: Math.round(daily.temperature_2m_min[index]),
        precipitation: daily.precipitation_sum[index] || 0,
        windSpeed: Math.round(daily.windspeed_10m_max[index]),
        weatherCode: daily.weathercode[index]
      }));

      // Mock AQI data (in real app, use air quality API)
      const aqiValue = Math.floor(Math.random() * 150) + 20;
      const aqiCategory = getAqiCategory(aqiValue);

      // Mock UV index
      const uvIndex = Math.floor(Math.random() * 11) + 1;

      setTimeout(() => {
        setWeather({
          city: name,
          country,
          date: today,
          current: {
            temp: Math.round(current.temperature_2m),
            humidity: Math.round(current.relative_humidity_2m),
            windSpeed: Math.round(current.windspeed_10m),
            visibility: Math.round(current.visibility / 1000), // Convert to km
            pressure: Math.round(current.pressure_msl),
            weatherCode: current.weathercode,
            feelsLike: Math.round(current.temperature_2m + (Math.random() * 6 - 3)) // Mock feels like
          },
          forecast,
          hourlyForecast,
          aqi: aqiValue,
          aqiCategory,
          uvIndex,
          sunrise: "06:30",
          sunset: "18:45"
        });
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch weather data. Please try again.");
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherCode, size = "text-4xl") => {
    const iconMap = {
      0: "☀️", // Clear sky
      1: "🌤️", // Mainly clear
      2: "⛅", // Partly cloudy
      3: "☁️", // Overcast
      45: "🌫️", // Fog
      48: "🌫️", // Depositing rime fog
      51: "🌦️", // Light drizzle
      53: "🌦️", // Moderate drizzle
      55: "🌦️", // Dense drizzle
      61: "🌧️", // Light rain
      63: "🌧️", // Moderate rain
      65: "🌧️", // Heavy rain
      71: "🌨️", // Light snow
      73: "🌨️", // Moderate snow
      75: "🌨️", // Heavy snow
      80: "🌦️", // Light showers
      81: "🌧️", // Moderate showers
      82: "🌧️", // Violent showers
      95: "⛈️", // Thunderstorm
      96: "⛈️", // Thunderstorm with hail
      99: "⛈️" // Thunderstorm with heavy hail
    };
    return <span className={size}>{iconMap[weatherCode] || "☀️"}</span>;
  };

  const getWeatherDescription = (weatherCode) => {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Light rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Light showers",
      81: "Moderate showers",
      82: "Violent showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail"
    };
    return descriptions[weatherCode] || "Clear sky";
  };

  const getAqiCategory = (aqi) => {
    if (aqi <= 50) return { label: "Good", color: "bg-emerald-500", textColor: "text-emerald-100" };
    if (aqi <= 100) return { label: "Moderate", color: "bg-amber-500", textColor: "text-amber-100" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "bg-orange-500", textColor: "text-orange-100" };
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-100" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-100" };
    return { label: "Hazardous", color: "bg-red-900", textColor: "text-red-100" };
  };

  const getUVCategory = (uv) => {
    if (uv <= 2) return { label: "Low", color: "bg-emerald-500" };
    if (uv <= 5) return { label: "Moderate", color: "bg-amber-500" };
    if (uv <= 7) return { label: "High", color: "bg-orange-500" };
    if (uv <= 10) return { label: "Very High", color: "bg-red-500" };
    return { label: "Extreme", color: "bg-purple-500" };
  };

  const formatTime = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-cyan-200/30 rounded-full animate-spin border-t-cyan-400 shadow-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse shadow-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-2 sm:p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <div className="relative">
              <Sun className="text-yellow-400 drop-shadow-lg animate-pulse" size={36} />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <span className="sm:inline font-extrabold tracking-wide">WeatherPro</span>
          </h1>
          <p className="text-blue-200/80 text-sm sm:text-base font-medium">Your premium weather companion</p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search for a city..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-xl border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all duration-500 text-sm sm:text-base shadow-2xl font-medium"
              onKeyDown={(e) => e.key === 'Enter' && city && getWeatherData()}
            />
          </div>
          <button
            onClick={getWeatherData}
            disabled={loading || !city}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 text-sm sm:text-base"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 text-red-100 px-6 py-4 rounded-2xl mb-4 sm:mb-6 backdrop-blur-xl shadow-2xl">
            <p className="flex items-center gap-2 text-sm sm:text-base font-medium">
              <span className="text-lg">⚠️</span> {error}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
            <LoadingSpinner />
          </div>
        )}

        {/* Weather Display */}
        {weather && (
          <div className={`transition-all duration-1000 ${showWeather ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            
            {/* Current Weather Card */}
            <br />
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 border border-white/20 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-700 hover:scale-[1.02]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <div className="flex items-center gap-3 text-white">
                  <div className="relative">
                    <MapPin size={20} className="text-cyan-400 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md"></div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    {weather.city}, {weather.country}
                  </span>
                </div>
                <div className="text-blue-200/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-xl">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                    <div className="relative">
                      {getWeatherIcon(weather.current.weatherCode, "text-7xl sm:text-8xl drop-shadow-2xl")}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse"></div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                        {weather.current.temp}°C
                      </div>
                      <div className="text-blue-200/80 text-base sm:text-lg font-medium">
                        Feels like {weather.current.feelsLike}°C
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-200/90 text-lg sm:text-xl font-semibold">
                    {getWeatherDescription(weather.current.weatherCode)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-center border border-white/10 shadow-xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105">
                    <div className="relative mb-3">
                      <Droplets className="text-cyan-400 mx-auto drop-shadow-lg" size={24} />
                      <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg"></div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{weather.current.humidity}%</div>
                    <div className="text-blue-200/80 text-sm sm:text-base font-medium">Humidity</div>
                  </div>
                  <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-center border border-white/10 shadow-xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
                    <div className="relative mb-3">
                      <Wind className="text-blue-400 mx-auto drop-shadow-lg" size={24} />
                      <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg"></div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{weather.current.windSpeed}</div>
                    <div className="text-blue-200/80 text-sm sm:text-base font-medium">km/h</div>
                  </div>
                  <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-center border border-white/10 shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 hover:scale-105">
                    <div className="relative mb-3">
                      <Eye className="text-indigo-400 mx-auto drop-shadow-lg" size={24} />
                      <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-lg"></div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{weather.current.visibility}</div>
                    <div className="text-blue-200/80 text-sm sm:text-base font-medium">km</div>
                  </div>
                  <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-center border border-white/10 shadow-xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105">
                    <div className="relative mb-3">
                      <Gauge className="text-purple-400 mx-auto drop-shadow-lg" size={24} />
                      <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{weather.current.pressure}</div>
                    <div className="text-blue-200/80 text-sm sm:text-base font-medium">hPa</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6">
              {weather.hourlyForecast.map((hour, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-3 sm:p-4 text-center min-w-[80px] sm:min-w-[100px] border border-white/10 shadow-xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-110"
                >
                  <div className="text-blue-200/80 text-xs sm:text-sm mb-2 font-medium">{formatTime(hour.time)}</div>
                  <div className="mb-2">
                    {getWeatherIcon(hour.weatherCode, "text-xl sm:text-2xl drop-shadow-lg")}
                  </div>
                  <div className="text-white font-bold mt-2 text-sm sm:text-base">{hour.temp}°</div>
                </div>
              ))}
            </div>

            {/* 7-Day Forecast */}
            <div className="space-y-3 sm:space-y-4 mb-8">
              {weather.forecast.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 transition-all duration-500 border border-white/10 shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="text-white font-bold w-24 text-sm sm:text-base">{formatDate(day.date)}</div>
                    <div className="relative">
                      {getWeatherIcon(day.weatherCode, "text-2xl sm:text-3xl drop-shadow-lg")}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-lg"></div>
                    </div>
                    <div className="text-blue-200/90 text-sm sm:text-base font-medium">{getWeatherDescription(day.weatherCode)}</div>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 text-sm sm:text-base text-blue-200/90">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xl">
                      <Droplets size={16} className="text-cyan-400" />
                      <span className="font-medium">{day.precipitation}mm</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xl">
                      <Wind size={16} className="text-blue-400" />
                      <span className="font-medium">{day.windSpeed}km/h</span>
                    </div>
                    <div className="flex items-center gap-2 text-white bg-white/10 px-3 py-1 rounded-full backdrop-blur-xl">
                      <span className="text-blue-200/80 font-medium">{day.min}°</span>
                      <span className="text-blue-200/60">/</span>
                      <span className="font-bold">{day.max}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Air Quality */}
              <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-700 hover:scale-[1.02]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-lg"></div>
                  </div>
                  Air Quality
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-200/80 font-medium">AQI</span>
                  <span className="text-white font-bold text-xl">{weather.aqi}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full ${weather.aqiCategory.color} transition-all duration-1000 shadow-lg`} 
                    style={{ width: `${Math.min(100, (weather.aqi / 3))}%` }}
                  ></div>
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${weather.aqiCategory.color} ${weather.aqiCategory.textColor} shadow-lg`}>
                  {weather.aqiCategory.label}
                </div>
              </div>

              {/* UV Index & Sun Times */}
              <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-700 hover:scale-[1.02]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="relative">
                    <Sun className="text-yellow-400 drop-shadow-lg" size={24} />
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-lg"></div>
                  </div>
                  Sun & UV
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Sun className="text-yellow-400 drop-shadow-lg" size={20} />
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-lg"></div>
                      </div>
                      <span className="text-blue-200/80 font-medium">UV Index</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-xl">{weather.uvIndex}</div>
                      <div className={`text-xs px-3 py-1 rounded-full ${getUVCategory(weather.uvIndex).color} text-white font-bold shadow-lg`}>
                        {getUVCategory(weather.uvIndex).label}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Sun className="text-orange-400 drop-shadow-lg" size={20} />
                        <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-lg"></div>
                      </div>
                      <span className="text-blue-200/80 font-medium">Sunrise</span>
                    </div>
                    <span className="text-white font-bold text-lg">{weather.sunrise}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Moon className="text-blue-400 drop-shadow-lg" size={20} />
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg"></div>
                      </div>
                      <span className="text-blue-200/80 font-medium">Sunset</span>
                    </div>
                    <span className="text-white font-bold text-lg">{weather.sunset}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!weather && !error && !loading && (
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/20 shadow-2xl">
            <div className="text-8xl mb-6 animate-bounce">🌤️</div>
            <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Welcome to WeatherPro
            </h3>
            <p className="text-blue-200/80 max-w-md mx-auto font-medium leading-relaxed">
              Get detailed weather information, 7-day forecasts, and air quality data for any city worldwide.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;