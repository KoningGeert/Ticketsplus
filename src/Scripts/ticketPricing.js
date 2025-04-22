$(document).ready(function () {
    let selectedDate = null;
    let selectedTime = null;
  
    let orderData = {
      date: null,
      time: null,
      tickets: [],
      totalPrice: 0,
      totalDiscount: 0
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
        $(".date-display").text(dateStr);
        orderData.date = dateStr;
        renderTimeslots();
      }
    });
  
    setTimeout(() => fp.close(), 50);
  
    $("#today-btn").on("click", function () {
      const today = flatpickr.formatDate(new Date(), "d-m-Y");
      fp.setDate(today, true);
      $("#today-btn, #tomorrow-btn").removeClass("bg-blauw text-white");
      $(this).addClass("bg-blauw text-white");
    });
  
    $("#tomorrow-btn").on("click", function () {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatted = flatpickr.formatDate(tomorrow, "d-m-Y");
      fp.setDate(formatted, true);
      $("#today-btn, #tomorrow-btn").removeClass("bg-blauw text-white");
      $(this).addClass("bg-blauw text-white");
    });
  
    function renderTimeslots() {
      let html = "";
      timeOptions.forEach((time) => {
        html += `
          <li>
            <button 
              class="timeslot-btn w-full px-4 py-2 border rounded flex justify-between items-center 
                     transition disabled:bg-gray-100 disabled:text-gray-400 hover:bg-grijs hover:text-white" 
              data-time="${time}">
              <span>${time}</span>
            </button>
          </li>`;
      });
  
      $(".timeslot-list").html(html);
      $(".timeslot-btn").prop("disabled", !selectedDate);
    }
  
    $(document).on("click", ".timeslot-btn", function () {
      $(".timeslot-btn").removeClass("bg-blauw text-white font-semibold");
      $(this).addClass("bg-blauw text-white font-semibold");
  
      selectedTime = $(this).data("time");
      $(".time-display").text(selectedTime);
      orderData.time = selectedTime;
  
      $("#confirm-btn").removeClass("opacity-50 pointer-events-none");
    });
  
    $("#confirm-btn").on("click", function () {
      if (selectedDate && selectedTime) {
        $("#datetime-modal").addClass("hidden").removeClass("flex");
        console.log("Datum & Tijd gekozen:", orderData);
      }
    });
  
    $(".open-modal").on("click", function () {
      $("#datetime-modal").removeClass("hidden").addClass("flex");
      setTimeout(() => {
        fp.open();
      }, 100);
    });
  
    $(".close-modal").on("click", function () {
      $("#datetime-modal").addClass("hidden").removeClass("flex");
    });
  
    function updateTotal() {
      let total = 0;
      let totalOldPrice = 0;
      let tickets = [];
  
      $('.product').each(function () {
        const ticketType = $(this).data('ticket-type');
        const price = parseFloat($(this).find('.price').text().replace('€', '').replace(',', '.'));
        const oldPrice = parseFloat($(this).find('.oldPrice').text().replace('€', '').replace(',', '.'));
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
  
      $('#totalPrice').text('€' + total.toFixed(2).replace('.', ','));
      $('#voordeel').text('€' + (totalOldPrice - total).toFixed(2).replace('.', ','));
  
      console.log("Orderdata bijgewerkt:", orderData);
    }
  
    $('.plus').click(function () {
      let quantityElement = $(this).siblings('.quantity');
      let quantity = parseInt(quantityElement.text());
      quantityElement.text(quantity + 1);
      updateTotal();
    });
  
    $('.minus').click(function () {
      let quantityElement = $(this).siblings('.quantity');
      let quantity = parseInt(quantityElement.text());
      if (quantity > 0) {
        quantityElement.text(quantity - 1);
        updateTotal();
      }
    });
  
    $(".btnOrange").click(function () {
      const totaalAantal = orderData.tickets.reduce((sum, item) => sum + item.quantity, 0);
  
      if (totaalAantal === 0) {
        alert("Selecteer minstens één ticket om door te gaan.");
        return;
      }
  
      if (!orderData.date) {
        alert("Selecteer een bezoekdatum.");
        return;
      }
  
      if (!orderData.time) {
        alert("Selecteer een tijdslot.");
        return;
      }
  
      const bestelling = {
        items: orderData.tickets,
        date: orderData.date,
        time: orderData.time,
        totaalprijs: "€" + orderData.totalPrice.toFixed(2).replace(".", ","),
      };
  
      localStorage.setItem("bestelling", JSON.stringify(bestelling
        ));     
    }
    );
  }
);  