$(document).ready(function() {
    // Functie om de totaalprijs en het voordeel bij te werken
    function updateTotal() {
        let total = 0;
        let totalOldPrice = 0;
        $('.product').each(function() {
            const price = parseFloat($(this).find('.price').text().replace('€', '').replace(',', '.'));
            const oldPrice = parseFloat($(this).find('.oldPrice').text().replace('€', '').replace(',', '.'));
            const quantity = parseInt($(this).find('.quantity').text());
            total += price * quantity;
            totalOldPrice += oldPrice * quantity;
        });
        $('#totalPrice').text('€' + total.toFixed(2).replace('.', ','));
        
        // Bereken en update het voordeel
        const voordeel = totalOldPrice - total;
        $('#voordeel').text('€' + voordeel.toFixed(2).replace('.', ','));
    }

    // Event handlers voor de plus en min knoppen
    $('.plus').click(function() {
        let quantityElement = $(this).siblings('.quantity');
        let quantity = parseInt(quantityElement.text());
        quantityElement.text(quantity + 1);
        updateTotal();
    });

    $('.minus').click(function() {
        let quantityElement = $(this).siblings('.quantity');
        let quantity = parseInt(quantityElement.text());
        if (quantity > 0) {
            quantityElement.text(quantity - 1);
            updateTotal();
        }
    });

    // Initialiseer de totaalprijs en het voordeel
    updateTotal();
});
