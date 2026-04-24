"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeather = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setError(null);
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${userInput}&days=1`;
    const response = await fetch(url);
    const data = await response.json();
    setLoading(false);
    if (data.error) {
      setError(data.error.message);
      setWeather(null);
      return;
    }
    setWeather(data);
    console.log(data);
    setUserInput("");
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <nav className="w-full flex items-center justify-center gap-2">
        <input
          placeholder="Search by city name"
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button onClick={getWeather}>Search</button>
      </nav>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          weather && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <h2>{weather.location.name}</h2>
              <p>{weather.current.temp_c}°C</p>
              <div className="flex items-center gap-2">
                <p> {weather.current.condition.text}</p>
                <Image
                  src={`https:${weather.current.condition.icon}`}
                  alt={weather.current.condition.text}
                  width={64}
                  height={64}
                />
              </div>
            </div>
          )
        )}
      </div>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          weather &&
          weather.forecast.forecastday[0].hour.map((hour, index) => (
            <p key={index}>
              {hour.time}: {hour.temp_c}°C
            </p>
          ))
        )}
      </div>
    </div>
  );
}
