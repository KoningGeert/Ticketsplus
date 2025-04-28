$(document).ready(function () {
  // Globale variabelen
  let selectedDate = null;
  let selectedTime = null;
  let fp = null; // Flatpickr instance

  let orderData = {
    date: null,
    time: null,
    tickets: [],
    totalPrice: 0,
    totalDiscount: 0,
  };

  const timeOptions = [
    "09:00", "09:15", "09:30", "09:45",
    "10:15", "10:30", "10:45", "11:00",
    "11:15", "11:30", "11:45", "12:00", "12:15"
  ];

  // Flatpickr initialiseren
  function initFlatpickr() {
    const datepickerEl = document.getElementById("datepicker");
    if (datepickerEl) {
      fp = flatpickr(datepickerEl, {
        dateFormat: "d-m-Y",
        minDate: "today",
        disableMobile: true,
        defaultDate: null,
        static: true,
        appendTo: document.querySelector('#datepicker-container'),
        onChange: function (selectedDates, dateStr) {
          selectedDate = dateStr;
          syncDateAndTime();
          renderTimeslots();
          updateDayButtons();
        }
      });
    }
  }
  // Flatpickr configuratie aanpassen
fp = flatpickr(".datepicker", {
  // ... bestaande opties ...
  static: true,
  appendTo: document.querySelector('.datepicker-container'),
  // ... andere opties ...
});
// Toevoegen na Flatpickr initialisatie
$(".datepicker").on("click", function(e) {
  e.preventDefault();
  if (fp) {
    fp.open();
  }
});
  // Datum weergave synchroniseren
  function syncDateAndTime() {
    const formattedDate = selectedDate ? formatDisplayDate(selectedDate) : "Kies een bezoekdatum";
    $(".date-display-mobile, .date-display-desktop").text(formattedDate);
    $(".time-display-mobile, .time-display-desktop").text(selectedTime || "Kies een tijdslot");

    orderData.date = selectedDate;
    orderData.time = selectedTime;

    // Visuele feedback
    $(".date-display-desktop, .date-display-mobile").toggleClass("text-red-500", !selectedDate);
    $(".time-display-desktop, .time-display-mobile").toggleClass("text-red-500", !selectedTime);
  }

  // Datum opmaken voor weergave (bijv. "24 april")
  function formatDisplayDate(dateStr) {
    const months = ["januari", "februari", "maart", "april", "mei", "juni",
                   "juli", "augustus", "september", "oktober", "november", "december"];
    const [day, month, year] = dateStr.split('-');
    return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
  }

  // Tijdslots renderen
  function renderTimeslots() {
    let html = timeOptions.map(time => `
      <li>
        <button class="timeslot-btn w-full px-4 py-2 border rounded flex justify-between items-center 
               transition disabled:bg-gray-100 disabled:text-gray-400 hover:bg-grijs hover:text-white" 
          data-time="${time}"
          aria-pressed="false">
          <span>${time}</span>
        </button>
      </li>`).join('');

    $(".timeslot-list").html(html);
    $(".timeslot-btn").prop("disabled", !selectedDate)
      .attr("title", !selectedDate ? "Selecteer eerst een datum" : null);

    // Herstel geselecteerd tijdslot indien aanwezig
    if (selectedTime) {
      $(`.timeslot-btn[data-time="${selectedTime}"]`)
        .addClass("bg-blauw text-white font-semibold")
        .attr("aria-pressed", "true");
    }
  }

  // Vandaag/Morgen knoppen bijwerken
  function updateDayButtons() {
    if (!selectedDate) {
      $('.today-btn, .tomorrow-btn').removeClass('bg-blauw text-white');
      return;
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const selected = new Date(selectedDate.split('-').reverse().join('-'));

    if (selected.toDateString() === today.toDateString()) {
      $('.today-btn').addClass('bg-blauw text-white');
      $('.tomorrow-btn').removeClass('bg-blauw text-white');
    } else if (selected.toDateString() === tomorrow.toDateString()) {
      $('.tomorrow-btn').addClass('bg-blauw text-white');
      $('.today-btn').removeClass('bg-blauw text-white');
    } else {
      $('.today-btn, .tomorrow-btn').removeClass('bg-blauw text-white');
    }
  }

  // Datum instellen via knoppen
  function setDateViaButton(offsetDays) {
    if (!fp) {
      console.error("Flatpickr is niet geïnitialiseerd");
      return;
    }
    
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    fp.setDate(date, true);
  }

  // Event handlers
  function setupEventHandlers() {
    // Vandaag/Morgen knoppen
    $(document).on("click", ".today-btn", function() {
      setDateViaButton(0);
    });
    
    $(document).on("click", ".tomorrow-btn", function() {
      setDateViaButton(1);
    });

    // Tijdslot selectie
    $(document).on("click", ".timeslot-btn", function () {
      $(".timeslot-btn").removeClass("bg-blauw text-white font-semibold")
        .attr("aria-pressed", "false");
      $(this).addClass("bg-blauw text-white font-semibold")
        .attr("aria-pressed", "true");

      selectedTime = $(this).data("time");
      syncDateAndTime();
      $(".confirm-btn").removeClass("opacity-50 pointer-events-none");
    });

    // Bevestigingsknop
    $(".confirm-btn").on("click", function () {
      if (selectedDate && selectedTime) {
        $(this).closest(".datetime-modal").addClass("hidden").removeClass("flex");
      } else {
        alert("Kies eerst een datum en tijdslot.");
      }
    });

    $(".open-modal, #open-date-modal-mobile, #open-date-modal-desktop").on("click", function() {
      let modalId = "#datetime-modal";
      if ($(this).is("#open-date-modal-mobile")) modalId = "#datetime-modal-mobile";
      else if ($(this).is("#open-date-modal-desktop")) modalId = "#datetime-modal-desktop";
    
      $(modalId).removeClass("hidden").addClass("flex");
    
      // Kalender direct openen
      setTimeout(() => {
        if (fp) {
          fp.open();
          // Forceer herpositionering voor betere weergave
          setTimeout(() => fp._positionCalendar(), 10);
        }
      }, 50); // Korte vertraging voor betrouwbaarheid
    });

    // Modal sluiten
    $(".close-modal").on("click", function () {
      $(this).closest(".datetime-modal").addClass("hidden").removeClass("flex");
    });

    // Ticket hoeveelheden
    $(".plus").on("click", function() {
      const $product = $(this).closest('.product');
      const type = $product.data('ticket-type');
      const quantity = parseInt($product.find('.quantity').text()) + 1;
      syncQuantities(type, quantity);
    });

    $(".minus").on("click", function() {
      const $product = $(this).closest('.product');
      const type = $product.data('ticket-type');
      const quantity = Math.max(0, parseInt($product.find('.quantity').text()) - 1);
      syncQuantities(type, quantity);
    });

    // Bestelknop
    $(".btnOrange").click(function () {
      const totaalAantal = orderData.tickets.reduce((sum, item) => sum + item.quantity, 0);
      const errorBox = $("#error-box");

      if (totaalAantal === 0) {
        errorBox.text("Selecteer minstens één ticket om door te gaan.").show();
        return;
      }
      if (!orderData.date) {
        errorBox.text("Selecteer een bezoekdatum.").show();
        return;
      }
      if (!orderData.time) {
        errorBox.text("Selecteer een tijdslot.").show();
        return;
      }

      const bestelling = {
        items: orderData.tickets,
        date: orderData.date,
        time: orderData.time,
        totaalprijs: "€" + orderData.totalPrice.toFixed(2).replace(".", ","),
      };

      localStorage.setItem("bestelling", JSON.stringify(bestelling));
      console.log("Bestelling opgeslagen:", bestelling);
    });

    // Error box verbergen
    $("input, button").on("click", function () {
      $("#error-box").hide();
    });
  }

  // Helper functies
  function syncQuantities(type, newValue) {
    $(`.product[data-ticket-type="${type}"] .quantity`).text(newValue);
    updateTotal();
  }

  function updateTotal() {
    let total = 0;
    let totalOldPrice = 0;
    let tickets = [];

    $('.product:visible').each(function () {
      const $this = $(this);
      const ticketType = $this.data('ticket-type');
      const price = parseFloat($this.find('.price').text().replace('€', '').replace(',', '.'));
      const oldPrice = parseFloat($this.find('.oldPrice').text().replace('€', '').replace(',', '.')) || price;
      const quantity = parseInt($this.find('.quantity').text());

      if (quantity > 0) {
        tickets.push({ type: ticketType, price, oldPrice, quantity });
        total += price * quantity;
        totalOldPrice += oldPrice * quantity;
      }
    });

    orderData.tickets = tickets;
    orderData.totalPrice = total;
    orderData.totalDiscount = totalOldPrice - total;

    $('[id^="totalPrice"]').text('€' + total.toFixed(2).replace('.', ','));
    $('[id^="voordeel"]').text('€' + (totalOldPrice - total).toFixed(2).replace('.', ','));
  }

  // Herstel opgeslagen bestelling
  function restoreOrder() {
    const saved = localStorage.getItem("bestelling");
    if (saved) {
      try {
        const bestelling = JSON.parse(saved);
        orderData = {
          ...orderData,
          ...bestelling,
          totalPrice: parseFloat(bestelling.totaalprijs.replace("€", "").replace(",", ".")),
        };
        selectedDate = bestelling.date;
        selectedTime = bestelling.time;
        
        if (fp && selectedDate) {
          fp.setDate(selectedDate, false);
        }
        
        syncDateAndTime();
        renderTimeslots();
        updateTotal();
        updateDayButtons();

        bestelling.items.forEach(item => {
          syncQuantities(item.type, item.quantity);
        });
      } catch (e) {
        console.error("Fout bij het laden van opgeslagen bestelling:", e);
      }
    }
  }

  

  // Initialisatie
  initFlatpickr();
  setupEventHandlers();
  restoreOrder();
  syncDateAndTime();
  renderTimeslots();
  updateDayButtons();
});