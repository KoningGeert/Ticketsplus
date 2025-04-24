$(document).ready(function () {
  let selectedDate = null;
  let selectedTime = null;

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

  const fp = flatpickr("#datepicker", {
    dateFormat: "d-m-Y",
    minDate: "today",
    disableMobile: true,
    defaultDate: null,
    onChange: function (selectedDates, dateStr) {
      selectedDate = dateStr;
      syncDateAndTime();
      renderTimeslots();
    }
  });

  function syncDateAndTime() {
    $(".date-display-mobile, .date-display-desktop").text(selectedDate || "Kies een bezoekdatum");
    $(".time-display-mobile, .time-display-desktop").text(selectedTime || "Kies een tijdslot");

    orderData.date = selectedDate;
    orderData.time = selectedTime;

    // Extra visuele feedback als datum/tijd nog niet gekozen is
    if (!selectedDate) $(".date-display-desktop, .date-display-mobile").addClass("text-red-500");
    else $(".date-display-desktop, .date-display-mobile").removeClass("text-red-500");

    if (!selectedTime) $(".time-display-desktop, .time-display-mobile").addClass("text-red-500");
    else $(".time-display-desktop, .time-display-mobile").removeClass("text-red-500");
  }

  function renderTimeslots() {
    let html = "";
    timeOptions.forEach((time) => {
      html += `
        <li>
          <button 
            class="timeslot-btn w-full px-4 py-2 border rounded flex justify-between items-center 
                   transition disabled:bg-gray-100 disabled:text-gray-400 hover:bg-grijs hover:text-white" 
            data-time="${time}"
            aria-pressed="false">
            <span>${time}</span>
          </button>
        </li>`;
    });

    $(".timeslot-list").html(html);
    $(".timeslot-btn").prop("disabled", !selectedDate);

    // Tooltip tonen als disabled
    if (!selectedDate) {
      $(".timeslot-btn").attr("title", "Selecteer eerst een datum");
    } else {
      $(".timeslot-btn").removeAttr("title");
    }
  }

  $(document).on("click", ".timeslot-btn", function () {
    $(".timeslot-btn").removeClass("bg-blauw text-white font-semibold").attr("aria-pressed", "false");
    $(this).addClass("bg-blauw text-white font-semibold").attr("aria-pressed", "true");

    selectedTime = $(this).data("time");
    syncDateAndTime();

    $("#confirm-btn").removeClass("opacity-50 pointer-events-none");
  });

  $("#confirm-btn").on("click", function () {
    if (selectedDate && selectedTime) {
      $(this).closest(".datetime-modal").addClass("hidden").removeClass("flex");
      console.log("Datum & Tijd gekozen:", orderData);
    } else {
      alert("Kies eerst een datum en tijdslot.");
    }
  }
  );
  
  $(".open-modal, #open-date-modal-mobile, #open-date-modal-desktop").on("click", function () {
    let modalId = "#datetime-modal"; // default fallback
  
    if ($(this).is("#open-date-modal-mobile")) {
      modalId = "#datetime-modal-mobile";
    } else if ($(this).is("#open-date-modal-desktop")) {
      modalId = "#datetime-modal-desktop";
    }
  
    const modal = $(modalId);
    modal.removeClass("hidden").addClass("flex");
  
    setTimeout(() => {
      const datepickerInput = document.getElementById("datepicker");
      if (datepickerInput && datepickerInput.offsetParent !== null) {
        fp.open();
      }
    }, 300);
  });
  
  $(".close-modal").on("click", function () {
    $(this).closest(".datetime-modal").addClass("hidden").removeClass("flex");
  });
  

  // Vandaag/Morgen
  function setDateViaButton(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    fp.setDate(date, true); // true = trigger onChange
    $("#today-btn, #tomorrow-btn").removeClass("bg-blauw text-white");
    if (offsetDays === 0) $("#today-btn").addClass("bg-blauw text-white");
    else $("#tomorrow-btn").addClass("bg-blauw text-white");
  }

  $("#today-btn").on("click", function () {
    setDateViaButton(0);
  });

  $("#tomorrow-btn").on("click", function () {
    setDateViaButton(1);
  });

  function syncQuantities(type, newValue) {
    document.querySelectorAll(`.product[data-ticket-type="${type}"] .quantity`)
      .forEach(q => q.textContent = newValue);
    updateTotal();
  }

  function updateTotal() {
    let total = 0;
    let totalOldPrice = 0;
    let tickets = [];

    $('.product:visible').each(function () {
      const ticketType = $(this).data('ticket-type');
      const price = parseFloat($(this).find('.price').text().replace('€', '').replace(',', '.'));
      const oldPrice = parseFloat($(this).find('.oldPrice').text().replace('€', '').replace(',', '.')) || price;
      const quantity = parseInt($(this).find('.quantity').text());

      if (quantity > 0) {
        tickets.push({ type: ticketType, price, oldPrice, quantity });
        total += price * quantity;
        totalOldPrice += oldPrice * quantity;
      }
    });

    orderData.tickets = tickets;
    orderData.totalPrice = total;
    orderData.totalDiscount = totalOldPrice - total;

    $('#totalPrice, #totalPriceDesktop').text('€' + total.toFixed(2).replace('.', ','));
    $('#voordeel, #voordeelDesktop').text('€' + (totalOldPrice - total).toFixed(2).replace('.', ','));
  }

  document.querySelectorAll('.plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.closest('.product');
      const quantityEl = product.querySelector('.quantity');
      const type = product.dataset.ticketType;
      let quantity = parseInt(quantityEl.textContent);
      quantity++;
      syncQuantities(type, quantity);
    });
  });

  document.querySelectorAll('.minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.closest('.product');
      const quantityEl = product.querySelector('.quantity');
      const type = product.dataset.ticketType;
      let quantity = parseInt(quantityEl.textContent);
      if (quantity > 0) quantity--;
      syncQuantities(type, quantity);
    });
  });

  $(".btnOrange").click(function () {
    const totaalAantal = orderData.tickets.reduce((sum, item) => sum + item.quantity, 0);

    if (totaalAantal === 0) {
      $("#error-box").text("Selecteer minstens één ticket om door te gaan.").show();
      return;
    }

    if (!orderData.date) {
      $("#error-box").text("Selecteer een bezoekdatum.").show();
      return;
    }

    if (!orderData.time) {
      $("#error-box").text("Selecteer een tijdslot.").show();
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

  // 🧠 Bestelling herstellen als gebruiker terugkomt
  const saved = localStorage.getItem("bestelling");
  if (saved) {
    const bestelling = JSON.parse(saved);
    orderData = {
      ...orderData,
      ...bestelling,
      totalPrice: parseFloat(bestelling.totaalprijs.replace("€", "").replace(",", ".")),
    };
    selectedDate = bestelling.date;
    selectedTime = bestelling.time;
    fp.setDate(selectedDate, false);
    syncDateAndTime();
    renderTimeslots();
    updateTotal();

    bestelling.items.forEach(item => {
      syncQuantities(item.type, item.quantity);
    });
  }

  // 👀 Extra: error-box verbergen bij actie
  $("input, button").on("click", function () {
    $("#error-box").hide();
  });
});