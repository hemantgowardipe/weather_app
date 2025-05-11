import axios from 'axios';

// Get latitude & longitude from a city name using Open-Meteo's geocoding
export async function getCoordinates(location) {
  try {
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`);
    const place = response.data.results?.[0];
    return place ? { lat: place.latitude, lon: place.longitude } : null;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}

// Fetch weather data for a given date and location
export async function getWeather(lat, lon, date) {
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: date,
        end_date: date,
        daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'],
        timezone: 'auto',
      },
    });

    return response.data.daily;
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}
