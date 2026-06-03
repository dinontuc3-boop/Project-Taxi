
    // Initialize map
    const map = L.map('map').setView([1.3521, 103.8198], 12); // Singapore center

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Marker cluster group
    const markers = L.markerClusterGroup();
    map.addLayer(markers);

    const infoDiv = document.getElementById('info');

    // Reverse geocode function using Nominatim
    async function reverseGeocode(lat, lng) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        return data.display_name || "Unknown location";
      } catch (err) {
        console.error("Reverse geocode error:", err);
        return "Location unavailable";
      }
    }

    // Fetch taxi availability data
    async function loadTaxiData() {
      try {
        const response = await fetch('https://api.data.gov.sg/v1/transport/taxi-availability');
        const data = await response.json();

        // Clear old markers
        markers.clearLayers();

        // Extract coordinates
        const coords = data.features[0].geometry.coordinates;
        coords.forEach(coord => {
          const lat = coord[1];
          const lng = coord[0];

          const marker = L.marker([lat, lng]);

          // On click, fetch reverse geocode and show popup
          marker.on("click", async () => {
            const location = await reverseGeocode(lat, lng);
            marker.bindPopup(
              `<b>Taxi Location</b><br>
               🌐 Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>
               📍 Place: ${location}`
            ).openPopup();
          });

          markers.addLayer(marker);
        });

        // Update info display
        const taxiCount = data.features[0].properties.taxi_count;
        const timestamp = new Date(data.features[0].properties.timestamp).toLocaleString('en-SG');
        infoDiv.textContent = `Available taxis: ${taxiCount} | Last update: ${timestamp}`;
      } catch (err) {
        console.error('Error fetching taxi data:', err);
        infoDiv.textContent = 'Error loading taxi data';
      }
    }

    // Load data initially and refresh every minute
    loadTaxiData();
    setInterval(loadTaxiData, 60000); 