'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookingPage() {
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [allBookedSeats, setAllBookedSeats] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAllBookedSeats = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view booked seats.');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/bookings/allseats', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setAllBookedSeats(response.data.bookedSeats);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching booked seats:', err.response?.data || err.message);
    
      if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.response?.status === 403) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 401) {
        setError('Please login to view booked seats.');
      } else {
        setError('Failed to load booked seats. Please try again.');
      }
      setAllBookedSeats([]);
    }
    
  };

  useEffect(() => {
    fetchAllBookedSeats();
  }, []);

  const handleBooking = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to book seats.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/bookings/book', {
        numberOfSeats: numberOfTickets
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 15000
      });
      
      if (response.data.success) {
        const newBookedSeats = response.data.booking.bookedSeats.map(bs => ({
          id: bs.seat.id,
          row: bs.seat.row,
          number: bs.seat.number
        }));
        setBookedSeats(newBookedSeats);
        setAllBookedSeats(prev => [...prev, ...newBookedSeats]);
        setSuccessMessage(`Successfully booked ${numberOfTickets} seat(s)!`);
        await fetchAllBookedSeats(); // Refresh all booked seats
      }
    } catch (err) {
      console.error('Booking error:', err);
      
      if (err.response?.status === 400) {
        if (err.response.data?.code === 'P2028') {
          setError('The booking system is currently busy. Please try again in a moment.');
        } else {
          setError(err.response.data?.message || 'Failed to book seats. Please try again.');
        }
      } else if (err.response?.status === 401) {
        setError('Please login again to book seats.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setBookedSeats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setNumberOfTickets(1);
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const validValue = Math.max(1, Math.min(7, numValue));
      setNumberOfTickets(validValue);
    }
  };

  const renderSeats = () => {
    const rows = 11;
    const seatsPerRow = 7;
    const seats = [];

    for (let row = 1; row <= rows; row++) {
      const currentRowSeats = row === 11 ? 3 : seatsPerRow;
      const rowSeats = [];

      for (let seatNum = 1; seatNum <= currentRowSeats; seatNum++) {
        const isNewlyBooked = bookedSeats.some(
          seat => seat.row === row && seat.number === seatNum
        );
        const isPreviouslyBooked = allBookedSeats.some(
          seat => seat.row === row && seat.number === seatNum
        );

        rowSeats.push(
          <div
            key={`${row}-${seatNum}`}
            className={`aspect-square border border-gray-300 flex items-center justify-center transition-colors
              ${isNewlyBooked 
                ? 'bg-green-500 text-white border-green-600' 
                : isPreviouslyBooked 
                  ? 'bg-gray-500 text-white border-gray-600 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
          >
            {`${row}-${seatNum}`}
          </div>
        );
      }

      seats.push(
        <div key={`row-${row}`} className="flex gap-2">
          <span className="w-8 flex items-center justify-center text-gray-500">
            R{row}
          </span>
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Book Your Tickets</h1>
      
      <div className="mb-8">
        <div className="mb-4">
          <label htmlFor="tickets" className="block mb-2">
            Number of Tickets (1-7):
          </label>
          <input
            type="number"
            id="tickets"
            min="1"
            max="7"
            value={numberOfTickets}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <button 
          onClick={handleBooking}
          disabled={isLoading || numberOfTickets < 1 || numberOfTickets > 7}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Booking...' : 'Book Seats'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Newly Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>Previously Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Seating Layout</h2>
        <div className="flex flex-col gap-2">
          {renderSeats()}
        </div>
      </div>
    </div>
  );
}