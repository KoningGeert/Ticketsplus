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
  });
  