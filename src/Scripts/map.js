// main.js
$(document).ready(function () {
    var map = L.map("map").setView([52.7784, 6.9068], 15);
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    L.marker([52.7784, 6.9068]).addTo(map).bindPopup("Emmen").openPopup();
  
    // Voorbeeld overlay toggler
    $("#openOverlay").on("click", function () {
      $("#overlay").removeClass("hidden");
    });
  
    $("#closeOverlay").on("click", function () {
      $("#overlay").addClass("hidden");
    });
  });
  