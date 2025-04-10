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
    // Maak eerst alle kaarten aan en voeg toe aan cards-container
    const allCards = data.map(function (item) {
      const $card = $('#card-template').clone().removeAttr('id').removeClass('hidden');

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
      $card.attr('data-priority', item.priority);
      $card.addClass('card');

      // Voeg toe aan cards-container
      $('#cards-container').append($card);

      // Als priority true is, voeg ook toe aan featured-container
      if (item.priority === true) {
        $('#featured-container').append($card.clone());
      }

      return {
        element: $card,
        rating: item.rating,
        priority: item.priority
      };
    });

    // Voeg kaarten toe aan bestRated-container gesorteerd op rating
    allCards
      .sort((a, b) => b.rating - a.rating) // Sorteer hoog naar laag
      .forEach(card => {
        $('#bestRated-container').append(card.element.clone());
      });

    applyFilters(); // Initieel alle kaarten tonen
  });
});

  // Overlay tonen/verbergen
  $(document).on('click', '.show-overlay', function () {
    const $overlay = $(this).closest('.card').find('.info-overlay');
    $('.info-overlay').not($overlay).addClass('hidden'); // Sluit alle andere overlays
    $overlay.toggleClass('hidden');
  });

  // Overlay tonen/verbergen
  $(document).on('click', '.show-overlay', function () {
    const $overlay = $(this).closest('.card').find('.info-overlay');
    $('.info-overlay').not($overlay).addClass('hidden'); // Sluit alle andere overlays
    $overlay.toggleClass('hidden');
  });

  // Globale referentie naar alle aangemaakte kaarten
let allCardsData = [];

function applyFilters() {
  const searchTerm = $('#search-input').val().toLowerCase();
  const selectedCategories = $('input[name="category"]:checked')
    .map(function () {
      return $(this).val().toLowerCase();
    })
    .get();

  // Toon pillen van actieve filters
  const $activeFilters = $('#active-filters');
  $activeFilters.empty();

  if (searchTerm) {
    $activeFilters.append(`
      <span class="filter-pill bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
        Zoek: "${searchTerm}"
        <button class="remove-filter" data-type="search">✕</button>
      </span>
    `);
  }

  selectedCategories.forEach(function (cat) {
    $activeFilters.append(`
      <span class="filter-pill bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        <button class="remove-filter" data-type="category" data-value="${cat}">✕</button>
      </span>
    `);
  });

  // Filter de kaarten
  $('.card').each(function () {
    const $card = $(this);
    const title = $card.find('.headline').text().toLowerCase();
    const location = $card.find('.location').text().toLowerCase();
    const description = $card.find('.description').text().toLowerCase();
    const category = $card.attr('data-category');

    const matchesSearch =
      title.includes(searchTerm) ||
      location.includes(searchTerm) ||
      description.includes(searchTerm);

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(category);

    if (matchesSearch && matchesCategory) {
      $card.show();
    } else {
      $card.hide();
    }
  });

  if (matchesSearch == 0){
    no-results-message
  }
}

// Verwijder filter via pill
$(document).on('click', '.remove-filter', function () {
  const type = $(this).data('type');
  const value = $(this).data('value');

  if (type === 'search') {
    $('#search-input').val('');
  }

  if (type === 'category') {
    $(`input[name="category"][value="${value.charAt(0).toUpperCase() + value.slice(1)}"]`).prop('checked', false);
  }

  applyFilters();
});

$('#searchBtn').on('click', function () {
  applyFilters();
});


// // Event listeners op filters
// $('#search-input').on('input', applyFilters);
// $('input[name="category"]').on('change', applyFilters);
