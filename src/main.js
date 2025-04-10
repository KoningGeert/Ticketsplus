$(document).ready(function () {
  // Coördinaten gebruiker opslaan
  let userLat = null;
  let userLng = null;

  navigator.geolocation.getCurrentPosition(function (position) {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;
  });

  // Kaarten vullen
  $.getJSON('cards.json', function (data) {
    data.forEach(function (item) {
      let $card = $('#card-template').clone().removeAttr('id').removeClass('hidden');

      $card.find('img').attr('src', item.image);
      $card.find('.rating').text(item.rating);
      $card.find('.reviews').text(item.reviews + ' reviews');
      $card.find('.headline').text(item.headline);
      $card.find('.location').text(item.location);
      $card.find('.description').text(item.description);
      $card.attr('data-category', item.category.toLowerCase());
      $card.attr('data-lat', item.lat);
      $card.attr('data-lng', item.lng);
      $card.find('.discount').text(item.discount);
      $card.addClass('card');

      $('#cards-container').append($card);
    });

    applyFilters(); // Initieel alle kaarten tonen
  });

  // Overlay tonen/verbergen
  $(document).on('click', '.show-overlay', function () {
    const $overlay = $(this).closest('.card').find('.info-overlay');
    $('.info-overlay').not($overlay).addClass('hidden'); // Sluit alle andere overlays
    $overlay.toggleClass('hidden');
  });

  // Zoekfilter
  $('#search-input').on('input', applyFilters);

  // Categorie checkbox filter (meerdere tegelijk)
  $('input[name="category"]').on('change', applyFilters);

  // Afstand filter
  $('#distance-slider').on('input', function () {
    $('#distance-value').text($(this).val());
    applyFilters();
  });

  // Filters toepassen
  function applyFilters() {
    const searchTerm = $('#search-input').val().toLowerCase();
    const selectedCategories = $('input[name="category"]:checked').map(function () {
      return this.value.toLowerCase();
    }).get();
    const maxDistance = parseInt($('#distance-slider').val());

    $('.card').each(function () {
      const $card = $(this);
      const headline = $card.find('.headline').text().toLowerCase();
      const category = $card.data('category');
      const lat = parseFloat($card.data('lat'));
      const lng = parseFloat($card.data('lng'));

      const matchesSearch = headline.includes(searchTerm);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
      const matchesDistance = !userLat || getDistance(userLat, userLng, lat, lng) <= maxDistance;

      $card.toggle(matchesSearch && matchesCategory && matchesDistance);
    });
  }

  // Afstand berekenen (Haversine)
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // Mobile filter toggle
  $('#open-filters').on('click', function () {
    $('#mobile-filters').removeClass('hidden');
  });
  $('#close-filters').on('click', function () {
    $('#mobile-filters').addClass('hidden');
  });

  // Mobile distance update
  $('#distance-slider-mobile').on('input', function () {
    $('#distance-value-mobile').text($(this).val());
  });
});
