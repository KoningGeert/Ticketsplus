$(document).ready(function () {
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }

  function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }

  function saveUserLocationToCookie(lat, lng, days = 7) {
    setCookie('userLat', lat, days);
    setCookie('userLng', lng, days);
    console.log(`Location saved to cookies: Latitude = ${lat}, Longitude = ${lng}`);
  }

  function getUserLocationFromCookie() {
    const lat = getCookie('userLat');
    const lng = getCookie('userLng');
    return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
  }

  function getUserLocation() {
    const savedLocation = getUserLocationFromCookie();
    if (savedLocation) {
      console.log('Using saved location:', savedLocation);
      userLat = savedLocation.lat;
      userLng = savedLocation.lng;
      applyFilters();
    } else {
      navigator.geolocation.getCurrentPosition(position => {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
        console.log('Fetched new location:', { lat: userLat, lng: userLng });
        saveUserLocationToCookie(userLat, userLng);
        applyFilters();
      }, error => {
        console.error('Error fetching location:', error);
      });
    }
  }

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
      console.log('Loaded data:', data);
      activities = data.map(item => ({
        headline: item.headline,
        keywords: item.keywords || []
      }));
      createCards(data);
    }).fail(function () {
      console.error('Failed to load cards.json');
    });
  }

  function setupEventListeners() {
    $('#search-input').on('input', function () {
      handleSearchInput();
      applyFilters();
    });
    $(document).on('click', '#suggestions li', handleSuggestionClick);
    $('#distance-slider').on('input', handleDistanceSlider);
    $(document).on('click', '#clear-all-filters', clearAllFilters);
    $(document).on('click', '.remove-filter', removeFilter);
    $('#searchBtn').on('click', applyFilters);
  }

  function handleSearchInput() {
    const searchTerm = $('#search-input').val().toLowerCase();
    const $suggestions = $('#suggestions');
    $suggestions.empty();

    if (searchTerm.length > 0) { // Alleen suggesties tonen bij 1+ karakters
        const filteredActivities = activities.filter(activity => {
            const headlineMatch = activity.headline.toLowerCase().includes(searchTerm);
            const locationMatch = activity.location && activity.location.toLowerCase().includes(searchTerm);
            const keywordsMatch = activity.keywords.some(keyword => 
                keyword.toLowerCase().includes(searchTerm)
            );
            return headlineMatch || keywordsMatch || locationMatch;
        });

        if (filteredActivities.length > 0) {
            filteredActivities.forEach(activity => {
                $suggestions.append(
                    `<li class="p-2 cursor-pointer hover:bg-gray-200">${activity.headline}</li>`
                );
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
    // Reset zoekterm
    $('#search-input').val('');
  
    // Deselecteer alle categorieën
    $('input[name="category"]').prop('checked', false);
  
    // Verberg de actieve filters
    $('#active-filters').addClass('hidden');
  
    // Pas de filters opnieuw toe
    applyFilters();
  }
  
  // Voeg een event listener toe voor de "Verwijder alles"-knop
  $(document).on('click', '#clear-all-filters', clearAllFilters);

  function removeFilter() {
    const type = $(this).data('type');
    const value = $(this).data('value');

    if (type === 'search') {
      $('#search-input').val('');
    }

    if (type === 'category') {
      $(`input[name="category"][value="${value.charAt(0).toUpperCase() + value.slice(1)}"]`).prop('checked', false);
    }

    if (type === 'price-category') {
      $(`input[name="price-category"][value="${value}"]`).prop('checked', false);
    }    
    
    

    applyFilters();
  }

  function createCards(data) {
    const allCards = data.map(item => {
      const $card = $('#card-template').clone().removeAttr('id').removeClass('hidden');
      console.log('Creating card for:', item); // Controleer de kaartgegevens
  
      $card.find('.card-image').attr('src', item.image);
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
      $card.attr('data-price', item.price);
      $card.attr('data-price-category', item.price_category);

      if (item.discount && item.discount.trim() !== '') {
        $card.find('.discount').text(item.discount);
      } else {
        $card.find('.discount').closest('.relative').hide(); // Verberg de hele badge-container
      }
      
  
      if (item.countryCode) {
        const flagUrl = `https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png`;
        $card.find('.flag-icon').attr('src', flagUrl).attr('alt', item.countryCode);
      }

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
    const selectedPriceCategories = $('input[name="price-category"]:checked').map(function () {
      return $(this).val();
    }).get();
  
    let hasVisibleCards = false;
  
    $('.card').each(function () {
      const $card = $(this);
      const title = $card.find('.headline').text().toLowerCase();
      const keywords = ($card.attr('data-keywords') || '').toLowerCase();
      const category = $card.attr('data-category').toLowerCase();
      const location = $card.find('.location').text().toLowerCase();
      const cardPriceCategory = $card.attr('data-price-category');
  
      const matchesSearch = !searchTerm || title.includes(searchTerm) || keywords.includes(searchTerm) || location.includes(searchTerm);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
      const matchesPrice = selectedPriceCategories.length === 0 || selectedPriceCategories.includes(cardPriceCategory);
  
      if (matchesSearch && matchesCategory && matchesPrice) {
        $card.show();
        hasVisibleCards = true;
      } else {
        $card.hide();
      }
    });
  
    $('#no-results-message').toggleClass('hidden', hasVisibleCards);
  
    // Update filter pills
    updateFilterPills(searchTerm, selectedCategories);
  }  

  function updateFilterPills(searchTerm, selectedCategories) {
    const $activeFilters = $('#active-filters');
    const $dynamicFilters = $('#dynamic-filters');
    
    $dynamicFilters.empty(); // Leeg de dynamische filters
  
    const selectedPriceCategories = $('input[name="price-category"]:checked').map(function () {
      return $(this).val();
    }).get();
  
    selectedPriceCategories.forEach(price => {
      $dynamicFilters.append(createFilterPill('price-category', price));
    });
  
    if (searchTerm) {
      $dynamicFilters.append(createFilterPill('search', searchTerm));
    }
  
    selectedCategories.forEach(category => {
      $dynamicFilters.append(createFilterPill('category', category));
    });
  
    if (searchTerm || selectedCategories.length > 0 || selectedPriceCategories.length > 0) {
      $activeFilters.removeClass('hidden');
  
      // Voeg "Alles wissen" knop toe als die nog niet bestaat
      if ($('#clear-all-filters').length === 0) {
        $dynamicFilters.before(`
          <span id="clear-all-filters" class="filter-pill bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 cursor-pointer mr-2 mb-2 hover:bg-gray-300 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Alles wissen
          </span>
        `);
      }
    } else {
      $activeFilters.addClass('hidden');
    }
  }
  
  function createFilterPill(type, value) {
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
  
    return `
      <span class="filter-pill bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 cursor-pointer mr-2 mb-2 hover:bg-gray-300 w-fit">
        <span>${capitalizedValue}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 remove-filter" viewBox="0 0 20 20" fill="currentColor"
          data-type="${type}" data-value="${value}">
          <path fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd" />
        </svg>
      </span>
    `;
  }
  

    
});