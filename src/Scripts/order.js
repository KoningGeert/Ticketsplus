$(document).ready(function () {
  const bestellingStr = localStorage.getItem("bestelling");

  if (bestellingStr) {
    const bestelling = JSON.parse(bestellingStr);

    // Datum & tijdslot invullen
    $(".bestelling-titel").text(bestelling.activityTitle);
    $(".bestelling-datum").text("Bezoekdatum: " + bestelling.date);
    $(".bestelling-tijd").text("Tijdslot: " + bestelling.time);

    // Lijst met tickets genereren (met totaalprijs per type)
    let listItems = "";
    bestelling.items.forEach(item => {
      if (item.quantity > 0) {
        // Bereken totaalprijs voor dit tickettype
        const priceValue = parseFloat(item.price.replace('€', '').replace(',', '.'));
        const totalPrice = (item.quantity * priceValue).toFixed(2);
        // Formatteer naar €X,XX
        const formattedPrice = '€' + totalPrice.replace('.', ',');
        
        listItems += `
          <div class="flex justify-between w-full py-1 border-b border-gray-100">
            <span>${item.quantity} × ${item.type}</span>
            <span class="font-medium">${formattedPrice}</span>
          </div>
        `;
      }
    });
    $(".bestelling-lijst").html(listItems);

    // Totaalprijs en voordeel tonen
    $(".bestelling-prijs").text(bestelling.totaalprijs);
    $(".bestelling-voordeel").text(bestelling.voordeel);
  } else {
    $(".bestelling-datum").text("Geen bestelling gevonden.");
  }

  console.log("Bestelling in localStorage:", bestellingStr);
  
  $(".bewerk-knop").on("click", function() {
    localStorage.setItem("scrollPosition", window.pageYOffset);
    window.location.href = "/src/pages/ticketpage.html";
  });

  // Scroll naar vorige positie bij terugkeren
  const savedPosition = localStorage.getItem("scrollPosition");
  if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      localStorage.removeItem("scrollPosition");
  }
});