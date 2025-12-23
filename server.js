const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize data directory and file
async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(RESERVATIONS_FILE);
    } catch {
      await fs.writeFile(RESERVATIONS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Helper functions for data management
async function getReservations() {
  try {
    const data = await fs.readFile(RESERVATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reservations:', error);
    return [];
  }
}

async function saveReservations(reservations) {
  try {
    await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving reservations:', error);
    return false;
  }
}

// API Routes

// Get all reservations
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await getReservations();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Get a specific reservation by ID
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const reservations = await getReservations();
    const reservation = reservations.find(r => r.id === req.params.id);
    if (reservation) {
      res.json(reservation);
    } else {
      res.status(404).json({ error: 'Reservation not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// Create a new reservation
app.post('/api/reservations', async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, nuggetPreference, specialRequests } = req.body;

    // Validation
    if (!name || !email || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reservations = await getReservations();

    // Create new reservation
    const newReservation = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      date,
      time,
      guests: parseInt(guests),
      nuggetPreference: nuggetPreference || 'classic',
      specialRequests: specialRequests || '',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    reservations.push(newReservation);
    const saved = await saveReservations(reservations);

    if (saved) {
      res.status(201).json(newReservation);
    } else {
      res.status(500).json({ error: 'Failed to save reservation' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Update a reservation
app.put('/api/reservations/:id', async (req, res) => {
  try {
    const reservations = await getReservations();
    const index = reservations.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const updatedReservation = {
      ...reservations[index],
      ...req.body,
      id: req.params.id, // Prevent ID from being changed
      updatedAt: new Date().toISOString()
    };

    reservations[index] = updatedReservation;
    const saved = await saveReservations(reservations);

    if (saved) {
      res.json(updatedReservation);
    } else {
      res.status(500).json({ error: 'Failed to update reservation' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// Delete a reservation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const reservations = await getReservations();
    const filteredReservations = reservations.filter(r => r.id !== req.params.id);

    if (filteredReservations.length === reservations.length) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const saved = await saveReservations(filteredReservations);

    if (saved) {
      res.json({ message: 'Reservation cancelled successfully' });
    } else {
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Check availability for a specific date and time
app.post('/api/reservations/check-availability', async (req, res) => {
  try {
    const { date, time } = req.body;
    const reservations = await getReservations();

    const existingReservations = reservations.filter(r =>
      r.date === date && r.time === time && r.status === 'confirmed'
    );

    const totalGuests = existingReservations.reduce((sum, r) => sum + r.guests, 0);
    const maxCapacity = 50; // Restaurant capacity
    const available = totalGuests < maxCapacity;

    res.json({
      available,
      remainingCapacity: maxCapacity - totalGuests,
      currentBookings: existingReservations.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Start server
async function startServer() {
  await initializeData();
  app.listen(PORT, () => {
    console.log(`🍗 Chicken Nugget Booking System running on port ${PORT}`);
    console.log(`📍 Visit http://localhost:${PORT} to make a reservation`);
  });
}

startServer();
