$(document).ready(function () {
  const bestellingStr = localStorage.getItem("bestelling");

  if (bestellingStr) {
    const bestelling = JSON.parse(bestellingStr);

    // Datum & tijdslot invullen
    $(".bestelling-titel").text(bestelling.activityTitle);
    $(".bestelling-datum").text("Bezoekdatum: " + bestelling.date);
    $(".bestelling-tijd").text("Tijdslot: " + bestelling.time);

    // Lijst met tickets genereren (met prijs per ticket)
    let listItems = "";
    bestelling.items.forEach(item => {
      // Toon de prijs direct zoals die in de localStorage staat (met € teken)
      listItems += `<div class="flex justify-between w-full"><li>${item.quantity} × ${item.type} </li><span class="float-right">${item.price}</span></div>`;
    });
    $(".bestelling-lijst").html(listItems);

    // Prijs en voordeel tonen (direct zoals in localStorage)
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
    window.location.href = "/src/pages/ticketpage.html";
  });

  // Optioneel: Scroll naar vorige positie bij terugkeren
  const savedPosition = localStorage.getItem("scrollPosition");
  if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      localStorage.removeItem("scrollPosition");
  }
});