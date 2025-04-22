$(document).ready(function () {
  let activities = [];
  let userLat = null;
  let userLng = null;

  init();

  function init() {
    loadActivities();
    getUserLocation();
    setupEventListeners();
  }

  function loadActivities() {
    $.getJSON('cards.json', function (data) {
      activities = data.map(item => item.headline);
      createCards(data);
      applyFilters();
    });
  }

  function getUserLocation() {
    navigator.geolocation.getCurrentPosition(position => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
    });
  }

  function setupEventListeners() {
    $('#search-input').on('input', handleSearchInput);
    $(document).on('click', '#suggestions li', handleSuggestionClick);
    $('#distance-slider').on('input', handleDistanceSlider);
    $(document).on('click', '#clear-all-filters', clearAllFilters);
    $(document).on('click', '.remove-filter', removeFilter);
    $('#searchBtn').on('click', applyFilters);
  }

  function handleSearchInput() {
    const searchTerm = $(this).val().toLowerCase();
    const $suggestions = $('#suggestions');
    $suggestions.empty();

    if (searchTerm) {
      const filteredActivities = activities.filter(activity => activity.toLowerCase().includes(searchTerm));
      if (filteredActivities.length > 0) {
        filteredActivities.forEach(activity => {
          $suggestions.append(`<li class="p-2 cursor-pointer hover:bg-gray-200">${activity}</li>`);
        });
        $suggestions.removeClass('hidden');
      } else {
        $suggestions.addClass('hidden');
      }
    } else {
      $suggestions.addClass('hidden');
    }
  }

  function handleSuggestionClick() {
    const selectedActivity = $(this).text();
    $('#search-input').val(selectedActivity);
    $('#suggestions').addClass('hidden');
    applyFilters();
  }

  function handleDistanceSlider() {
    const value = $(this).val();
    const displayValue = value >= 100 ? '100+' : value;
    $('#distance-value').text(displayValue);
  }

  function clearAllFilters() {
    $('#search-input').val('');
    $('input[name="category"]').prop('checked', false);
    applyFilters();
  }

  function removeFilter() {
    const type = $(this).data('type');
    const value = $(this).data('value');

    if (type === 'search') {
      $('#search-input').val('');
    }

    if (type === 'category') {
      $(`input[name="category"][value="${value.charAt(0).toUpperCase() + value.slice(1)}"]`).prop('checked', false);
    }

    applyFilters();
  }

  function createCards(data) {
    const allCards = data.map(item => {
      const $card = $('#card-template').clone().removeAttr('id').removeClass('hidden');

      $card.find('img').attr('src', item.image);
      $card.find('.rating').text(item.rating);
      $card.find('.reviews').text(`${item.reviews} reviews`);
      $card.find('.headline').text(item.headline);
      $card.find('.location').text(item.location);
      $card.find('.description').text(item.description);
      $card.attr('data-category', item.category.toLowerCase());
      $card.attr('data-lat', item.lat);
      $card.attr('data-lng', item.lng);
      $card.attr('data-keywords', item.keywords ? item.keywords.join(',') : '');
      $card.attr('data-priority', item.priority);
      $card.find('.discount').text(item.discount);
      $card.addClass('card');

      $('#cards-container').append($card);

      if (item.priority === true) {
        $('#featured-container').append($card.clone());
      }

      return {
        element: $card,
        rating: item.rating,
        priority: item.priority
      };
    });

    allCards.sort((a, b) => b.rating - a.rating).forEach(card => {
      $('#bestRated-container').append(card.element.clone());
    });
  }

  function applyFilters() {
    const searchTerm = $('#search-input').val().toLowerCase();
    const selectedCategories = $('input[name="category"]:checked').map(function () {
      return $(this).val().toLowerCase();
    }).get();

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

    selectedCategories.forEach(cat => {
      $activeFilters.append(`
        <span class="filter-pill bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
          ${cat.charAt(0).toUpperCase() + cat.slice(1)}
          <button class="remove-filter" data-type="category" data-value="${cat}">✕</button>
        </span>
      `);
    });

    if (searchTerm || selectedCategories.length > 0) {
      $activeFilters.append(`
        <span id="clear-all-filters" class="filter-pill bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 cursor-pointer">
          Verwijder alles
        </span>
      `);
    }

    let hasVisibleCards = false;
    $('.card').each(function () {
      const $card = $(this);
      const title = $card.find('.headline').text().toLowerCase();
      const location = $card.find('.location').text().toLowerCase();
      const description = $card.find('.description').text().toLowerCase();
      const keywords = ($card.data('keywords') || '').toLowerCase().split(',').map(k => k.trim());
      const category = $card.attr('data-category').toLowerCase();

      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        location.includes(searchTerm) ||
        description.includes(searchTerm) ||
        keywords.some(keyword => keyword.includes(searchTerm));

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);

      if (matchesSearch && matchesCategory) {
        $card.show();
        hasVisibleCards = true;
      } else {
        $card.hide();
      }
    });

    $('#no-results-message').toggleClass('hidden', hasVisibleCards);
  }
});