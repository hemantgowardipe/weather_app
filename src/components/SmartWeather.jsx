import React, { useState } from "react";
import { parseUserInput } from "../utils/parseInput";
import { getCoordinates, getWeather } from "../utils/fetchWeather";

const SmartWeather = () => {
  const [userInput, setUserInput] = useState("");
  const [parsedOutput, setParsedOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setParsedOutput("");

    try {
      const { location, date } = parseUserInput(userInput);

      if (!location || !date) {
        setParsedOutput("⚠️ Please include both location and date in your question.");
        setLoading(false);
        return;
      }

      const coords = await getCoordinates(location);
      if (!coords) {
        setParsedOutput("⚠️ Location not found.");
        setLoading(false);
        return;
      }

      const weatherData = await getWeather(coords.lat, coords.lon, date);
      if (!weatherData) {
        setParsedOutput("⚠️ Weather data unavailable.");
        setLoading(false);
        return;
      }

      const maxTemp = weatherData.temperature_2m_max[0];
      const minTemp = weatherData.temperature_2m_min[0];
      const rain = weatherData.precipitation_sum[0];

      setParsedOutput(
        `📍 ${location}\n📅 ${date}\n🌡️ Max: ${maxTemp}°C | Min: ${minTemp}°C\n🌧️ Rain: ${rain} mm`
      );
    } catch (error) {
      setParsedOutput("❌ Something went wrong.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-12 p-6 border rounded-xl shadow-xl bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">🌤️ Smart Weather Assistant</h1>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ask like: Will it rain in Mumbai tomorrow?"
        className="w-full p-3 border rounded-lg mb-4 outline-none"
      />

      <button
        onClick={handleAsk}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Thinking..." : "Get Weather"}
      </button>

      {parsedOutput && (
        <div className="mt-6 whitespace-pre-line bg-gray-100 p-4 rounded-lg font-mono">
          {parsedOutput}
        </div>
      )}
    </div>
  );
};

export default SmartWeather;
