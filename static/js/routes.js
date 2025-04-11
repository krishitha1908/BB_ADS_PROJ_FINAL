document.addEventListener("DOMContentLoaded", async function () {
    const map = L.map("map").setView([11.1271, 78.6569], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Fetch stored route data from sessionStorage
    const routeDataJSON = sessionStorage.getItem("tsp_route_data");

    if (!routeDataJSON) {
        console.warn("No route data available.");
        return;
    }
    
    try {
        const data = JSON.parse(routeDataJSON);

        if (!data.optimal_route || data.optimal_route.length < 2) {
            console.warn("Invalid route data received.");
            return;
        }

        // Convert route indices to waypoints
        const waypoints = data.optimal_route.map(index => {
            return L.latLng(data.delivery_points[index][0], data.delivery_points[index][1]);
        });

        // Ensure the route forms a loop
        waypoints.push(waypoints[0]);

        // Function to get real-world addresses from coordinates
        async function getAddress(lat, lon) {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const result = await response.json();
            return result.display_name || `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
        }

        // Fetch addresses for all waypoints
        const addresses = await Promise.all(waypoints.map(point => getAddress(point.lat, point.lng)));

        // Custom marker icons
        const startIcon = L.divIcon({
            className: "custom-icon",
            html: '<div style="background-color: green; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white;"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const endIcon = L.divIcon({
            className: "custom-icon",
            html: '<div style="background-color: red; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white;"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const stopIcon = L.divIcon({
            className: "custom-icon",
            html: '<div style="background-color: blue; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white;"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });

        // Add the routing control with real roads
        L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            createMarker: (i, waypoint) => {
                let marker;
                let label;
                
                if (i === 0) {
                    marker = L.marker(waypoint.latLng, { icon: startIcon });
                    label = `<strong>Start Point</strong><br>${addresses[i]}`;
                } else if (i === waypoints.length - 1) {
                    marker = L.marker(waypoint.latLng, { icon: endIcon });
                    label = `<strong>End Point</strong><br>${addresses[i]}`;
                } else {
                    marker = L.marker(waypoint.latLng, { icon: stopIcon });
                    label = `<strong>Stop ${i}</strong><br>${addresses[i]}`;
                }

                return marker.bindPopup(label);
            },
            fitSelectedRoutes: true,
            lineOptions: { styles: [{ color: "blue", weight: 5 }] }
        }).addTo(map);

    } catch (error) {
        console.error("Error parsing route data:", error);
    } 
});
