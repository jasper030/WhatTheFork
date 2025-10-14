import express from "express";
import fetch from "node-fetch"; // For calling Google API
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  next();
})

// Simple endpoint: GET /get_food?lat=...&lng=...
app.get("/get_food", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat/lng" });
    }

    // Call Google Places Nearby Search API
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=restaurant&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.json({ message: "No restaurants found nearby" });
    }

    // Pick random restaurant
    const randomPlace = data.results[Math.floor(Math.random() * data.results.length)];

    res.json({
      name: randomPlace.name,
      address: randomPlace.vicinity,
      rating: randomPlace.rating || "N/A",
      location: randomPlace.geometry.location,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
