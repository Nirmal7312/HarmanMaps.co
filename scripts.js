let map;
let routingControl;

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    navigator.geolocation.getCurrentPosition(position => {
        const userLocation = [position.coords.latitude, position.coords.longitude];
        map.setView(userLocation, 14);

        L.marker(userLocation).addTo(map)
            .bindPopup('You are here')
            .openPopup();

        // Set the starting point input to the user's coordinates
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('origin').value = data.display_name;
            });
    }, () => {
        alert("Geolocation failed. Using default location.");
    });
}

function geocode(address) {
    return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                return [data[0].lat, data[0].lon];
            } else {
                throw new Error("Address not found");
            }
        });
}

function calculateRoute() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;

    if (origin && destination) {
        Promise.all([geocode(origin), geocode(destination)])
            .then(([originCoords, destinationCoords]) => {
                if (routingControl) {
                    map.removeControl(routingControl);
                }

                routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(originCoords[0], originCoords[1]),
                        L.latLng(destinationCoords[0], destinationCoords[1])
                    ],
                    routeWhileDragging: true,
                    geocoder: L.Control.Geocoder.nominatim()
                }).addTo(map);
            })
            .catch(error => {
                alert("Error: " + error.message);
            });
    } else {
        alert("Please enter both origin and destination.");
    }
}

document.addEventListener('DOMContentLoaded', initMap);
