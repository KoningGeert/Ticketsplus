$(document).ready(function () {
    const $passwordForm = $('#passwordForm');
    const $passwordInput = $('#password');
    const $errorDiv = $('#passwordError');
  
    const CORRECT_PASSWORD = 'landal2025'; // <-- Pas dit aan naar jouw geheime wachtwoord
    const COOKIE_NAME = 'ticketAccess';
  
    function setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
    }
  
    function getCookie(name) {
      const cookieName = name + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
          return cookie.substring(cookieName.length, cookie.length);
        }
      }
      return "";
    }
  
    // Als gebruiker al toegang heeft (cookie bestaat én klopt), dan automatisch doorsturen
    const existingAccess = getCookie(COOKIE_NAME);
    if (existingAccess === CORRECT_PASSWORD) {
      window.location.href = '/src/pages/portal.html'; // <-- Pas aan als je andere URL gebruikt
    }
  
    $passwordForm.on('submit', function (e) {
      e.preventDefault();
      const inputPassword = $passwordInput.val().trim();
  
      if (inputPassword === CORRECT_PASSWORD) {
        setCookie(COOKIE_NAME, inputPassword, 7); // 7 dagen geldig
        window.location.href = '/src/pages/portal.html'; // <-- Pas aan als je andere URL gebruikt
      } else {
        $errorDiv.removeClass('hidden');
      }
    });

    $('#togglePassword').on('click', function () {
        const $passwordInput = $('#password');
        const type = $passwordInput.attr('type') === 'password' ? 'text' : 'password';
        $passwordInput.attr('type', type);
      
        // Toggle het icoon
        $(this).find('i').toggleClass('fa-eye fa-eye-slash');
      });
      
  });
  