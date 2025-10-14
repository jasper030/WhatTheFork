mapboxgl.accessToken = "pk.eyJ1IjoiamFzcGVyLWNjaCIsImEiOiJjbWJidnVza2gxMmwxMmlwbzgzdXB4YmczIn0.Wetuz4uv83M42FkTW8WVEA";


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
        fetch(`https://whatthefork.netlify.app/.netlify/functions/get_food?lat=${currentLocation.lat}&lng=${currentLocation.lng}`)
        .then(res => res.json())
        .then(data => {
            // Check for valid restaurant data
            if (
                data &&
                typeof data === "object" &&
                typeof data.name === "string" &&
                typeof data.address === "string" &&
                data.location &&
                typeof data.location.lat === "number" &&
                typeof data.location.lng === "number"
            ) {
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
            } else if (
                data &&
                typeof data === "object" &&
                typeof data.message === "string"
            ) {
                alert(data.message); // Show the message from the API
            } else {
                alert("No valid restaurant data found.");
            }
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
    });
};

main();