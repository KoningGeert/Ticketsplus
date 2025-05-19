// Toggle info balk wanneer op info-knop wordt geklikt
$(document).on('click', '.show-overlay', function(e) {
    e.stopPropagation();
    const $card = $(this).closest('.w-full.border');
    const $infoBalk = $card.find('.info-balk');
    
    // Toggle de balk voor deze specifieke card
    $infoBalk.toggleClass('hidden');
    
    // Bereken hoogte op basis van tekstlengte
    const textHeight = $infoBalk.find('.description-text').outerHeight();
    const maxHeight = Math.min(textHeight + 20, 150); // Max 150px hoog
    $infoBalk.css('max-height', maxHeight + 'px');
    
    // Verberg alle andere balken
    $('.info-balk').not($infoBalk).addClass('hidden');
});

// Sluit info balk wanneer er buiten wordt geklikt
$(document).on('click', function(e) {
    if (!$(e.target).closest('.info-balk, .show-overlay').length) {
        $('.info-balk').addClass('hidden');
    }
});