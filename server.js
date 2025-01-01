require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API to get temperature and weather condition based on city or coordinates
app.get("/api/temperature", async (req, res) => {
  const city = req.query.city;
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (!city && (!lat || !lon)) {
    return res
      .status(400)
      .json({ error: "City or location coordinates are required" });
  }

  let url = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.API_KEY}`;

  if (city) {
    url += `&q=${city}`;
  } else if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  }

  try {
    console.log(`Fetching weather data for city or location`);
    const response = await axios.get(url);

    // Get the temperature in Kelvin
    const kelvinTemp = response.data.main.temp;

    // Convert Kelvin to Celsius
    const celsiusTemp = kelvinTemp - 273.15;

    // Optionally, convert to Fahrenheit
    const fahrenheitTemp = (kelvinTemp - 273.15) * (9 / 5) + 32;

    // Get the weather condition (e.g., "Clear", "Rain", etc.)
    const weatherCondition = response.data.weather[0].main;

    console.log(
      `Weather: ${weatherCondition} | Temperature: ${kelvinTemp} K | ${celsiusTemp.toFixed(
        2
      )} °C | ${fahrenheitTemp.toFixed(2)} °F`
    );

    // Sending response with temperature and weather condition
    res.json({
      city: response.data.name,
      temperatureCelsius: celsiusTemp.toFixed(2),
      temperatureFahrenheit: fahrenheitTemp.toFixed(2),
      weather: weatherCondition,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({
        error: error.response.data.message || "Failed to fetch weather data",
      });
    }
    return res.status(500).json({ error: "Unexpected server error" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
