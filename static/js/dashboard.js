// Example truck data
const truckData = [
    { id: 'T1', depot: 'Depot 1', stops: 25, status: 'Optimized' },
    { id: 'T2', depot: 'Depot 2', stops: 30, status: 'In Progress' },
    { id: 'T3', depot: 'Depot 3', stops: 20, status: 'Pending' },
    { id: 'T4', depot: 'Depot 4', stops: 40, status: 'Optimized' },
    { id: 'T5', depot: 'Depot 1', stops: 35, status: 'Optimized' },
];

// Populate the truck table
const tableBody = document.querySelector('#truck-table tbody');
truckData.forEach(truck => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${truck.id}</td>
        <td>${truck.depot}</td>
        <td>${truck.stops}</td>
        <td>${truck.status}</td>
        <td><a href="routes.html?truckId=${truck.id}" class="view-route-btn">View Route</a></td>
    `;
    tableBody.appendChild(row);
});

// Add functionality to buttons
document.getElementById('upload-matrix-btn').addEventListener('click', () => {
    alert('Upload Cost Matrix clicked!');
});

document.getElementById('generate-reports-btn').addEventListener('click', () => {
    alert('Generate Reports clicked!');
});
