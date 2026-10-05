const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");

const weatherContent =
    document.getElementById("weatherContent");

const currentWeather =
    document.getElementById("currentWeather");

const forecastSection =
    document.getElementById("forecastSection");

const forecast =
    document.getElementById("forecast");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const locationBtn =
    document.getElementById("locationBtn");

const celsiusBtn =
    document.getElementById("celsiusBtn");

const fahrenheitBtn =
    document.getElementById("fahrenheitBtn");

const recentSearches =
    document.getElementById("recentSearches");

const recentCities =
    document.getElementById("recentCities");


let currentUnit = "C";

let currentWeatherData = null;

let currentPlace = null;

let currentCoordinates = null;

let recentCityList =
    JSON.parse(
        localStorage.getItem("weatherRecentCities")
    ) || [];



form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const city =
            cityInput.value.trim();

        if (city === "") {

            showMessage(
                "Please enter a city name."
            );

            return;
        }

        getWeather(city);
    }
);



locationBtn.addEventListener(
    "click",
    function () {

        if (!navigator.geolocation) {

            showMessage(
                "Your browser does not support location services."
            );

            return;
        }

        showLoading();

        message.textContent =
            "Getting your precise location...";

        navigator.geolocation.getCurrentPosition(
            handleCurrentLocation,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );
    }
);



celsiusBtn.addEventListener(
    "click",
    function () {

        if (currentUnit === "C") {
            return;
        }

        currentUnit = "C";

        updateUnitButtons();

        if (
            currentWeatherData &&
            currentPlace
        ) {

            displayWeather(
                currentPlace,
                currentWeatherData
            );

            displayForecast(
                currentWeatherData
            );
        }
    }
);



fahrenheitBtn.addEventListener(
    "click",
    function () {

        if (currentUnit === "F") {
            return;
        }

        currentUnit = "F";

        updateUnitButtons();

        if (
            currentWeatherData &&
            currentPlace
        ) {

            displayWeather(
                currentPlace,
                currentWeatherData
            );

            displayForecast(
                currentWeatherData
            );
        }
    }
);



async function getWeather(city) {

    showLoading();

    message.textContent =
        `Searching for ${city}...`;

    try {

        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                city
            )}&count=1&language=en&format=json`;

        const geoResponse =
            await fetch(geoUrl);

        if (!geoResponse.ok) {

            throw new Error(
                "Unable to find this city."
            );
        }

        const geoData =
            await geoResponse.json();

        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "City not found. Please try another name."
            );
        }

        const place =
            geoData.results[0];

        const weatherData =
            await fetchWeather(
                place.latitude,
                place.longitude
            );

        currentPlace =
            place;

        currentWeatherData =
            weatherData;

        currentCoordinates = {
            latitude: place.latitude,
            longitude: place.longitude
        };

        displayWeather(
            place,
            weatherData
        );

        displayForecast(
            weatherData
        );

        addRecentCity(place);

        cityInput.value =
            place.name;

        hideLoading();

    } catch (error) {

        hideLoading();

        showMessage(
            error.message ||
            "Unable to load weather information."
        );

        hideWeatherContent();
    }
}



async function fetchWeather(
    latitude,
    longitude
) {

    const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,pressure_msl,cloud_cover,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
        `&timezone=auto` +
        `&forecast_days=5`;

    const weatherResponse =
        await fetch(weatherUrl);

    if (!weatherResponse.ok) {

        throw new Error(
            "Unable to load weather data."
        );
    }

    return await weatherResponse.json();
}



async function handleCurrentLocation(
    position
) {

    try {

        const latitude =
            position.coords.latitude;

        const longitude =
            position.coords.longitude;

        const accuracy =
            position.coords.accuracy;


        currentCoordinates = {
            latitude,
            longitude,
            accuracy
        };


        message.textContent =
            "Finding your actual location name...";


        const weatherData =
            await fetchWeather(
                latitude,
                longitude
            );


        let place = null;


        try {

            const reverseGeoUrl =
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;


            const reverseResponse =
                await fetch(
                    reverseGeoUrl,
                    {
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (reverseResponse.ok) {

                const reverseData =
                    await reverseResponse.json();


                const address =
                    reverseData.address || {};


                const realLocationName =
                    address.suburb ||
                    address.neighbourhood ||
                    address.quarter ||
                    address.village ||
                    address.town ||
                    address.city_district ||
                    address.city ||
                    "Your Location";


                const cityName =
                    address.city ||
                    address.town ||
                    address.village ||
                    address.municipality ||
                    "";


                const country =
                    address.country ||
                    "";


                place = {

                    name:
                        realLocationName,

                    city:
                        cityName,

                    country:
                        country,

                    latitude:
                        latitude,

                    longitude:
                        longitude,

                    displayName:
                        reverseData.display_name
                };
            }

        } catch (error) {

            console.log(
                "Reverse geocoding unavailable."
            );
        }


        if (!place) {

            place = {

                name:
                    "Your Location",

                city:
                    "",

                country:
                    "",

                latitude:
                    latitude,

                longitude:
                    longitude
            };
        }


        currentPlace =
            place;


        currentWeatherData =
            weatherData;


        displayWeather(
            place,
            weatherData
        );


        displayForecast(
            weatherData
        );


        hideLoading();


        const accuracyText =
            formatLocationAccuracy(
                accuracy
            );


        message.textContent =
            `Weather based on your current location${accuracyText}.`;

    } catch (error) {

        hideLoading();

        showMessage(
            error.message ||
            "Unable to get weather for your current location."
        );

        hideWeatherContent();
    }
}



function handleLocationError(
    error
) {

    hideLoading();

    let errorMessage =
        "Unable to access your location.";


    if (
        error.code ===
        error.PERMISSION_DENIED
    ) {

        errorMessage =
            "Location permission was denied. Please allow location access in your browser.";
    }


    if (
        error.code ===
        error.POSITION_UNAVAILABLE
    ) {

        errorMessage =
            "Your precise location is currently unavailable.";
    }


    if (
        error.code ===
        error.TIMEOUT
    ) {

        errorMessage =
            "Getting your location took too long. Please try again.";
    }


    showMessage(
        errorMessage
    );


    hideWeatherContent();
}



function displayWeather(
    place,
    data
) {

    const current =
        data.current;

    const daily =
        data.daily;


    const code =
        current.weather_code;


    const cityName =
        document.getElementById(
            "cityName"
        );


    const weatherDate =
        document.getElementById(
            "weatherDate"
        );


    const weatherIcon =
        document.getElementById(
            "weatherIcon"
        );


    const temperature =
        document.getElementById(
            "temperature"
        );


    const condition =
        document.getElementById(
            "condition"
        );


    const feelsLike =
        document.getElementById(
            "feelsLike"
        );


    const humidity =
        document.getElementById(
            "humidity"
        );


    const wind =
        document.getElementById(
            "wind"
        );


    const visibility =
        document.getElementById(
            "visibility"
        );


    const pressure =
        document.getElementById(
            "pressure"
        );


    const cloudiness =
        document.getElementById(
            "cloudiness"
        );


    const localTime =
        document.getElementById(
            "localTime"
        );


    const sunrise =
        document.getElementById(
            "sunrise"
        );


    const sunset =
        document.getElementById(
            "sunset"
        );


    const temperatureValue =
        convertTemperature(
            current.temperature_2m
        );


    const feelsLikeValue =
        convertTemperature(
            current.apparent_temperature
        );


    let locationName =
        "Your Location";


    if (place.name) {

        locationName =
            place.name;


        if (
            place.city &&
            place.name.toLowerCase() !==
            place.city.toLowerCase()
        ) {

            locationName +=
                `, ${place.city}`;
        }


        if (place.country) {

            locationName +=
                `, ${place.country}`;
        }
    }


    cityName.textContent =
        locationName;


    weatherDate.textContent =
        formatDate(
            current.time
        );


    temperature.textContent =
        `${Math.round(
            temperatureValue
        )}°${currentUnit}`;


    condition.textContent =
        getWeatherText(
            code
        );


    feelsLike.textContent =
        `${Math.round(
            feelsLikeValue
        )}°${currentUnit}`;


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    wind.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    visibility.textContent =
        formatVisibility(
            current.visibility
        );


    pressure.textContent =
        `${Math.round(
            current.pressure_msl
        )} hPa`;


    cloudiness.textContent =
        `${current.cloud_cover}%`;


    localTime.textContent =
        formatLocalTime(
            current.time
        );


    weatherIcon.src =
        getWeatherIcon(
            code,
            current.is_day
        );


    weatherIcon.alt =
        getWeatherText(
            code
        );


    if (
        daily.sunrise &&
        daily.sunrise.length > 0
    ) {

        sunrise.textContent =
            formatTime(
                daily.sunrise[0]
            );
    }


    if (
        daily.sunset &&
        daily.sunset.length > 0
    ) {

        sunset.textContent =
            formatTime(
                daily.sunset[0]
            );
    }


    showWeatherContent();
}



function displayForecast(
    data
) {

    forecast.innerHTML =
        "";


    const daily =
        data.daily;


    const days =
        daily.time || [];


    days.forEach(
        function (date, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "forecast-card";


            const day =
                document.createElement(
                    "h3"
                );


            day.className =
                "forecast-day";


            day.textContent =
                index === 0
                    ? "Today"
                    : getDayName(
                        date
                    );


            const icon =
                document.createElement(
                    "img"
                );


            icon.src =
                getWeatherIcon(
                    daily.weather_code[index],
                    1
                );


            icon.alt =
                getWeatherText(
                    daily.weather_code[index]
                );


            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                getWeatherText(
                    daily.weather_code[index]
                );


            const temperature =
                document.createElement(
                    "p"
                );


            temperature.className =
                "forecast-temperature";


            const maxTemperature =
                convertTemperature(
                    daily.temperature_2m_max[
                        index
                    ]
                );


            const minTemperature =
                convertTemperature(
                    daily.temperature_2m_min[
                        index
                    ]
                );


            temperature.textContent =
                `${Math.round(
                    maxTemperature
                )}° / ${Math.round(
                    minTemperature
                )}°`;


            card.appendChild(
                day
            );


            card.appendChild(
                icon
            );


            card.appendChild(
                description
            );


            card.appendChild(
                temperature
            );


            forecast.appendChild(
                card
            );
        }
    );


    forecastSection.classList.remove(
        "hidden"
    );
}



function convertTemperature(
    celsius
) {

    if (
        currentUnit === "F"
    ) {

        return (
            celsius * 9 / 5
        ) + 32;
    }


    return celsius;
}



function updateUnitButtons() {

    celsiusBtn.classList.toggle(
        "active",
        currentUnit === "C"
    );


    fahrenheitBtn.classList.toggle(
        "active",
        currentUnit === "F"
    );
}



function getDayName(
    dateString
) {

    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );
}



function formatDate(
    dateTime
) {

    if (!dateTime) {
        return "";
    }


    const date =
        new Date(
            dateTime
        );


    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric"
        }
    );
}



function formatLocalTime(
    dateTime
) {

    if (!dateTime) {
        return "--:--";
    }


    const date =
        new Date(
            dateTime
        );


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}



function formatTime(
    dateTime
) {

    if (!dateTime) {
        return "--:--";
    }


    const date =
        new Date(
            dateTime
        );


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}



function formatVisibility(
    meters
) {

    if (
        meters === undefined ||
        meters === null
    ) {

        return "-- km";
    }


    return `${(
        meters / 1000
    ).toFixed(1)} km`;
}



function formatLocationAccuracy(
    accuracy
) {

    if (
        accuracy === undefined ||
        accuracy === null
    ) {

        return "";
    }


    if (accuracy < 1000) {

        return ` (accuracy about ${Math.round(
            accuracy
        )} meters)`;
    }


    return ` (accuracy about ${(
        accuracy / 1000
    ).toFixed(1)} km)`;
}



function getWeatherText(
    code
) {

    const map = {

        0: "Clear sky",

        1: "Mainly clear",

        2: "Partly cloudy",

        3: "Overcast",

        45: "Foggy",

        48: "Foggy",

        51: "Light drizzle",

        53: "Drizzle",

        55: "Heavy drizzle",

        56: "Freezing drizzle",

        57: "Heavy freezing drizzle",

        61: "Light rain",

        63: "Rain",

        65: "Heavy rain",

        66: "Freezing rain",

        67: "Heavy freezing rain",

        71: "Light snow",

        73: "Snow",

        75: "Heavy snow",

        77: "Snow grains",

        80: "Rain showers",

        81: "Heavy rain showers",

        82: "Violent rain showers",

        85: "Light snow showers",

        86: "Heavy snow showers",

        95: "Thunderstorm",

        96: "Thunderstorm with hail",

        99: "Heavy thunderstorm with hail"
    };


    return (
        map[code] ||
        "Weather"
    );
}



function getWeatherIcon(
    code,
    isDay = 1
) {

    const iconMap = {

        0: isDay
            ? "01d"
            : "01n",

        1: isDay
            ? "02d"
            : "02n",

        2: isDay
            ? "02d"
            : "02n",

        3: isDay
            ? "04d"
            : "04n",

        45: isDay
            ? "50d"
            : "50n",

        48: isDay
            ? "50d"
            : "50n",

        51: "09d",

        53: "09d",

        55: "09d",

        56: "13d",

        57: "13d",

        61: "10d",

        63: "10d",

        65: "10d",

        66: "13d",

        67: "13d",

        71: "13d",

        73: "13d",

        75: "13d",

        77: "13d",

        80: "09d",

        81: "09d",

        82: "09d",

        85: "13d",

        86: "13d",

        95: "11d",

        96: "11d",

        99: "11d"
    };


    const icon =
        iconMap[code] ||
        "01d";


    return (
        `https://openweathermap.org/img/wn/${icon}@2x.png`
    );
}



function showLoading() {

    message.textContent =
        "";


    loading.classList.remove(
        "hidden"
    );


    weatherContent.classList.add(
        "hidden"
    );


    emptyState.classList.add(
        "hidden"
    );
}



function hideLoading() {

    loading.classList.add(
        "hidden"
    );
}



function showWeatherContent() {

    weatherContent.classList.remove(
        "hidden"
    );


    emptyState.classList.add(
        "hidden"
    );


    message.textContent =
        "";
}



function hideWeatherContent() {

    weatherContent.classList.add(
        "hidden"
    );


    emptyState.classList.remove(
        "hidden"
    );
}



function showMessage(
    text
) {

    message.textContent =
        text;


    emptyState.classList.remove(
        "hidden"
    );
}



function addRecentCity(
    place
) {

    if (
        !place ||
        !place.name
    ) {

        return;
    }


    if (
        place.name ===
        "Your Location"
    ) {

        return;
    }


    const cityName =
        place.name;


    recentCityList =
        recentCityList.filter(
            function (city) {

                return (
                    city.toLowerCase() !==
                    cityName.toLowerCase()
                );
            }
        );


    recentCityList.unshift(
        cityName
    );


    recentCityList =
        recentCityList.slice(
            0,
            5
        );


    localStorage.setItem(
        "weatherRecentCities",
        JSON.stringify(
            recentCityList
        )
    );


    displayRecentCities();
}



function displayRecentCities() {

    recentCities.innerHTML =
        "";


    if (
        recentCityList.length === 0
    ) {

        recentSearches.classList.add(
            "hidden"
        );


        return;
    }


    recentSearches.classList.remove(
        "hidden"
    );


    recentCityList.forEach(
        function (city) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "recent-city";


            button.textContent =
                city;


            button.addEventListener(
                "click",
                function () {

                    cityInput.value =
                        city;


                    getWeather(
                        city
                    );
                }
            );


            recentCities.appendChild(
                button
            );
        }
    );
}



displayRecentCities();

updateUnitButtons();
