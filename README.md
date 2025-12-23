# The Dreamland Of Chicken Nuggets - Reservation Booking System

A complete web-based reservation booking system for a chicken nugget restaurant. This application allows customers to book tables, select their favorite nugget varieties, and manage their reservations.

## Features

- **Make Reservations**: Book a table with date, time, party size, and nugget preferences
- **Real-time Availability**: Check if your desired time slot is available
- **View Reservations**: Browse all existing reservations
- **Cancel Reservations**: Cancel bookings when plans change
- **Search Functionality**: Search reservations by name, email, or phone
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Multiple Nugget Options**: Choose from Classic Crispy, Spicy Supreme, Honey Glazed, BBQ Bliss, or Vegan Delight

## Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Storage**: JSON file-based storage
- **API**: RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd The-Dreamland-Of-Chicken-Nuggets
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. You should see the reservation booking interface!

## API Endpoints

### Get All Reservations
```
GET /api/reservations
```

### Get Single Reservation
```
GET /api/reservations/:id
```

### Create Reservation
```
POST /api/reservations
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-0123",
  "date": "2024-12-25",
  "time": "18:00",
  "guests": 4,
  "nuggetPreference": "spicy",
  "specialRequests": "Window seat please"
}
```

### Update Reservation
```
PUT /api/reservations/:id
Content-Type: application/json

{
  "guests": 6,
  "specialRequests": "Birthday celebration"
}
```

### Delete Reservation
```
DELETE /api/reservations/:id
```

### Check Availability
```
POST /api/reservations/check-availability
Content-Type: application/json

{
  "date": "2024-12-25",
  "time": "18:00"
}
```

## Project Structure

```
The-Dreamland-Of-Chicken-Nuggets/
├── public/
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
├── data/
│   └── reservations.json  # Reservation data storage
├── server.js           # Express.js server
├── package.json        # Project dependencies
└── README.md          # This file
```

## Features Explained

### Booking a Reservation

1. Navigate to the "Make a Reservation" tab
2. Fill in your details:
   - Full name
   - Email address
   - Phone number
   - Preferred date and time
   - Number of guests (1-20)
   - Nugget preference
   - Any special requests
3. Click "Book Reservation"
4. Receive instant confirmation with a booking ID

### Viewing Reservations

1. Switch to the "View Reservations" tab
2. Browse all reservations sorted by date
3. Use the search bar to find specific reservations
4. See details including:
   - Guest information
   - Date and time
   - Party size
   - Nugget preferences
   - Special requests
   - Booking status

### Cancelling Reservations

1. Go to "View Reservations"
2. Find your reservation
3. Click "Cancel Reservation"
4. Confirm the cancellation

## Configuration

### Restaurant Capacity

The default capacity is set to 50 guests per time slot. To modify this, edit the `maxCapacity` variable in `server.js`:

```javascript
const maxCapacity = 50; // Change this value
```

### Server Port

The default port is 3000. To change it, set the PORT environment variable:

```bash
PORT=8080 npm start
```

## Data Storage

Reservations are stored in `data/reservations.json`. This file is automatically created when you first run the server. Each reservation includes:

- Unique ID
- Guest details (name, email, phone)
- Reservation details (date, time, guests)
- Nugget preferences
- Special requests
- Status (confirmed/cancelled)
- Timestamps (created/updated)

## Future Enhancements

Potential improvements for the system:

- Database integration (PostgreSQL/MongoDB)
- Email confirmation system
- SMS notifications
- User authentication
- Admin dashboard
- Table management
- Online payment integration
- Review and rating system
- Loyalty program
- Multi-language support

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, either:
- Stop the other application using that port
- Change the port using the PORT environment variable

### Cannot Create Reservations
- Check that the server is running
- Verify that the `data` directory has write permissions
- Check browser console for errors

### Reservations Not Displaying
- Ensure the server is running
- Check network tab in browser developer tools
- Verify `data/reservations.json` exists and is valid JSON

## License

MIT License - feel free to use this project for your own restaurant!

## Support

For issues or questions, please open an issue on the GitHub repository.

---

Enjoy managing your chicken nugget reservations! 🍗
