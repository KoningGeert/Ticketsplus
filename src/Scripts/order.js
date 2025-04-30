$(document).ready(function () {
    const bestellingStr = localStorage.getItem("bestelling");
  
    if (bestellingStr) {
      const bestelling = JSON.parse(bestellingStr);
  
      // Datum & tijdslot invullen
      $(".bestelling-datum").text("Bezoekdatum: " + bestelling.date);
      $(".bestelling-tijd").text("Tijdslot: " + bestelling.time);
  
      // Lijst met tickets genereren
      let listItems = "";
      bestelling.items.forEach(item => {
        listItems += `<li>${item.quantity} ${item.type}</li>`;
      });
      $(".bestelling-lijst").html(listItems);
  
      // Prijs en voordeel tonen
      $(".bestelling-prijs").text(bestelling.totaalprijs);
      $(".bestelling-voordeel").text(bestelling.voordeel);
    } else {
      $(".bestelling-datum").text("Geen bestelling gevonden.");
    }
  
    console.log("Bestelling in localStorage:", bestellingStr);
    $(".bewerk-knop").on("click", function() {
      // Sla de huidige scrollpositie op voor een betere UX
      localStorage.setItem("scrollPosition", window.pageYOffset);
      
      // Navigeer terug naar de ticketpagina
      window.location.href = "/src/pages/ticketpage.html"; // Pas dit pad aan naar jouw structuur
  });

  // Optioneel: Scroll naar vorige positie bij terugkeren
  const savedPosition = localStorage.getItem("scrollPosition");
  if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      localStorage.removeItem("scrollPosition");
  }
});
  