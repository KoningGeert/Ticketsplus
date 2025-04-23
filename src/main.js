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
      console.log('Loaded data:', data); // Controleer de geladen data
      activities = data.map(item => item.headline);
      createCards(data);
    }).fail(function () {
      console.error('Failed to load cards.json');
    });
  }

  function getUserLocation() {
    navigator.geolocation.getCurrentPosition(position => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
      applyFilters(); // Zorg dat filters pas worden toegepast na het ophalen van locatie
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
      console.log('Creating card for:', item); // Controleer de kaartgegevens
  
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
  
      return {
        element: $card,
        rating: item.rating,
        priority: item.priority
      };
    });
  
    applyFilters(); // Zorg dat filters worden toegepast
  }
  

  function applyFilters() {
    const searchTerm = $('#search-input').val().toLowerCase();
    const selectedCategories = $('input[name="category"]:checked').map(function () {
      return $(this).val().toLowerCase();
    }).get();
  
    const maxDistance = parseInt($('#distance-slider').val());
    console.log('Filters:', { searchTerm, selectedCategories, maxDistance });
  
    let hasVisibleCards = false;
    $('.card').each(function () {
      const $card = $(this);
      const title = $card.find('.headline').text().toLowerCase();
      const category = $card.attr('data-category').toLowerCase();
  
      const matchesSearch = !searchTerm || title.includes(searchTerm);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
  
      if (matchesSearch && matchesCategory) {
        $card.show();
        hasVisibleCards = true;
      } else {
        $card.hide();
      }
    });
  
    $('#no-results-message').toggleClass('hidden', hasVisibleCards);
    console.log('Has visible cards:', hasVisibleCards);
  }
});
