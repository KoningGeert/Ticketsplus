$(document).ready(function() {
  // Laad het JSON-bestand
  $.getJSON('cards.json', function(data) {
    data.forEach(function(item) {
      // Clone de sjabloon
      let $card = $('#card-template').clone().removeAttr('id').removeClass('hidden');

      // Vul de kaart met gegevens
      $card.find('img').attr('src', item.image);
      $card.find('.rating').text(item.rating);
      $card.find('.reviews').text(item.reviews + ' reviews');
      $card.find('.headline').text(item.headline);
      $card.find('.location').text(item.location);

      // Voeg de kaart toe aan de DOM
      $('#cards-container').append($card);
    });
  });
});