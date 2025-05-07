$(document).ready(function() {
    // Formulier submit handler
    $('#contactForm').on('submit', function(e) {
        e.preventDefault(); // Voorkom standaard formulier verzending
        
        // Reset error states
        $('.error').remove();
        $('input, checkbox').removeClass('border-red-500');
        
        let isValid = true;
        
        // Valideer alle verplichte velden
        $('#contactForm input[required], #contactForm checkbox[required]').each(function() {
            if ($(this).is(':checkbox') && !$(this).is(':checked')) {
                isValid = false;
                $(this).addClass('border-red-500');
                $(this).after('<span class="error text-red-500 text-sm block mt-1">Dit veld is verplicht</span>');
            } 
            else if ($(this).val() === '') {
                isValid = false;
                $(this).addClass('border-red-500');
                $(this).after('<span class="error text-red-500 text-sm block mt-1">Dit veld is verplicht</span>');
            }
        });
        
        // Specifieke email validatie
        const email = $('#email').val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            isValid = false;
            $('#email').addClass('border-red-500');
            $('#email').after('<span class="error text-red-500 text-sm block mt-1">Voer een geldig e-mailadres in</span>');
        }
        
        // Als alles valid is, stuur door naar bevestigingspagina
        if (isValid) {
            // Hier kun je eventueel eerst de formulierdata versturen naar een server
            // Bijvoorbeeld met AJAX:
            /*
            $.ajax({
                url: '/submit-form',
                method: 'POST',
                data: $(this).serialize(),
                success: function(response) {
                    window.location.href = './confirmationPage.html';
                },
                error: function() {
                    alert('Er is een fout opgetreden bij het verzenden.');
                }
            });
            */
            
            // Voor nu direct doorsturen:
            window.location.href = './confirmationPage.html';
        }
    });
    
    // Verwijder error bij focus op veld
    $('input, checkbox').on('focus', function() {
        $(this).removeClass('border-red-500');
        $(this).next('.error').remove();
    });
});