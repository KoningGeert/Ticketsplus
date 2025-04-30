$(document).ready(function() {
  // Initialiseer de kaart
  var map = L.map('map', {
      preferCanvas: true // Helpt met z-index controle
  }).setView([52.7784, 6.9068], 15);

  // Zet z-index van kaartcontainer direct na initialisatie
  $('#map').css('z-index', '0');
  
  // Zet z-index van Leaflet controls
  $('.leaflet-control-container').css('z-index', '0');
  $('.leaflet-top, .leaflet-bottom').css('z-index', '0');

  // Tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Marker
  L.marker([52.7784, 6.9068])
      .addTo(map)
      .bindPopup('Emmen')
      .openPopup();

  // Herstel z-index na interacties (optioneel)
  map.on('zoomend move', function() {
      $('.leaflet-control-container').css('z-index', '0');
  });
});