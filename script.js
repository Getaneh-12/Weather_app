const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");
const forecast = document.getElementById("forecast");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});

async function getWeather(city) {
    message.textContent = "Loading...";

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to find this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another name.");
        }

        const place = geoData.results[0];
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to load weather data.");
        }

        const weatherData = await weatherResponse.json();
        displayWeather(place, weatherData);
        displayForecast(weatherData);
        message.textContent = "";
    } catch (error) {
        message.textContent = error.message;
        currentWeather.classList.add("hidden");
        forecastSection.classList.add("hidden");
    }
}

function displayWeather(place, data) {
    const current = data.current;
    const code = current.weather_code;

    document.getElementById("cityName").textContent = `${place.name}, ${place.country || place.admin1 || ""}`.trim();
    document.getElementById("temperature").textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById("condition").textContent = getWeatherText(code);
    document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
    document.getElementById("wind").textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById("weatherIcon").src = getWeatherIcon(code);
    document.getElementById("localTime").textContent = getLocalTime();

    currentWeather.classList.remove("hidden");
}

function displayForecast(data) {
    forecast.innerHTML = "";

    const days = data.daily.time || [];

    days.forEach(function (date, index) {
        const card = document.createElement("div");
        card.className = "forecast-card";

        const day = document.createElement("h3");
        day.textContent = getDayName(date);

        const icon = document.createElement("img");
        icon.src = getWeatherIcon(data.daily.weather_code[index]);
        icon.alt = "Weather";

        const temp = document.createElement("p");
        temp.textContent = `${Math.round(data.daily.temperature_2m_max[index])}°C`;

        const description = document.createElement("p");
        description.textContent = getWeatherText(data.daily.weather_code[index]);

        card.appendChild(day);
        card.appendChild(icon);
        card.appendChild(temp);
        card.appendChild(description);
        forecast.appendChild(card);
    });

    forecastSection.classList.remove("hidden");
}

function getDayName(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getLocalTime() {
    const now = new Date();
    return now.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getWeatherText(code) {
    const map = {
        0: "clear sky",
        1: "mainly clear",
        2: "partly cloudy",
        3: "overcast",
        45: "foggy",
        48: "foggy",
        51: "light drizzle",
        53: "drizzle",
        55: "heavy drizzle",
        56: "freezing drizzle",
        57: "heavy freezing drizzle",
        61: "light rain",
        63: "rain",
        65: "heavy rain",
        66: "freezing rain",
        67: "heavy freezing rain",
        71: "light snow",
        73: "snow",
        75: "heavy snow",
        77: "snow grains",
        80: "rain showers",
        81: "heavy rain showers",
        82: "violent rain showers",
        85: "light snow showers",
        86: "heavy snow showers",
        95: "thunderstorm",
        96: "thunderstorm with hail",
        99: "heavy thunderstorm with hail"
    };

    return map[code] || "weather";
}

function getWeatherIcon(code) {
    const iconMap = {
        0: "https://openweathermap.org/img/wn/01d@2x.png",
        1: "https://openweathermap.org/img/wn/02d@2x.png",
        2: "https://openweathermap.org/img/wn/02d@2x.png",
        3: "https://openweathermap.org/img/wn/03d@2x.png",
        45: "https://openweathermap.org/img/wn/50d@2x.png",
        48: "https://openweathermap.org/img/wn/50d@2x.png",
        51: "https://openweathermap.org/img/wn/09d@2x.png",
        53: "https://openweathermap.org/img/wn/09d@2x.png",
        55: "https://openweathermap.org/img/wn/09d@2x.png",
        56: "https://openweathermap.org/img/wn/13d@2x.png",
        57: "https://openweathermap.org/img/wn/13d@2x.png",
        61: "https://openweathermap.org/img/wn/10d@2x.png",
        63: "https://openweathermap.org/img/wn/10d@2x.png",
        65: "https://openweathermap.org/img/wn/10d@2x.png",
        66: "https://openweathermap.org/img/wn/13d@2x.png",
        67: "https://openweathermap.org/img/wn/13d@2x.png",
        71: "https://openweathermap.org/img/wn/13d@2x.png",
        73: "https://openweathermap.org/img/wn/13d@2x.png",
        75: "https://openweathermap.org/img/wn/13d@2x.png",
        77: "https://openweathermap.org/img/wn/13d@2x.png",
        80: "https://openweathermap.org/img/wn/09d@2x.png",
        81: "https://openweathermap.org/img/wn/09d@2x.png",
        82: "https://openweathermap.org/img/wn/09d@2x.png",
        85: "https://openweathermap.org/img/wn/13d@2x.png",
        86: "https://openweathermap.org/img/wn/13d@2x.png",
        95: "https://openweathermap.org/img/wn/11d@2x.png",
        96: "https://openweathermap.org/img/wn/11d@2x.png",
        99: "https://openweathermap.org/img/wn/11d@2x.png"
    };

    return iconMap[code] || "https://openweathermap.org/img/wn/01d@2x.png";
}