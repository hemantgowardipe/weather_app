export async function getWeather(city) {
  const key = import.meta.env.VITE_WEATHER_API_KEY;
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${city}&days=2`);
  const data = await res.json();
  return data;
}
