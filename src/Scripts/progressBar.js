$(document).ready(function () {
    let progress = 0;
    const interval = setInterval(function () {
      progress += 1;
      $('#loadingBar').css('width', progress + '%');
  
      if (progress >= 100) {
        clearInterval(interval);
  
        // Verwijder/fade-out laadbalk-container
        $('#loadingBarContainer').fadeOut(500, function () {
          $(this).remove(); // verwijder uit DOM na fade
        });
  
        // Toon downloadknop
        $('#downloadSection').fadeIn(500);
      }
    }, 25); // 25ms * 100 = 2.5 seconden
  });
  