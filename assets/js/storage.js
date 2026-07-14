/**
 * storage.js
 * Handles all LocalStorage interactions acting as our mock database.
 */

const STORAGE_KEY = 'goldenLeafBookings';

const Storage = {
    // Get all bookings
    getAllBookings: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    },

    // Save a new booking
    saveBooking: (bookingData) => {
        const bookings = Storage.getAllBookings();
        bookings.push(bookingData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    },

    // Update Live Table Availability Stats
    getLiveStats: () => {
        const totalTables = 20;
        const totalVIP = 3;
        
        const bookings = Storage.getAllBookings();
        // Just counting today's mock bookings for portfolio demonstration
        const today = new Date().toISOString().split('T')[0];
        const todaysBookings = bookings.filter(b => b.date === today);
        
        const bookedCount = todaysBookings.length;
        // Ensure we don't go below 0
        const availableTables = Math.max(totalTables - bookedCount, 0); 
        const availableVIP = Math.max(totalVIP - Math.floor(bookedCount / 5), 0);

        return {
            booked: bookedCount,
            available: availableTables,
            vip: availableVIP
        };
    }
};