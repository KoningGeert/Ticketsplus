document.addEventListener('DOMContentLoaded', function() {
    // Haal de bestelling uit localStorage
    const bestellingStr = localStorage.getItem('bestelling');
    
    if (bestellingStr) {
        const bestelling = JSON.parse(bestellingStr);
        
        // Vul de ordergegevens in
        document.getElementById('activityTitle').textContent = bestelling.activityTitle;
        document.getElementById('visitDate').textContent = bestelling.date;
        document.getElementById('visitTime').textContent = bestelling.time;
        
        // Bereken totaal aantal tickets
        const totalTickets = bestelling.items.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('guestCount').textContent = totalTickets;
        
        // Vul de totaalprijs in
        document.getElementById('orderAmount').textContent = bestelling.totaalprijs;
        document.getElementById('discountAmount').textContent = bestelling.voordeel;
        
        // Genereer een ordernummer
        const orderNumber = 'LD' + new Date().getTime().toString().substr(-6);
        document.getElementById('orderNumber').textContent = orderNumber;
        
        // Vul de huidige datum in als besteldatum
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('orderDate').textContent = today.toLocaleDateString('nl-NL', options);
        
        const orderSummaryContainer = document.getElementById('orderSummaryContainer');
        if (!orderSummaryContainer) {
            console.error('Element met ID "orderSummaryContainer" niet gevonden!');
            return;
        }
        
        orderSummaryContainer.innerHTML = '<h3 class="text-gray-600 mb-3">Samenstelling van je bestelling</h3>';
        
        bestelling.items.forEach(item => {
            if (item.quantity > 0) {
                orderSummaryContainer.innerHTML += `
                    <div class="flex justify-between py-1">
                        <span class="text-gray-600">${item.quantity} × ${item.type}</span>
                        <span class="text-gray-600">${item.price}</span>
                    </div>
                `;
            }
        });
    }
});