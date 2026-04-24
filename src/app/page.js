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
    console.log("is_day:", data.current.is_day);
    console.log("localtime:", data.location.localtime);
  };

  let video = "/cloudy.mp4";

  if (weather) {
    if (weather && weather.current.is_day === 0) {
      video = "/night.mp4";
    } else {
      const condition = weather.current.condition.text.toLowerCase();

      if (condition.includes("rain")) {
        video = "/rainy.mp4";
      } else if (condition.includes("snow")) {
        video = "/snowy.mp4";
      } else if (condition.includes("cloud")) {
        video = "/cloudy.mp4";
      } else {
        video = "/sunny.mp4";
      }
    }
  }

  return (
    <div
      className={`relative h-[100dvh] w-full flex flex-col  gap-4 ${weather && weather.current.condition.text.includes("night") ? "bg-black" : ""} `}
    >
      <video
        playsInline
        key={video}
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={video} type="video/mp4" />
      </video>
      <div className="max-w-[800px] h-full w-full z-50 px-4 flex flex-col  gap-4 mx-auto p-4">
        <nav className="w-full h-[100px] flex items-center justify-center gap-2">
          <input
            onKeyDown={(e) => e.key === "Enter" && getWeather()}
            placeholder="Search by city name"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="border"
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
              <div className="w-full h-full flex flex-col items-center justify-center ">
                <h2 className="text-white font-light text-2xl">
                  {weather.location.name}
                </h2>
                <p className="text-white text-6xl font-extralight">
                  {weather.current.temp_c}°C
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-white/90">
                    {weather.current.condition.text}
                  </p>
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
        <div className=" flex  overflow-x-auto gap-3  scroll-smooth  rounded-2xl bg-white/5  backdrop-blur-xs ">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            weather &&
            weather.forecast.forecastday[0].hour.map((hour, index) => (
              <div
                key={index}
                className="min-w-[70px] flex-shrink-0 rounded-2xl p-3 flex flex-col items-center gap-1 scroll-smooth"
              >
                <p className="text-white">
                  {hour.time.split(" ")[1].split(":")[0]}
                </p>
                <Image
                  src={`https:${hour.condition.icon}`}
                  alt={hour.condition.text}
                  width={40}
                  height={40}
                />
                <p className="text-white">{Math.round(hour.temp_c)}°</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
