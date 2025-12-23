const API_URL = '/api/reservations';

// DOM Elements
const bookingForm = document.getElementById('booking-form');
const reservationsList = document.getElementById('reservations-list');
const searchInput = document.getElementById('search-input');
const successModal = document.getElementById('success-modal');
const confirmationDetails = document.getElementById('confirmation-details');
const availabilityMessage = document.getElementById('availability-message');

// State
let allReservations = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeForm();
    loadReservations();
    setMinDate();
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Reload reservations when switching to view tab
    if (tabName === 'view') {
        loadReservations();
    }
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
}

// Form initialization
function initializeForm() {
    bookingForm.addEventListener('submit', handleBookingSubmit);

    // Check availability when date/time changes
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');

    dateInput.addEventListener('change', checkAvailability);
    timeInput.addEventListener('change', checkAvailability);
}

// Check availability
async function checkAvailability() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (!date || !time) return;

    try {
        const response = await fetch(`${API_URL}/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, time })
        });

        const data = await response.json();

        if (data.available) {
            showAvailabilityMessage(
                `Available! ${data.remainingCapacity} spots remaining.`,
                'success'
            );
        } else {
            showAvailabilityMessage(
                'Sorry, this time slot is fully booked. Please choose another time.',
                'error'
            );
        }
    } catch (error) {
        console.error('Error checking availability:', error);
    }
}

function showAvailabilityMessage(message, type) {
    availabilityMessage.textContent = message;
    availabilityMessage.className = type === 'success' ? 'success-message' : 'error-message';
    availabilityMessage.classList.remove('hidden');
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        guests: document.getElementById('guests').value,
        nuggetPreference: document.getElementById('nuggetPreference').value,
        specialRequests: document.getElementById('specialRequests').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const reservation = await response.json();
            showConfirmation(reservation);
            bookingForm.reset();
            availabilityMessage.classList.add('hidden');
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error creating reservation:', error);
        alert('Failed to create reservation. Please try again.');
    }
}

// Show confirmation modal
function showConfirmation(reservation) {
    const formattedDate = new Date(reservation.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    confirmationDetails.innerHTML = `
        <p><strong>Name:</strong> ${reservation.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${reservation.time}</p>
        <p><strong>Guests:</strong> ${reservation.guests}</p>
        <p><strong>Nugget Preference:</strong> ${formatNuggetPreference(reservation.nuggetPreference)}</p>
        <p><strong>Confirmation ID:</strong> ${reservation.id}</p>
        <p style="margin-top: 15px; color: #666;">
            A confirmation email has been sent to ${reservation.email}
        </p>
    `;

    successModal.classList.remove('hidden');
}

function closeModal() {
    successModal.classList.add('hidden');
}

// Load and display reservations
async function loadReservations() {
    try {
        const response = await fetch(API_URL);
        allReservations = await response.json();
        displayReservations(allReservations);
    } catch (error) {
        console.error('Error loading reservations:', error);
        reservationsList.innerHTML = '<p class="error-message">Failed to load reservations</p>';
    }
}

function displayReservations(reservations) {
    if (reservations.length === 0) {
        reservationsList.innerHTML = '<p class="loading">No reservations found</p>';
        return;
    }

    // Sort by date and time
    const sorted = [...reservations].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB - dateA;
    });

    reservationsList.innerHTML = sorted.map(reservation => createReservationCard(reservation)).join('');

    // Add event listeners to action buttons
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => cancelReservation(btn.dataset.id));
    });
}

function createReservationCard(reservation) {
    const formattedDate = new Date(reservation.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const isPast = new Date(reservation.date + 'T' + reservation.time) < new Date();
    const statusClass = reservation.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';

    return `
        <div class="reservation-card">
            <div class="reservation-header">
                <h3>${reservation.name}</h3>
                <span class="status-badge ${statusClass}">${reservation.status}</span>
            </div>
            <div class="reservation-details">
                <div class="detail-item">
                    <strong>Date:</strong> ${formattedDate}
                </div>
                <div class="detail-item">
                    <strong>Time:</strong> ${reservation.time}
                </div>
                <div class="detail-item">
                    <strong>Guests:</strong> ${reservation.guests}
                </div>
                <div class="detail-item">
                    <strong>Nuggets:</strong> ${formatNuggetPreference(reservation.nuggetPreference)}
                </div>
                <div class="detail-item">
                    <strong>Email:</strong> ${reservation.email}
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong> ${reservation.phone}
                </div>
            </div>
            ${reservation.specialRequests ? `
                <div class="detail-item" style="margin-bottom: 10px;">
                    <strong>Special Requests:</strong> ${reservation.specialRequests}
                </div>
            ` : ''}
            <div class="detail-item" style="font-size: 0.85em; color: #999;">
                <strong>Booking ID:</strong> ${reservation.id}
            </div>
            ${!isPast && reservation.status === 'confirmed' ? `
                <div class="reservation-actions">
                    <button class="btn btn-danger cancel-btn" data-id="${reservation.id}">
                        Cancel Reservation
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function formatNuggetPreference(pref) {
    const preferences = {
        'classic': 'Classic Crispy',
        'spicy': 'Spicy Supreme',
        'honey': 'Honey Glazed',
        'bbq': 'BBQ Bliss',
        'vegan': 'Vegan Delight'
    };
    return preferences[pref] || pref;
}

// Cancel reservation
async function cancelReservation(id) {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Reservation cancelled successfully');
            loadReservations();
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('Failed to cancel reservation. Please try again.');
    }
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allReservations.filter(reservation =>
        reservation.name.toLowerCase().includes(searchTerm) ||
        reservation.email.toLowerCase().includes(searchTerm) ||
        reservation.phone.toLowerCase().includes(searchTerm)
    );
    displayReservations(filtered);
});

// Close modal when clicking outside
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeModal();
    }
});
