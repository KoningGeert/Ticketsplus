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
      activities = data.map(item => ({
        headline: item.headline,
        keywords: item.keywords || [] // leeg array als keywords niet bestaan
      }));
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
    $('#search-input').on('input', function() {
      handleSearchInput();
      applyFilters(); // Pas filters direct toe bij elke input change
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
            const keywordsMatch = activity.keywords.some(keyword => 
                keyword.toLowerCase().includes(searchTerm)
            );
            return headlineMatch || keywordsMatch;
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
    $('input[name="discount"]').prop('checked', false);
  
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

    if (type === 'discount') {
      $(`input[name="discount"][value="${value}"]`).prop('checked', false);
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
      $card.attr('data-discount', item.discount);
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
    const selectedDiscounts = $('input[name="discount"]:checked').map(function () {
      return $(this).val();
    }).get();
  
    console.log('Filters:', { searchTerm, selectedCategories, selectedDiscounts });
  
    let hasVisibleCards = false;
    $('.card').each(function () {
      const $card = $(this);
      const title = $card.find('.headline').text().toLowerCase();
      const keywords = ($card.attr('data-keywords') || '').toLowerCase();
      const category = $card.attr('data-category').toLowerCase();
      const discount = parseFloat($card.attr('data-discount').replace('€', '').replace(',', '.'));
  
      const matchesSearch = !searchTerm || title.includes(searchTerm) || keywords.includes(searchTerm);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
      const matchesDiscount = selectedDiscounts.length === 0 || selectedDiscounts.some(d => {
        if (d === '€') return discount >= 0 && discount < 2.5;
        if (d === '€€') return discount >= 2.5 && discount < 5;
        if (d === '€€€') return discount >= 5;
      });
  
      if (matchesSearch && matchesCategory && matchesDiscount) {
        $card.show();
        hasVisibleCards = true;
      } else {
        $card.hide();
      }
    });
  
    $('#no-results-message').toggleClass('hidden', hasVisibleCards);
  
    // Update de filterpillen
    updateFilterPills(searchTerm, selectedCategories, selectedDiscounts);
  }
  
  function updateFilterPills(searchTerm, selectedCategories, selectedDiscounts) {
    const $activeFilters = $('#active-filters');
    $activeFilters.empty(); // Verwijder bestaande filters

    // Voeg de zoekterm toe als pil
    if (searchTerm) {
        $activeFilters.append(createFilterPill('search', searchTerm));
    }

    // Voeg de geselecteerde categorieën toe als pillen
    selectedCategories.forEach(category => {
        $activeFilters.append(createFilterPill('category', category));
    });

    // Voeg de geselecteerde kortingen toe als pillen
    selectedDiscounts.forEach(discount => {
        $activeFilters.append(createFilterPill('discount', discount));
    });

    // Toon de container als er actieve filters zijn
    if (searchTerm || selectedCategories.length > 0 || selectedDiscounts.length > 0) {
        $activeFilters.removeClass('hidden');
        $activeFilters.prepend(`
            <span id="clear-all-filters" class="filter-pill bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer">
                Verwijder alles
            </span>
        `);
    } else {
        $activeFilters.addClass('hidden');
    }
}

function createFilterPill(type, value) {
    // Speciale behandeling voor kortingswaarden
    let displayValue = value;
    if (type === 'discount') {
        if (value === '€') displayValue = 'Korting: 0-2.5€';
        if (value === '€€') displayValue = 'Korting: 2.5-5€';
        if (value === '€€€') displayValue = 'Korting: 5+€';
    } else {
        displayValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    return $(`
        <span class="filter-pill bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer mr-2 mb-2">
            ${displayValue}
            <span class="remove-filter" data-type="${type}" data-value="${value}">✕</span>
        </span>
    `);
}
  
  function createFilterPill(type, value) {
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    return $(`
      <span class="filter-pill bg-blauw text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer">
        ${capitalizedValue}
        <button class="remove-filter" data-type="${type}" data-value="${value}">✕</button>
      </span>
    `).on('click', '.remove-filter', function () {
      const type = $(this).data('type');
      const value = $(this).data('value');
  
      if (type === 'search') {
        $('#search-input').val('');
      }
  
      if (type === 'category') {
        $(`input[name="category"][value="${value.charAt(0).toUpperCase() + value.slice(1)}"]`).prop('checked', false);
      }
  
      applyFilters(); // Pas de filters opnieuw toe
    });
  }
  $('#toggle-filters').click(function() {
            $('#filter-panel').toggle();
            var buttonText = $('#filter-panel').is(':visible') ? 'Verberg filters' : 'Toon filters';
            $('#toggle-filters').text(buttonText);
        });
    
});