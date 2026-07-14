/**
 * booking.js
 * Handles the reservation form, validation, and success modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('premiumBookingForm');
    const successModal = document.getElementById('successModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnDownloadReceipt = document.getElementById('btnDownloadReceipt');
    const dateInput = document.getElementById('bookingDate');

    // Prevent past dates
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Gather special requests
            const specialReqs = [];
            document.querySelectorAll('.special-req:checked').forEach(checkbox => {
                specialReqs.push(checkbox.value);
            });

            // Create Data Object
            const bookingData = {
                id: Utils.generateBookingID(),
                name: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                occasion: document.getElementById('occasion').value,
                date: document.getElementById('bookingDate').value,
                time: document.getElementById('bookingTime').value,
                guests: document.getElementById('guests').value,
                requests: specialReqs.join(', ') || 'None',
                status: 'Confirmed',
                createdAt: new Date().toISOString()
            };

            // Save to Storage
            Storage.saveBooking(bookingData);

            // Populate Modal
            document.getElementById('receiptEmail').textContent = bookingData.email;
            document.getElementById('receiptId').textContent = bookingData.id;
            document.getElementById('receiptDateTime').textContent = `${Utils.formatDate(bookingData.date)} at ${Utils.formatTime(bookingData.time)}`;
            document.getElementById('receiptGuests').textContent = bookingData.guests;
            document.getElementById('receiptOccasion').textContent = bookingData.occasion;

            // Show Modal
            successModal.classList.remove('hidden');
            bookingForm.reset();
            
            // Trigger global event for App.js to update Live Stats
            window.dispatchEvent(new Event('bookingUpdated'));
        });
    }

    // Close Modal
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            successModal.classList.add('hidden');
        });
    }

    // Download Receipt logic using html2pdf
    if (btnDownloadReceipt) {
        btnDownloadReceipt.addEventListener('click', () => {
            const element = document.querySelector('.modal-content');
            
            // Temporarily hide buttons for the PDF
            document.querySelector('.modal-actions').style.display = 'none';
            
            html2pdf().from(element).save('GoldenLeaf_Reservation.pdf').then(() => {
                // Restore buttons
                document.querySelector('.modal-actions').style.display = 'flex';
            });
        });
    }
});