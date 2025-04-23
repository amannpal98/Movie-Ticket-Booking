import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import { Download, Ticket } from "lucide-react";

interface BookingDetail {
  id: number;
  bookingReference: string;
  createdAt: string;
  status: string;
  showtime: {
    startTime: string;
  };
  movie: {
    title: string;
    rating: string;
    duration: number;
  };
  cinema: {
    name: string;
  };
  seats: Array<{
    seatNumber: string;
    ticketType: string;
  }>;
}

interface TicketCardProps {
  booking: BookingDetail;
  className?: string;
}

export default function TicketCard({ booking, className }: TicketCardProps) {
  // Group seats by row for better display
  const seatsByRow: Record<string, string[]> = {};
  
  booking.seats.forEach(seat => {
    const row = seat.seatNumber.charAt(0);
    const seatNum = seat.seatNumber.substring(1);
    
    if (!seatsByRow[row]) {
      seatsByRow[row] = [];
    }
    
    seatsByRow[row].push(seatNum);
  });

  // Format seats display
  const formattedSeats = Object.entries(seatsByRow).map(([row, seats]) => {
    // Sort seat numbers numerically
    const sortedSeats = seats.sort((a, b) => parseInt(a) - parseInt(b));
    return `Row ${row}, Seat${seats.length > 1 ? 's' : ''} ${sortedSeats.join(', ')}`;
  }).join('; ');

  // Count tickets by type
  const ticketTypes: Record<string, number> = {};
  booking.seats.forEach(seat => {
    if (!ticketTypes[seat.ticketType]) {
      ticketTypes[seat.ticketType] = 0;
    }
    ticketTypes[seat.ticketType]++;
  });

  const formattedTickets = Object.entries(ticketTypes)
    .map(([type, count]) => `${count} × ${type}`)
    .join(', ');

  const handleDownload = () => {
    // In a real application, this would generate and download a PDF ticket
    alert('Downloading ticket...');
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{booking.movie.title}</h3>
          <div className="text-accent text-sm flex items-center">
            <Ticket className="mr-1 h-4 w-4" /> PREMIUM
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <div className="text-gray-400 mb-1">Date & Time</div>
            <div className="font-medium">
              {formatDate(booking.showtime.startTime)}, {formatTime(booking.showtime.startTime)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Location</div>
            <div className="font-medium">{booking.cinema.name}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Seats</div>
            <div className="font-medium">{formattedSeats}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Booking ID</div>
            <div className="font-medium">#{booking.bookingReference}</div>
          </div>
          {ticketTypes && Object.keys(ticketTypes).length > 0 && (
            <div className="col-span-2">
              <div className="text-gray-400 mb-1">Tickets</div>
              <div className="font-medium">{formattedTickets}</div>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-center">
          {/* In a real app, this would be an actual QR code for the ticket */}
          <svg 
            className="h-24 w-24" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="10" y="10" width="30" height="30" fill="currentColor" />
            <rect x="60" y="10" width="30" height="30" fill="currentColor" />
            <rect x="10" y="60" width="30" height="30" fill="currentColor" />
            <rect x="45" y="45" width="10" height="10" fill="currentColor" />
            <rect x="60" y="60" width="10" height="10" fill="currentColor" />
            <rect x="75" y="60" width="15" height="10" fill="currentColor" />
            <rect x="60" y="75" width="30" height="15" fill="currentColor" />
          </svg>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button 
            variant="secondary" 
            onClick={handleDownload}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" /> Download Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
