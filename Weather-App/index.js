const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherResult = document.getElementById("weatherResult");

const weatherCodes = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm"
};

async function fetchWeatherByCoords(latitude, longitude) {
  weatherResult.innerHTML = '<p class="status">Loading weather...</p>';

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
    );

    const geoData = await geoResponse.json();
    const place = geoData.results?.[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`
    );

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    const weatherText = weatherCodes[current.weather_code] || "Weather condition";
    const cityName = place ? `${place.name}${place.admin1 ? `, ${place.admin1}` : ""}, ${place.country}` : "Your location";

    weatherResult.innerHTML = `
      <div class="location">${cityName}</div>
      <div class="temperature">${Math.round(current.temperature_2m)}°C</div>
      <div class="condition">${weatherText}</div>
      <div class="weather-meta">
        <span>Wind: ${Math.round(current.wind_speed_10m)} km/h</span>
        <span>Humidity: ${current.relative_humidity_2m}%</span>
      </div>
    `;
  } catch (error) {
    showError(error.message || "Unable to load weather data.");
  }
}

async function fetchWeather(city) {
  const cityName = city.trim();

  if (!cityName) {
    showError("Please enter a city name.");
    return;
  }

  weatherResult.innerHTML = '<p class="status">Loading weather...</p>';

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Try another location.");
    }

    const { name, country, latitude, longitude, admin1 } = geoData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`
    );

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    const weatherText = weatherCodes[current.weather_code] || "Weather condition";

    weatherResult.innerHTML = `
      <div class="location">${name}${admin1 ? `, ${admin1}` : ""}, ${country}</div>
      <div class="temperature">${Math.round(current.temperature_2m)}°C</div>
      <div class="condition">${weatherText}</div>
      <div class="weather-meta">
        <span>Wind: ${Math.round(current.wind_speed_10m)} km/h</span>
        <span>Humidity: ${current.relative_humidity_2m}%</span>
      </div>
    `;
  } catch (error) {
    showError(error.message || "Unable to load weather data.");
  }
}

function showError(message) {
  weatherResult.innerHTML = `<p class="status error">${message}</p>`;
}

function getUserLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by this browser.");
    return;
  }

  weatherResult.innerHTML = '<p class="status">Tracking your location...</p>';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      showError("Location access denied. Search for a city instead.");
    }
  );
}

searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
locationBtn.addEventListener("click", getUserLocation);
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    fetchWeather(cityInput.value);
  }
});

getUserLocation();
