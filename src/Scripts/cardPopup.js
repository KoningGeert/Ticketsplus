// Pas dit aan in je cardPopup.js of main.js
$(document).on('click', '.show-overlay', function(e) {
    e.stopPropagation(); // Voorkom event bubbling
    
    // Zoek de dichtstbijzijnde parent card (gebruik de juiste class)
    const $card = $(this).closest('.w-full.border'); // Pas dit aan naar je card container class
    
    if ($card.length) {
        const $overlay = $card.find('.info-overlay');
        
        // Sluit alle andere overlays eerst
        $('.info-overlay').not($overlay).addClass('hidden');
        
        // Toggle de huidige overlay
        $overlay.toggleClass('hidden');
        console.log('Overlay toggled for:', $card.find('.headline').text());
    } else {
        console.error('Card container niet gevonden');
    }
});

// Sluit overlay wanneer er buiten wordt geklikt
$(document).on('click', function(e) {
    if (!$(e.target).closest('.info-overlay, .show-overlay').length) {
        $('.info-overlay').addClass('hidden');
    }
});