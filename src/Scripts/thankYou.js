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
        
        // Genereer een ordernummer (voorbeeld)
        const orderNumber = 'LD' + new Date().getTime().toString().substr(-6);
        document.getElementById('orderNumber').textContent = orderNumber;
        
        // Vul de huidige datum in als besteldatum
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('orderDate').textContent = today.toLocaleDateString('nl-NL', options);
        
        const orderSummarySection = document.getElementById('orderSummary');
        orderSummarySection.innerHTML = ''; // voorkom dubbele weergave
        
        const orderItemsContainer = document.createElement('div');
        orderItemsContainer.className = 'mt-6 border-t border-gray-200 pt-4';
        orderItemsContainer.innerHTML = '<h3 class="font-medium text-gray-600 mb-3">Samenstelling van je bestelling</h3>';
        
        const itemsList = document.createElement('ul');
        itemsList.className = 'space-y-2';
        
        bestelling.items.forEach(item => {
            if (item.quantity > 0) {
                const listItem = document.createElement('li');
                listItem.className = 'flex justify-between';
                listItem.innerHTML = `
                    <span class="text-gray-600">${item.quantity} × ${item.type}</span>
                    <span class="text-gray-600">${item.price}</span>
                `;
                itemsList.appendChild(listItem);
            }
        });
        
        orderItemsContainer.appendChild(itemsList);
        orderSummarySection.appendChild(orderItemsContainer);
        
        
    }
});