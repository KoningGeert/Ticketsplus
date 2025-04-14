$(document).ready(function() {
    const $carousel = $('.carousel-inner');
    const $items = $('.carousel-item');
    const $indicators = $('.indicator');
    const totalItems = $items.length;
    let index = 0;

    $('#totalSlides').text(totalItems);

    function showSlide(i) {
        $carousel.css('transform', `translateX(-${i * 100}%)`);
        $indicators.removeClass('bg-gray-800').addClass('bg-gray-400');
        $indicators.eq(i).removeClass('bg-gray-400').addClass('bg-gray-800');
        $('#currentSlide').text(i + 1);
    }

    function nextSlide() {
        index = (index + 1) % totalItems;
        showSlide(index);
    }

    function prevSlide() {
        index = (index - 1 + totalItems) % totalItems;
        showSlide(index);
    }

    $('.next').click(nextSlide);
    $('.prev').click(prevSlide);

    // Automatisch doorgaan
    setInterval(nextSlide, 3000); // Verander de tijd in milliseconden naar wens

    // Initialiseer de indicatoren
    showSlide(index);
});
