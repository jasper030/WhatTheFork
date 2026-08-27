import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

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

async function main() {
    const MAP_KEY = "REMOVED_KEY";
    setOptions({key: MAP_KEY});

    const { Map, InfoWindow } = await importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker");

    let currentLocation;
    try {
        currentLocation = await getCurrentLocation();
    } catch (err) {
        alert(`Could not get your location.`);
    }

    // Create map element
    const mapEl = document.getElementById("map");
    const mapOptions = {
        center: currentLocation,
        zoom: 14,
        mapId: "STORE_MAP",
    };

    const map = new Map(mapEl, mapOptions);

    // Show user position
    const userMarker = new AdvancedMarkerElement({
        map: map,
        position: currentLocation,
        title: "You",
    });

    let storeMarker = null;
    // Button function
    document.getElementById("getFood").addEventListener("click", () => {
        fetch(`${import.meta.env.VITE_API_URL}get_food?lat=${currentLocation.lat}&lng=${currentLocation.lng}`)
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
                if (storeMarker !== null) {
                    storeMarker.map = null; // Remove the marker from the map
                }
                storeMarker = new AdvancedMarkerElement({
                        map: map,
                        position: {
                            lat: data.location.lat, 
                            lng: data.location.lng,
                        },
                });
                let storeInfo = new InfoWindow({
                    content: `<h3>${data.name}</h3>
                              <p>${data.address}</p>
                              <p>⭐ ${data.rating}</p>`,
                    headerContent: `Store information`,
                });
                
                storeInfo.open({
                    anchor: storeMarker,
                    map: map,
                });
                
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
