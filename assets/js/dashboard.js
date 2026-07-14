/**
 * dashboard.js
 * Admin CRM features: Search, Filter, Stats Calculation, CSV Export, and Status Management.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Check if on Admin Page
    const tableBody = document.getElementById('adminTableBody');
    if (!tableBody) return;

    const searchInput = document.getElementById('searchBooking');
    const statusFilter = document.getElementById('statusFilter');
    const btnExportCsv = document.getElementById('btnExportCsv');
    const emptyState = document.getElementById('emptyState');

    let allBookings = Storage.getAllBookings();

    // --- 1. RENDER DASHBOARD STATS ---
    const renderStats = (data) => {
        const today = new Date().toISOString().split('T')[0];
        
        const total = data.length;
        const guestsToday = data
            .filter(b => b.date === today && b.status !== 'Cancelled')
            .reduce((sum, b) => sum + parseInt(b.guests || 0), 0);
        
        const completed = data.filter(b => b.status === 'Completed').length;
        const cancelled = data.filter(b => b.status === 'Cancelled').length;

        document.getElementById('statTotalBookings').textContent = total;
        document.getElementById('statTodayGuests').textContent = guestsToday;
        document.getElementById('statCompleted').textContent = completed;
        document.getElementById('statCancelled').textContent = cancelled;
    };

    // --- 2. RENDER TABLE ROWS ---
    const renderTable = (data) => {
        tableBody.innerHTML = '';

        if (data.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Reverse to show latest first
        [...data].reverse().forEach(booking => {
            const badgeClass = booking.status.toLowerCase(); // confirmed, pending, completed, cancelled
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${booking.id}</strong></td>
                <td class="customer-cell">
                    <span>${booking.name}</span>
                    <small>${booking.phone} | ${booking.email}</small>
                </td>
                <td>
                    ${Utils.formatDate(booking.date)}<br>
                    <small class="text-muted">${Utils.formatTime(booking.time)}</small>
                </td>
                <td>${booking.guests}</td>
                <td>${booking.occasion || 'Casual'}</td>
                <td><span class="badge ${badgeClass}">${booking.status}</span></td>
                <td>
                    <select class="action-select" data-id="${booking.id}">
                        <option value="" disabled selected>Update...</option>
                        <option value="Confirmed">Confirm</option>
                        <option value="Completed">Complete</option>
                        <option value="Cancelled">Cancel</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        attachActionListeners();
    };

    // --- 3. HANDLE STATUS UPDATES ---
    const attachActionListeners = () => {
        const selects = document.querySelectorAll('.action-select');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                const bookingId = e.target.getAttribute('data-id');
                const newStatus = e.target.value;

                // Update array
                const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
                if (bookingIndex !== -1) {
                    allBookings[bookingIndex].status = newStatus;
                    localStorage.setItem('goldenLeafBookings', JSON.stringify(allBookings));
                    
                    // Re-render
                    filterTable();
                }
            });
        });
    };

    // --- 4. SEARCH & FILTER LOGIC ---
    const filterTable = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filterStatus = statusFilter.value;

        const filteredData = allBookings.filter(b => {
            const matchesSearch = b.name.toLowerCase().includes(searchTerm) || 
                                  b.phone.includes(searchTerm) || 
                                  b.id.toLowerCase().includes(searchTerm);
            
            const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        });

        renderTable(filteredData);
        renderStats(filteredData); // Update stats based on current view
    };

    searchInput.addEventListener('input', filterTable);
    statusFilter.addEventListener('change', filterTable);

    // --- 5. EXPORT CSV FEATURE (Portfolio Killer Feature) ---
    btnExportCsv.addEventListener('click', () => {
        if (allBookings.length === 0) {
            alert("No data to export!");
            return;
        }

        // Setup Headers
        const headers = ['Booking ID', 'Name', 'Phone', 'Email', 'Date', 'Time', 'Guests', 'Occasion', 'Status', 'Special Requests'];
        
        // Map data to CSV rows
        const csvRows = [
            headers.join(','), // Header row
            ...allBookings.map(b => [
                b.id,
                `"${b.name}"`, // quotes to prevent comma issues
                b.phone,
                b.email,
                b.date,
                b.time,
                b.guests,
                b.occasion,
                b.status,
                `"${b.requests || ''}"`
            ].join(','))
        ];

        // Create Blob and Download Link
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `GoldenLeaf_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // --- INIT APP ---
    renderTable(allBookings);
    renderStats(allBookings);
});