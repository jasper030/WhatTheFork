import dotenv from "dotenv";

dotenv.config();
const MAPBOX_API = process.env.MAPBOX_ACCESS_TOKEN;

mapboxgl.accessToken = `${MAPBOX_API}`;


function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        },
        (error) => reject(error)
        );
    });
}; 

let prev_marker = null;

async function main() {
    let currentLocation;
    try {
        currentLocation = await getCurrentLocation();
    } catch (err) {
        alert(`Could not get your location.`);
    }

    const map = new mapboxgl.Map({
        container: "map",
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 14
    });

    map.on('style.load', () => {
        map.setFog({});
    });

    let userMarker = new mapboxgl.Marker()
    .setLngLat([currentLocation.lng, currentLocation.lat])
    .addTo(map)

    document.getElementById("getFood").addEventListener("click", () => {
        fetch(`http://localhost:3000/get_food?lat=${currentLocation.lat}&lng=${currentLocation.lng}`)
        .then(res => res.json())
        .then(data => {
            let storeInfo = new mapboxgl.Popup()
                                        .setHTML(`
                                            <h3>${data.name}</h3>
                                            <p>${data.address}</p>
                                            <p>⭐ ${data.rating}</p>`)
                                        .addTo(map);

            // Delete previous marker
            if (prev_marker != null) {
                prev_marker.remove();
            }

            // Add marker on the map
            prev_marker = new mapboxgl.Marker()
            .setLngLat([data.location.lng, data.location.lat])
            .addTo(map)
            .setPopup(storeInfo);
            
            map.flyTo({ center: [data.location.lng, data.location.lat], zoom: 16 });
        })
        .catch(error => {
            alert(`Failed to connect to the server: ${error.message}`);
        });
    });
};

main();