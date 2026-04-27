"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDragScroll } from "./hooks/useDragScroll";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dragScrollRef = useDragScroll();

  const getWeather = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${query}&days=2`;
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
    console.log("auto:ip");
  };

  useEffect(() => {
    getWeather("auto:ip");
  }, []);
  const todayHours = weather ? weather.forecast.forecastday[0].hour : [];
  const tomorrowHours = weather ? weather.forecast.forecastday[1].hour : [];

  const localTime = weather?.location?.localtime;
  const currentHour = localTime ? localTime.split(" ")[1].split(":")[0] : null;

  const currentIndex = todayHours.findIndex((hour) => {
    const hourNumber = hour.time.split(" ")[1].split(":")[0];
    return hourNumber === currentHour;
  });

  const orderedHours = [...todayHours.slice(currentIndex), ...tomorrowHours];
  console.log(currentHour);
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
      className={`relative h-[100dvh] w-full flex flex-col  gap-4 ${weather && weather.current.condition.text.includes("night") ? "bg-black" : ""} select-none `}
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
            onKeyDown={(e) => e.key === "Enter" && getWeather(userInput)}
            placeholder="Search by city name"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 bg-transparent px-3 border border-white/25  rounded-full py-2 text-white placeholder:text-white/60 outline-none text-base"
          />
          <button
            className="rounded-full bg-white/20 px-5 py-2 text-white font-medium border border-white/25 hover:bg-white/30 active:scale-95 transition-all duration-150 select-none"
            onClick={() => getWeather(userInput)}
          >
            Search
          </button>
        </nav>
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            weather && (
              <div className="w-full h-full flex flex-col items-center justify-center ">
                <h2 className="text-white font-light text-2xl select-none pointer-events-none">
                  {weather.location.name}
                </h2>
                <p className="text-white text-6xl font-extralight select-none pointer-events-none">
                  {weather.current.temp_c}°C
                </p>
                <div className="flex items-center ">
                  <p className="text-white/90 px-2  text-nowrap select-none pointer-events-none">
                    {weather.current.condition.text}
                  </p>
                  {/* <Image
                    src={`https:${weather.current.condition.icon}`}
                    alt={weather.current.condition.text}
                    width={64}
                    height={64}
                  /> */}
                </div>
                <div className="flex gap-2 text-white">
                  <p className="select-none pointer-events-none">
                    H:{" "}
                    {Math.floor(weather.forecast.forecastday[0].day.maxtemp_c)}°
                  </p>
                  <p className="select-none pointer-events-none">
                    L:{" "}
                    {Math.floor(weather.forecast.forecastday[0].day.mintemp_c)}°
                  </p>
                </div>
              </div>
            )
          )}
        </div>
        <div
          ref={dragScrollRef}
          className=" flex drag-scroll  overflow-x-auto gap-3 cursor-pointer   [&::-webkit-scrollbar]:hidden
    [-ms-overflow-style:none]
    [scrollbar-width:none]  rounded-2xl bg-white/5  backdrop-blur-xs "
        >
          {loading ? (
            <p className="select-none pointer-events-none">Loading...</p>
          ) : error ? (
            <p className="select-none pointer-events-none">Error: {error}</p>
          ) : (
            orderedHours.map((hour, index) => (
              <div
                key={index}
                className="min-w-[70px] flex-shrink-0 rounded-2xl p-3 flex flex-col items-center gap-1 scroll-smooth select-none pointer-events-none"
              >
                <p className="text-white select-none pointer-events-none text-[14px]">
                  {index === 0 ? "Now" : hour.time.split(" ")[1].split(":")[0]}
                </p>
                <Image
                  src={`https:${hour.condition.icon}`}
                  alt={hour.condition.text}
                  draggable={false}
                  className="select-none pointer-events-none [-webkit-user-drag:none]"
                  width={40}
                  height={40}
                />
                <p className="text-white select-none pointer-events-none text-base">
                  {Math.round(hour.temp_c)}°
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
