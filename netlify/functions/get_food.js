import fetch from "node-fetch"; // For calling Google API

export async function handler(event, context) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "https://whatthefork.netlify.app",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: "OK",
        };
    }

    if (event.httpMethod === "GET") {
        try {
        let { lat, lng } = event.queryStringParameters;
        if (!lat || !lng) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Missing lat/lng" }),
            };
        }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=restaurant&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({message: "No restaurant found nearby..."}),
            };
        }

    const randomPlace = data.results[Math.floor(Math.random() * data.results.length)];

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                name: randomPlace.name,
                address: randomPlace.vicinity,
                rating: randomPlace.rating || "N/A",
                location: randomPlace.geometry.location,
            }),
        };
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Server error" }),
            };
        }
    }
}
