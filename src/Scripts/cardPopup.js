// Overlay tonen/verbergen
$(document).on('click', '.show-overlay', function () {
    const $overlay = $(this).closest('.card').find('.info-overlay');
    $('.info-overlay').not($overlay).addClass('hidden'); // Sluit alle andere overlays
    $overlay.toggleClass('hidden');
});
