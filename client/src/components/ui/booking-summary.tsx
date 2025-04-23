import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBooking } from "@/contexts/booking-context";
import { CalendarIcon, Clock, MapPin, Ticket, User } from "lucide-react";

interface BookingSummaryProps {
  showPrice?: boolean;
  showSeats?: boolean;
  className?: string;
}

export default function BookingSummary({ 
  showPrice = true, 
  showSeats = true,
  className 
}: BookingSummaryProps) {
  const { 
    movie, 
    selectedShowtime, 
    selectedSeats, 
    tickets,
    getTotalPrice 
  } = useBooking();

  if (!movie || !selectedShowtime) {
    return null;
  }

  // Group seats by row for better display
  const seatsByRow: Record<string, string[]> = {};
  
  if (showSeats && selectedSeats.length > 0) {
    selectedSeats.forEach(seat => {
      const row = seat.seatNumber.charAt(0);
      const seatNum = seat.seatNumber.substring(1);
      
      if (!seatsByRow[row]) {
        seatsByRow[row] = [];
      }
      
      seatsByRow[row].push(seatNum);
    });
  }

  // Format seats display
  const formattedSeats = Object.entries(seatsByRow).map(([row, seats]) => {
    // Sort seat numbers numerically
    const sortedSeats = seats.sort((a, b) => parseInt(a) - parseInt(b));
    return `Row ${row}, Seat${seats.length > 1 ? 's' : ''} ${sortedSeats.join(', ')}`;
  }).join('; ');

  // Count tickets by type
  const ticketCounts = tickets
    .filter(ticket => ticket.count > 0)
    .map(ticket => `${ticket.count} × ${ticket.type}`);

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-16 h-24 object-cover rounded mr-4" 
          />
          <div>
            <h4 className="font-bold">{movie.title}</h4>
            <div className="text-sm text-gray-400 mb-1">
              {movie.rating} | {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <MapPin className="text-accent mr-1 h-4 w-4" />
              {selectedShowtime.cinema?.name}
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center text-gray-400">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date & Time:
            </div>
            <div className="font-medium">
              {formatDate(selectedShowtime.startTime)}, {formatTime(selectedShowtime.startTime)}
            </div>
          </div>
          
          {showSeats && selectedSeats.length > 0 && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center text-gray-400">
                <Ticket className="mr-2 h-4 w-4" />
                Seats:
              </div>
              <div className="font-medium text-right">
                {formattedSeats}
              </div>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center text-gray-400">
              <User className="mr-2 h-4 w-4" />
              Tickets:
            </div>
            <div className="font-medium">
              {ticketCounts.join(', ') || 'No tickets selected'}
            </div>
          </div>
        </div>
        
        {showPrice && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-2">
              {tickets.map(ticket => ticket.count > 0 ? (
                <div key={ticket.type} className="flex justify-between text-sm">
                  <div>{ticket.type} ({formatCurrency(ticket.price)} × {ticket.count})</div>
                  <div>{formatCurrency(ticket.price * ticket.count)}</div>
                </div>
              ) : null)}
              
              <div className="flex justify-between text-sm">
                <div>Booking Fee</div>
                <div>{formatCurrency(200)}</div>
              </div>
              
              <div className="flex justify-between text-sm">
                <div>Taxes</div>
                <div>{formatCurrency(Math.round(getTotalPrice() * 0.1))}</div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold">
                <div>Total</div>
                <div>{formatCurrency(getTotalPrice() + 200 + Math.round(getTotalPrice() * 0.1))}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
