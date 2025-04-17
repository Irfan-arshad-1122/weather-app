import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [localTime, setLocalTime] = useState("");

  const getWeather = async (selectedCity) => {
    const apiKey = "bd5e378503939ddaee76f12ad7a97608"; // Replace with your OpenWeatherMap API Key
    const cityQuery = selectedCity || city;
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityQuery}&appid=${apiKey}&units=metric`
      );
      setWeather(response.data);

      const timezoneOffset = response.data.timezone;
      const utcTime = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
      const cityTime = new Date(utcTime.getTime() + timezoneOffset * 1000);
      const options = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
      setLocalTime(cityTime.toLocaleTimeString("en-US", options));
    } catch (error) {
      alert("City not found.");
    }
  };

  const getSuggestions = async (query) => {
    const apiKey = "85fc72ab32mshf0f3b475d895577p1af55ejsnc07f08e9ea29"; // Replace with your GeoDB API key
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=5`;
    try {
      const response = await axios.get(url, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
        }
      });
      setSuggestions(response.data.data.map(city => city.city));
    } catch (error) {
      console.error("Failed to fetch suggestions");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.length > 2) {
      getSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestedCity) => {
    setCity(suggestedCity);
    setSuggestions([]);
    getWeather(suggestedCity);
  };

  const getBackgroundClass = () => {
    if (!weather) return "app clear";
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes("cloud")) return "app cloud";
    if (main.includes("rain")) return "app rain";
    if (main.includes("snow")) return "app snow";
    if (main.includes("mist") || main.includes("haze")) return "app haze";
    return "app clear";
  };

  return (
    <div className={getBackgroundClass()}>
      <div className="container">
        <h1 className="title">Weather App ☁️</h1>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={handleInputChange}
          className="input"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => getWeather()} className="button">Get Weather</button>

        {weather && (
          <div className="info">
            <h2>{weather.name}</h2>
            <p className="description">{weather.weather[0].description}</p>
            <p className="temp">🌡 Temp: {weather.main.temp}°C</p>
            <p className="humidity">💧 Humidity: {weather.main.humidity}%</p>
            <p className="wind">💨 Wind: {weather.wind.speed} km/h</p>
            <p className="time">🕒 Local Time: {localTime}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
