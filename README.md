# Weather App

A modern and responsive weather application built with HTML, CSS, and JavaScript. The application provides current weather information, detailed weather conditions, location-based weather, and a 5-day forecast using the Open-Meteo API.

## Features

- Search weather by city name
- Get weather using the user's current location
- High-accuracy browser geolocation
- Automatic location name detection
- Display current temperature
- Celsius and Fahrenheit unit conversion
- Display feels-like temperature
- Display humidity
- Display wind speed
- Display visibility
- Display atmospheric pressure
- Display cloud coverage
- Display local time
- Display sunrise and sunset times
- Display current weather conditions
- Dynamic weather icons
- 5-day weather forecast
- Recent city searches
- Loading state while fetching weather data
- User-friendly error messages
- Responsive design for desktop, tablet, and mobile devices
- No API key required

## Technologies Used

- HTML5 — Application structure
- CSS3 — Styling, responsive design, and layout
- JavaScript — Application logic and API integration
- Open-Meteo API — Weather and forecast data
- OpenStreetMap Nominatim — Reverse geocoding for location names
- Browser Geolocation API — Detecting the user's current location
- LocalStorage — Storing recent searches

## Weather Information

For a selected city or the user's current location, the application can display:

- Current temperature
- Feels-like temperature
- Weather condition
- Weather icon
- Humidity
- Wind speed
- Visibility
- Atmospheric pressure
- Cloud coverage
- Local time
- Sunrise time
- Sunset time
- 5-day temperature forecast

## Location-Based Weather

The application includes a **Use My Location** feature.

When the user clicks the location button, the browser requests permission to access their location. If permission is granted, the application uses the browser's highest available location accuracy to obtain latitude and longitude.

The coordinates are then used to retrieve weather information and determine the user's nearby location name.

For example:

```text
Bole, Addis Ababa, Ethiopia
```

The application also displays the approximate location accuracy when available.

## Temperature Units

Users can switch between:

°C Celsius
°F Fahrenheit

The current weather and 5-day forecast automatically update when the unit is changed.

## Recent Searches

The application stores recently searched cities using browser `localStorage`.

This allows users to quickly search for previously viewed cities without entering the name again.

## API

This project uses the Open-Meteo API to retrieve weather and forecast information.

Open-Meteo provides weather data without requiring an API key.

The project also uses OpenStreetMap Nominatim for reverse geocoding, which converts geographic coordinates into a readable location name.

## Project Structure

Weather_app/
│
├── index.html
├── style.css
├── script.js
└── README.md

## Responsive Design

The application is designed to work across different screen sizes, including:

- Desktop
- Laptop
- Tablet
- Mobile phone

The interface automatically adapts to smaller screens for a better user experience.

## Error Handling

The application handles common errors such as:

- Empty city search
- City not found
- Network/API errors
- Location permission denied
- Location unavailable
- Location request timeout
- Unsupported browser geolocation

Users receive clear messages when an operation cannot be completed.

## Future Improvements

Possible future improvements include:

- Hourly weather forecast
- Weather alerts
- Air quality information
- Weather charts
- Multiple saved locations
- Dark/light theme
- More detailed weather statistics
- Weather-based background animations

## Author

Getaneh

Computer Science Student & Aspiring FullStack Developer

## Project Repository

GitHub:
https://github.com/Getaneh-12/Weather_app
