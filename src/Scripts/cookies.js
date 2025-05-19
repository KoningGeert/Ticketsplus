$(document).ready(function () {
  const $cookieBanner = $('#cookie-banner');
  const $acceptCookies = $('#accept-cookies');
  const $declineCookies = $('#decline-cookies');
  const $body = $('body');

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
    console.log(`Cookie gezet: ${name} = ${value}`);
  }

  function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        console.log(`Cookie gevonden: ${cookie}`);
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return "";
  }

  function hideCookieBanner() {
    $body.removeClass('cookie-banner-active');
    setTimeout(() => {
      $cookieBanner.hide();
      console.log('Cookiebanner verborgen');
    }, 300);
  }

  function requestUserLocation() {
    if (!navigator.geolocation) {
      console.warn('Geolocatie wordt niet ondersteund door deze browser.');
      return;
    }

    console.log('Locatie wordt opgevraagd...');

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCookie('userLat', lat, 7);
        setCookie('userLng', lng, 7);
        console.log(`Locatie succesvol opgeslagen: Latitude = ${lat}, Longitude = ${lng}`);
      },
      error => {
        console.warn('Locatie ophalen mislukt:', error.message);
      }
    );
  }

  function getSavedUserLocation() {
    const lat = getCookie('userLat');
    const lng = getCookie('userLng');
    if (lat && lng) {
      console.log(`Opgeslagen locatie gevonden: ${lat}, ${lng}`);
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    console.log('Geen opgeslagen locatie gevonden.');
    return null;
  }

  // Toon cookiebanner alleen als nog geen keuze gemaakt is
  const consent = getCookie('cookieConsent');
  if (!consent) {
    console.log('Geen cookieConsent gevonden, banner tonen.');
    $body.addClass('cookie-banner-active');
    $cookieBanner.show();
  }

  // Gebruiker accepteert cookies
  $acceptCookies.on('click', function () {
    setCookie('cookieConsent', 'true', 365);
    hideCookieBanner();
    requestUserLocation();
  });

  // Gebruiker weigert cookies
  $declineCookies.on('click', function () {
    setCookie('cookieConsent', 'false', 365);
    hideCookieBanner();
    console.log('Gebruiker heeft cookies geweigerd.');
  });
});
