import React from 'react';
import SmartWeather from './components/SmartWeather'; // ✅ this works
import WeatherApp from "./components/WeatherApp";

function App() {
  return (
    <div className="min-h-screen bg-white p-4">
      <WeatherApp />
      <SmartWeather />
    </div>
  );
  
}

export default App;
