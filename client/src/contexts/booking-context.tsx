import { createContext, useState, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Ticket {
  type: string;
  price: number;
  count: number;
}

interface SelectedSeat {
  seatNumber: string;
  ticketType: string;
  price: number;
}

interface Showtime {
  id: number;
  movieId: number;
  screenId: number;
  startTime: string;
  endTime: string;
  price: number;
  screen?: {
    id: number;
    cinemaId: number;
    name: string;
  };
  cinema?: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
}

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  duration: number;
  rating: string;
}

interface BookingContextType {
  movie: Movie | null;
  setMovie: (movie: Movie) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedShowtime: Showtime | null;
  setSelectedShowtime: (showtime: Showtime) => void;
  tickets: Ticket[];
  updateTicketCount: (type: string, count: number) => void;
  selectedSeats: SelectedSeat[];
  toggleSeatSelection: (seatNumber: string) => void;
  getTotalPrice: () => number;
  resetBooking: () => void;
  confirmBooking: () => Promise<number | null>;
}

const defaultTickets: Ticket[] = [
  { type: 'Adult', price: 1499, count: 0 },     // $14.99
  { type: 'Child', price: 999, count: 0 },      // $9.99
  { type: 'Senior', price: 1299, count: 0 },    // $12.99
  { type: 'Student', price: 1199, count: 0 },   // $11.99
];

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([...defaultTickets]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const { toast } = useToast();

  const updateTicketCount = (type: string, count: number) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.type === type ? { ...ticket, count } : ticket
      )
    );
  };

  const toggleSeatSelection = (seatNumber: string) => {
    // Check if the seat is already selected
    const seatIndex = selectedSeats.findIndex(
      (seat) => seat.seatNumber === seatNumber
    );

    if (seatIndex !== -1) {
      // Remove the seat if it's already selected
      setSelectedSeats(selectedSeats.filter((_, index) => index !== seatIndex));
      return;
    }

    // Calculate total tickets selected
    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.count, 0);

    // Don't allow selecting more seats than tickets
    if (selectedSeats.length >= totalTickets) {
      toast({
        title: 'Cannot select more seats',
        description: `You have only selected ${totalTickets} tickets`,
        variant: 'destructive',
      });
      return;
    }

    // Determine which ticket type to assign to this seat
    // Start with the most expensive ticket type that has remaining count
    let assignedType = '';
    let assignedPrice = 0;

    // Sort tickets by price (highest first)
    const sortedTickets = [...tickets].sort((a, b) => b.price - a.price);

    for (const ticket of sortedTickets) {
      // Count how many seats are already assigned to this ticket type
      const assignedCount = selectedSeats.filter(
        (seat) => seat.ticketType === ticket.type
      ).length;

      // If we haven't assigned all tickets of this type yet
      if (assignedCount < ticket.count) {
        assignedType = ticket.type;
        assignedPrice = ticket.price;
        break;
      }
    }

    if (!assignedType) {
      // This shouldn't happen if we check totalTickets correctly
      return;
    }

    // Add the new seat with the assigned ticket type
    setSelectedSeats([
      ...selectedSeats,
      {
        seatNumber,
        ticketType: assignedType,
        price: assignedPrice,
      },
    ]);
  };

  const getTotalPrice = () => {
    // Calculate the sum of prices for all selected seats
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const resetBooking = () => {
    setMovie(null);
    setSelectedDate(new Date());
    setSelectedShowtime(null);
    setTickets([...defaultTickets]);
    setSelectedSeats([]);
  };

  const confirmBooking = async (): Promise<number | null> => {
    if (!selectedShowtime || !movie || selectedSeats.length === 0) {
      toast({
        title: 'Cannot complete booking',
        description: 'Missing required booking information',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const response = await apiRequest('POST', '/api/bookings', {
        showtimeId: selectedShowtime.id,
        seats: selectedSeats,
        totalAmount: getTotalPrice(),
      });

      const data = await response.json();
      
      toast({
        title: 'Booking Successful',
        description: 'Your tickets have been booked successfully!',
      });
      
      return data.booking.id;
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'An error occurred while processing your booking',
        variant: 'destructive',
      });
      return null;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        movie,
        setMovie,
        selectedDate,
        setSelectedDate,
        selectedShowtime,
        setSelectedShowtime,
        tickets,
        updateTicketCount,
        selectedSeats,
        toggleSeatSelection,
        getTotalPrice,
        resetBooking,
        confirmBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
