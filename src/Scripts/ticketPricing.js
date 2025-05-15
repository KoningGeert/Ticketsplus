$(function() {
    // DOM element cache
    const $body = $('body');
    const $datetimeModal = $('#datetime-modal');
    const $modalContent = $('.modal-content');
    const $dateDisplay = $('.date-display');
    const $timeDisplay = $('.time-display');
    const $totalPrice = $('#totalPrice');
    const $voordeel = $('#voordeel');
    const $timeslotList = $('.timeslot-list');
    const $confirmBtn = $('.confirm-btn');
    const $dateInput = $("#date-input");
    const $todayBtn = $('.today-btn');
    const $tomorrowBtn = $('.tomorrow-btn');
    const $nextButton = $('#next-button'); // Knop om door te gaan
  
    // Initialisatie
    init();
  
    function init() {
        setupEventHandlers();
        loadSavedOrder();
        initFlatpickr();
        generateTimeSlots();
        updateTotals();
        checkFormCompletion(); // Controleer direct bij init
    }
  
    function setupEventHandlers() {
        // Plus/min buttons
        $('.plus').on('click', handlePlusClick);
        $('.minus').on('click', handleMinusClick);
        
        // Modal handlers
        $('#open-date-modal, #open-time-modal').on('click', handleModalOpen);
        $(document).on('click', handleModalClose);
        $modalContent.on('click', stopPropagation);
        
        // Timeslot selection
        $timeslotList.on('click', 'li', handleTimeslotSelect);
        
        // Vandaag/Morgen buttons
        $todayBtn.on('click', handleTodayClick);
        $tomorrowBtn.on('click', handleTomorrowClick);
        
        // Doorgaan knop
        $confirmBtn.on('click', handleConfirmClick);
        
        // Wijzigingen in datum/tijd
        $dateInput.on('change', checkFormCompletion);
        $timeslotList.on('click', 'li', checkFormCompletion);
      }

      function checkFormCompletion() {
        // Controleer of zowel datum als tijdslot geselecteerd zijn
        const isDateSelected = $dateDisplay.text().trim() !== 'Kies een datum';
        const isTimeSelected = $timeDisplay.text().trim() !== 'Kies een tijd';
        
        if (isDateSelected && isTimeSelected) {
            $nextButton.prop('disabled', false)
                      .removeClass('bg-gray-400 cursor-not-allowed')
                      .addClass('bg-oranje hover:bg-blauw cursor-pointer');
        } else {
            $nextButton.prop('disabled', true)
                      .removeClass('bg-oranje hover:bg-blauw')
                      .addClass('bg-gray-400 cursor-not-allowed');
        }
    }
    
    function saveOrderToStorage() {
        const bestelling = {
            activityTitle: $('#activity-title').text().trim(),
            date: $dateDisplay.text(),
            time: $timeDisplay.text(),
            items: [],
            totaalprijs: $totalPrice.text(),
            voordeel: $voordeel.text()
        };
    
        $('.product').each(function() {
            const $product = $(this);
            const quantity = parseInt($product.find('.quantity').text(), 10);
            
            if (quantity > 0) {
                bestelling.items.push({
                    type: $product.data('ticket-type'),
                    quantity: quantity,
                    price: $product.find('.price').text()
                });
            }
        });
    
        localStorage.setItem('bestelling', JSON.stringify(bestelling));
        checkFormCompletion(); // Controleer bij elke opslag
    }

    function loadSavedOrder() {
        const bestellingStr = localStorage.getItem("bestelling");
        if (!bestellingStr) {
            saveOrderToStorage();
            return;
        }
    
        const bestelling = JSON.parse(bestellingStr);
        
        // Herstel activity title (alleen als er nog geen API data is)
        if (bestelling.activityTitle && $('#activity-title').text().trim() === "") {
            $('#activity-title').text(bestelling.activityTitle);
        }
        
        // Rest van je bestaande code...
        if (bestelling.date) {
            $dateDisplay.text(bestelling.date);
            if ($dateInput[0]._flatpickr) {
                $dateInput[0]._flatpickr.setDate(bestelling.date, true, "d-m-Y");
            }
        }
        
        if (bestelling.time) {
            $timeDisplay.text(bestelling.time);
            $timeslotList.find('li').each(function() {
                if ($(this).text() === bestelling.time) {
                    $(this).addClass('bg-blauw text-white');
                    $confirmBtn.removeClass('opacity-50 pointer-events-none');
                }
            });
        }
        
        if (bestelling.items?.length) {
            bestelling.items.forEach(item => {
                $(`.product[data-ticket-type="${item.type}"] .quantity`).text(item.quantity);
            });
        }
    }

    function updateTotals() {
      let totaal = 0;
      let voordeel = 0;

      $('.product').each(function () {
          const $product = $(this);
          const quantity = parseInt($product.find('.quantity').text(), 10);
          const price = parsePrice($product.find('.price').text());
          const oldPrice = parsePrice($product.find('.oldPrice').text());

          totaal += price * quantity;
          voordeel += (oldPrice - price) * quantity;
      });

      $totalPrice.text(`€${totaal.toFixed(2).replace('.', ',')}`);
      $voordeel.text(`€${voordeel.toFixed(2).replace('.', ',')}`);
      saveOrderToStorage();
    }

    // Event handlers
    function handlePlusClick() {
        const $qty = $(this).siblings('.quantity');
        $qty.text(parseInt($qty.text(), 10) + 1);
        updateTotals();
    }

    function handleMinusClick() {
        const $qty = $(this).siblings('.quantity');
        const currentQty = parseInt($qty.text(), 10);
        if (currentQty > 0) {
            $qty.text(currentQty - 1);
            updateTotals();
        }
    }

    function handleModalOpen(e) {
        e.stopPropagation();
        $body.addClass('overflow-hidden fixed w-full');
        $datetimeModal.removeClass('hidden').addClass('flex');
        
        if ($(this).is('#open-date-modal')) {
            setTimeout(() => {
                $dateInput[0]._flatpickr?.open();
            }, 10);
        }
    }

    function handleModalClose(e) {
        if ($(e.target).is('#datetime-modal, .close-modal') && 
            !$(e.target).closest('.modal-content').length) {
            $body.removeClass('overflow-hidden fixed w-full');
            $datetimeModal.addClass('hidden').removeClass('flex');
            saveOrderToStorage();
        }
    }

    function handleTimeslotSelect() {
        $timeslotList.find('li').removeClass('bg-blauw text-white');
        $(this).addClass('bg-blauw text-white');
        $timeDisplay.text($(this).text());
        $confirmBtn.removeClass('opacity-50 pointer-events-none');
        saveOrderToStorage();
    }

    function stopPropagation(e) {
        e.stopPropagation();
    }

    function handleTodayClick() {
        const today = new Date();
        const formattedDate = formatDate(today);
        $dateDisplay.text(formattedDate);
        $dateInput[0]._flatpickr.setDate(today);

        $todayBtn.addClass('bg-blauw text-white');
        $tomorrowBtn.removeClass('bg-blauw text-white');
    
        saveOrderToStorage();
    }

    function handleTomorrowClick() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = formatDate(tomorrow);
        $dateDisplay.text(formattedDate);
        $dateInput[0]._flatpickr.setDate(tomorrow);

        $todayBtn.removeClass('bg-blauw text-white');
        $tomorrowBtn.addClass('bg-blauw text-white');
        saveOrderToStorage();
    }

    function handleConfirmClick(e) {
        e.preventDefault();
        e.stopPropagation();
        $body.removeClass('overflow-hidden fixed w-full');
        $datetimeModal.addClass('hidden').removeClass('flex');
        saveOrderToStorage();
        
        // Scroll naar ticket sectie voor betere UX
        $('html, body').animate({
            scrollTop: $("#ticket-selection").offset().top
        }, 500);
    }

    // Helper functie voor datumformattering
    function formatDate(date) {
        return date.toLocaleDateString('nl-NL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    }

    // Helpers
    function parsePrice(text) {
        return parseFloat(text.replace('€', '').replace(',', '.')) || 0;
    }

    function initFlatpickr() {
        flatpickr($dateInput, {
            dateFormat: "d-m-Y",
            minDate: "today",
            locale: "nl", // Nederlandse locale voor Flatpickr
            onChange: function(selectedDates, dateStr) {
                $dateDisplay.text(dateStr);
                saveOrderToStorage();
            }
        });
    }

    function generateTimeSlots() {
        const slots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        slots.forEach(slot => {
            $timeslotList.append($('<li>', {
                class: 'cursor-pointer rounded-lg border px-3 py-2 text-center hover:border-blauw transition',
                text: slot
            }));
        });
    }
});