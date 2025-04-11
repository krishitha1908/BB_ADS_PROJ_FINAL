const deliveryPoints = [];

const map = L.map('map').setView([11.1271, 78.6569], 7);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Click event to add delivery point
map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    addDeliveryPoint(lat, lng);
});

// Function to add marker and store delivery point
function addDeliveryPoint(lat, lon) {
    deliveryPoints.push({ lat, lon });

    const marker = L.marker([lat, lon]).addTo(map);
    marker.on('contextmenu', () => {
        map.removeLayer(marker);
        const index = deliveryPoints.findIndex(point => point.lat === lat && point.lon === lon);
        if (index > -1) {
            deliveryPoints.splice(index, 1);
        }
    });
}

// Search location and drop pin
async function searchLocation() {
    const location = document.getElementById('locationSearch').value;
    if (!location) return alert("Please enter a location to search.");

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            map.setView([lat, lon], 13); // Zoom to searched location
            addDeliveryPoint(parseFloat(lat), parseFloat(lon)); // Add as delivery point
        } else {
            alert("Location not found. Try another search.");
        }
    } catch (error) {
        console.error("Search error:", error);
    }
}

// Event listener for search button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').addEventListener('click', searchLocation);
});

// Calculate TSP
document.getElementById('calculate-tsp').addEventListener('click', async () => {
    if (deliveryPoints.length < 2) {
        alert("Please select at least two delivery points.");
        return;
    }
    document.getElementById("loading-screen").style.display="flex";
    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                delivery_points: deliveryPoints.map(point => [parseFloat(point.lat), parseFloat(point.lon)])
            })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (data.error) {
            alert(`Error: ${data.error}`);
            return;
        }

        // Store JSON data in sessionStorage to pass it to routes.js
        sessionStorage.setItem("tsp_route_data", JSON.stringify(data));

        // Redirect to routes page
        window.location.href = "/routes";  // Ensure server properly maps this route

    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
    finally{
        document.getElementById("loading-screen").style.display="none";
    }
});

// Calculate TSP based on time
document.getElementById('calculate-tsp-time').addEventListener('click', async () => {
    if (deliveryPoints.length < 2) {
        alert("Please select at least two delivery points.");
        return;
    }
    document.getElementById("loading-screen").style.display="flex";
    try {
        const response = await fetch('/calculate_time_based', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                delivery_points: deliveryPoints.map(point => [parseFloat(point.lat), parseFloat(point.lon)])
            })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (data.error) {
            alert(`Error: ${data.error}`);
            return;
        }

        // Store JSON data in sessionStorage to pass it to routes.js
        sessionStorage.setItem("tsp_route_data", JSON.stringify(data));

        // Redirect to routes page
        window.location.href = "/routes";  // Ensure server properly maps this route

    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    } finally{
        document.getElementById("loading-screen").style.display="none";
    }
});
