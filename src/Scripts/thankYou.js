$(document).ready(function() {
    // Haal bestelling op uit localStorage
    const bestelling = JSON.parse(localStorage.getItem('bestelling'));
    
    // Vul de ordergegevens in
    if (bestelling) {
        // Vul activiteitstitel in (indien beschikbaar)
     // Vul activiteitstitel in bij locatie (indien beschikbaar)
if (bestelling.activityTitle) {
    $('#activityTitle').text(bestelling.activityTitle);
}
        
        // Order details
        $('#orderNumber').text(`LD${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
        $('#orderDate').text(new Date().toLocaleDateString('nl-NL', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }));
        $('#orderAmount').text(bestelling.totaalprijs || '€0,00');
        
        // Bezoekdetails
        if (bestelling.date) {
            $('#visitDate').text(formatDutchDate(bestelling.date));
        }
        if (bestelling.time) {
            $('#visitTime').text(`${bestelling.time} uur`);
        }
        
        // Bereken totaal aantal personen
        if (bestelling.items) {
            const totalGuests = bestelling.items.reduce((sum, item) => sum + item.quantity, 0);
            $('#guestCount').text(totalGuests);
        }
        
        // Toon voordeel (indien beschikbaar)
        if (bestelling.voordeel && bestelling.voordeel !== '€0,00') {
            $('.flex-1:first-child .space-y-4').append(`
                <div class="flex justify-between border-b border-gray-100 pb-3">
                    <span class="text-gray-600">Uw voordeel:</span>
                    <span class="font-medium text-green-600">${bestelling.voordeel}</span>
                </div>
            `);
        }
    } else {
        // Fallback voor als localStorage leeg is
        console.log('Geen bestelgegevens gevonden in localStorage');
        $('#orderNumber').text('LD2023-' + Math.floor(100000 + Math.random() * 900000));
        $('#orderDate').text(new Date().toLocaleDateString('nl-NL'));
    }
    
    // Helper functie voor datumformattering
    function formatDutchDate(dateString) {
        if (!dateString) return '';
        
        // Voor dd-mm-yyyy format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const months = [
                'januari', 'februari', 'maart', 'april', 'mei', 'juni',
                'juli', 'augustus', 'september', 'oktober', 'november', 'december'
            ];
            return `${parts[0]} ${months[parseInt(parts[1]) - 1]} ${parts[2]}`;
        }
        return dateString;
    }
    
    // API integratie voorbeeld (voor toekomstig gebruik)
    function loadActivityDetailsFromAPI() {
        /*
        // Voorbeeld API call:
        $.getJSON('/api/activity-details', { orderId: '12345' })
            .done(function(data) {
                $('#activity-title').text(data.title);
                // Update andere velden met API data
            })
            .fail(function() {
                console.log('Kon activiteitsdetails niet laden');
            });
        */
    }
    
    // Voor nu gebruiken we localStorage, later kun je dit vervangen door:
    // loadActivityDetailsFromAPI();
});