/**
 * utils.js
 * Contains global helper functions for formatting and generation.
 */

const Utils = {
    // Generate a premium looking Booking ID (e.g., RES-8492)
    generateBookingID: () => {
        return 'RES-' + Math.floor(1000 + Math.random() * 9000);
    },

    // Format Date to readable string (e.g., Oct 24, 2026)
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // Convert 24h time to 12h AM/PM format
    formatTime: (time24) => {
        const [hour, minute] = time24.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minute} ${ampm}`;
    }
};